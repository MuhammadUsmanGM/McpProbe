import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';
import fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';
import { RepoMetadata, ServerTransport, ConnectionResult } from '../types';
import { parseTools } from './parser';

const TIMEOUT_MS = 10000;
const HTTP_PER_URL_TIMEOUT_MS = 3000;
const MAX_HTTP_URLS_TO_TRY = 5;

export interface ConnectorOptions {
  skipConfirm?: boolean;
  explicitUrl?: string;
}

/**
 * Discover candidate remote MCP endpoint URLs from README and package.json.
 * Looks for typical MCP endpoint patterns rather than every URL in the doc.
 */
export function discoverRemoteUrls(repo: RepoMetadata): string[] {
  const candidates = new Set<string>();
  const haystack = [
    repo.readmeContent,
    repo.packageJson ? JSON.stringify(repo.packageJson) : '',
  ].join('\n');

  // Match https URLs that look like MCP/SSE endpoints
  const urlRegex = /https?:\/\/[^\s"'`<>)\]}]+/g;
  const matches = haystack.match(urlRegex) || [];

  for (const raw of matches) {
    const url = raw.replace(/[.,;:!?)]+$/, '');
    const lower = url.toLowerCase();

    // Endpoint-shaped: ends with /mcp, /mcp/, /sse, or /sse/ (with optional trailing path segment)
    const looksLikeEndpoint = /\/(mcp|sse)\/?$/.test(lower);
    if (!looksLikeEndpoint) continue;

    // Skip noisy docs/CDN/install-link domains
    if (
      lower.includes('github.com') ||
      lower.includes('npmjs.com') ||
      lower.includes('modelcontextprotocol.io') ||
      lower.includes('vscode.dev') ||
      lower.includes('cursor.com/install') ||
      lower.includes('insiders.vscode') ||
      lower.includes('.svg') ||
      lower.includes('.png') ||
      url.includes('?') // installer redirect URLs are query-heavy
    ) {
      continue;
    }
    candidates.add(url);
  }

  // Prefer shorter, root-ish endpoints first
  return Array.from(candidates).sort((a, b) => a.length - b.length);
}

/**
 * Prompt the user for confirmation before executing a command.
 */
function confirmExecution(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stderr,
    });

    const fullCmd = `${command} ${args.join(' ')}`;
    console.error(`\n\x1b[33m⚠  This will execute: ${fullCmd}\x1b[0m`);
    console.error(`\x1b[90m   This downloads and runs code from npm.\x1b[0m`);

    rl.question('   Proceed? (y/N) ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

/**
 * Fetch with an AbortController timeout.
 */
async function fetchWithTimeout(url: string, options: any, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Send a JSON-RPC message over stdio and wait for a response.
 */
function sendJsonRpc(
  proc: ChildProcess,
  method: string,
  params: Record<string, any> = {},
  id: number = 1,
  stderrChunks: string[] = []
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const stderrOutput = stderrChunks.join('').trim();
      const detail = stderrOutput ? `\nServer stderr: ${stderrOutput}` : '';
      reject(new Error(`JSON-RPC timeout waiting for response to "${method}" (${TIMEOUT_MS}ms)${detail}`));
    }, TIMEOUT_MS);

    let buffer = '';

    const onData = (data: Buffer) => {
      buffer += data.toString();

      const lines = buffer.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.id === id || parsed.result !== undefined) {
            clearTimeout(timeout);
            proc.stdout?.removeListener('data', onData);
            resolve(parsed);
            return;
          }
        } catch {
          // Not valid JSON yet, continue buffering
        }
      }
    };

    proc.stdout?.on('data', onData);

    const message = JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params,
    });

    proc.stdin?.write(message + '\n');
  });
}

/**
 * Connect to a stdio MCP server.
 */
async function connectStdio(repo: RepoMetadata, options: ConnectorOptions = {}): Promise<ConnectionResult> {
  const startTime = Date.now();
  let proc: ChildProcess | null = null;

  try {
    const pkgName = repo.packageJson?.name || repo.name;

    let command: string;
    let args: string[];

    if (repo.isLocal && repo.localPath) {
      // Local: install deps if needed, then run
      const nodeModules = path.join(repo.localPath, 'node_modules');
      if (!fs.existsSync(nodeModules)) {
        await new Promise<void>((resolve, reject) => {
          const install = spawn('npm', ['install'], {
            cwd: repo.localPath,
            shell: true,
            stdio: 'pipe',
          });
          install.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`npm install failed with code ${code}`));
          });
          install.on('error', (err) => reject(new Error(`Failed to run npm install: ${err.message}`)));
        });
      }

      const mainEntry = repo.packageJson?.main || 'index.js';
      const entryPath = path.join(repo.localPath, mainEntry);

      command = 'node';
      args = [entryPath];
    } else {
      // Remote: use npx — confirm with user first
      command = 'npx';
      args = ['-y', pkgName];

      if (!options.skipConfirm) {
        const confirmed = await confirmExecution(command, args);
        if (!confirmed) {
          return {
            tools: [],
            latencyMs: Date.now() - startTime,
            connected: false,
            error: 'User declined to execute npx command. Use --yes to skip this prompt.',
          };
        }
      }
    }

    proc = spawn(command, args, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Capture stderr for diagnostics
    const stderrChunks: string[] = [];
    proc.stderr?.on('data', (data: Buffer) => {
      stderrChunks.push(data.toString());
    });

    // Handle process spawn errors
    const spawnError = new Promise<never>((_, reject) => {
      proc!.on('error', (err) => {
        reject(new Error(`Failed to spawn "${command}": ${err.message}`));
      });
    });

    // Race between spawn error and normal flow
    const initPromise = sendJsonRpc(proc, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcpprobe', version: '1.1.0' },
    }, 1, stderrChunks);

    await Promise.race([initPromise, spawnError]);

    // Send initialized notification
    proc.stdin?.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    }) + '\n');

    // List tools
    const toolsResponse = await Promise.race([
      sendJsonRpc(proc, 'tools/list', {}, 2, stderrChunks),
      spawnError,
    ]);

    const latencyMs = Date.now() - startTime;
    const rawTools = toolsResponse?.result?.tools || [];
    const tools = parseTools(rawTools);

    return {
      tools,
      latencyMs,
      connected: true,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      tools: [],
      latencyMs,
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (proc) {
      try {
        proc.kill('SIGTERM');
      } catch {
        // Process may have already exited
      }
    }
  }
}

/**
 * Connect to an HTTP/SSE MCP server.
 */
async function tryHttpEndpoint(url: string): Promise<{ tools: any[] } | null> {
  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {},
        }),
      },
      HTTP_PER_URL_TIMEOUT_MS
    );

    if (!res.ok) return null;

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as any;
      return { tools: data?.result?.tools || [] };
    }
    // SSE / streamable HTTP — best-effort parse of first JSON event
    const text = await res.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    try {
      const data = JSON.parse(jsonMatch[0]);
      return { tools: data?.result?.tools || [] };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function connectHttp(
  repo: RepoMetadata,
  options: ConnectorOptions = {}
): Promise<ConnectionResult> {
  const startTime = Date.now();
  const tried: string[] = [];

  try {
    const candidates: string[] = [];

    // 1. Explicit --url wins
    if (options.explicitUrl) {
      candidates.push(options.explicitUrl);
    } else {
      // 2. URLs scraped from README/package.json (remote repos only)
      if (!repo.isLocal) {
        const discovered = discoverRemoteUrls(repo);
        for (const u of discovered) {
          // Try as-is, plus common path append if no /mcp at end
          candidates.push(u);
          if (!/\/(mcp|sse)\/?$/i.test(u)) {
            candidates.push(u.replace(/\/$/, '') + '/mcp');
          }
        }
      }
      // 3. Localhost fallbacks (always — server may be running locally)
      for (const port of [3000, 8000, 8080]) {
        candidates.push(`http://localhost:${port}/mcp`);
      }
    }

    const urlsToTry = candidates.slice(0, MAX_HTTP_URLS_TO_TRY);

    for (const url of urlsToTry) {
      tried.push(url);
      const result = await tryHttpEndpoint(url);
      if (result) {
        return {
          tools: parseTools(result.tools),
          latencyMs: Date.now() - startTime,
          connected: true,
        };
      }
    }

    const triedDetail = tried.length ? ` Tried: ${tried.join(', ')}` : '';
    const hint = options.explicitUrl
      ? ''
      : ' Pass --url <endpoint> if the server is hosted remotely, or start it locally.';
    return {
      tools: [],
      latencyMs: Date.now() - startTime,
      connected: false,
      error: `Could not reach an HTTP MCP endpoint.${hint}${triedDetail}`,
    };
  } catch (error) {
    return {
      tools: [],
      latencyMs: Date.now() - startTime,
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main connector — dispatches to stdio or HTTP based on transport.
 */
export async function connectToServer(
  repo: RepoMetadata,
  transport: ServerTransport,
  options: ConnectorOptions = {}
): Promise<ConnectionResult> {
  if (transport === 'stdio') {
    return connectStdio(repo, options);
  }

  if (transport === 'http') {
    return connectHttp(repo, options);
  }

  // Unknown transport — try stdio first, then HTTP
  const stdioResult = await connectStdio(repo, options);
  if (stdioResult.connected) {
    return stdioResult;
  }

  return connectHttp(repo, options);
}
