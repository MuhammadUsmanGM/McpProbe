import { spawn, ChildProcess } from 'child_process';
import fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';
import { RepoMetadata, ServerTransport, ConnectionResult } from '../types';
import { parseTools } from './parser';

const TIMEOUT_MS = 15000;

/**
 * Send a JSON-RPC message over stdio and wait for a response.
 */
function sendJsonRpc(
  proc: ChildProcess,
  method: string,
  params: Record<string, any> = {},
  id: number = 1
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`JSON-RPC timeout waiting for response to "${method}"`));
    }, TIMEOUT_MS);

    let buffer = '';

    const onData = (data: Buffer) => {
      buffer += data.toString();

      // Try to parse complete JSON-RPC responses from buffer
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
async function connectStdio(repo: RepoMetadata): Promise<ConnectionResult> {
  const startTime = Date.now();
  let proc: ChildProcess | null = null;

  try {
    const pkgName = repo.packageJson?.name || repo.name;

    // Determine how to spawn the server
    let command: string;
    let args: string[];

    if (repo.isLocal && repo.localPath) {
      // Local: install deps if needed, then run
      const nodeModules = path.join(repo.localPath, 'node_modules');
      if (!fs.existsSync(nodeModules)) {
        // Run npm install first
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
          install.on('error', reject);
        });
      }

      // Find the entry point
      const mainEntry = repo.packageJson?.main || 'index.js';
      const entryPath = path.join(repo.localPath, mainEntry);

      command = 'node';
      args = [entryPath];
    } else {
      // Remote: use npx
      command = 'npx';
      args = ['-y', pkgName];
    }

    proc = spawn(command, args, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Handle process errors
    proc.on('error', () => {});

    // Initialize
    const initResponse = await sendJsonRpc(proc, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcpprobe', version: '1.0.0' },
    }, 1);

    // Send initialized notification
    proc.stdin?.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    }) + '\n');

    // List tools
    const toolsResponse = await sendJsonRpc(proc, 'tools/list', {}, 2);

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
async function connectHttp(repo: RepoMetadata): Promise<ConnectionResult> {
  const startTime = Date.now();

  try {
    // Try common MCP HTTP endpoints
    const baseUrls: string[] = [];

    if (repo.isLocal) {
      baseUrls.push('http://localhost:3000', 'http://localhost:8000', 'http://localhost:8080');
    } else {
      // Try to find URL hints in README
      const urlMatch = repo.readmeContent.match(/https?:\/\/[^\s)]+/g);
      if (urlMatch) {
        baseUrls.push(...urlMatch.filter(u => !u.includes('github.com')));
      }
      baseUrls.push('http://localhost:3000');
    }

    for (const baseUrl of baseUrls) {
      try {
        // Try MCP endpoint
        const res = await fetch(`${baseUrl}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: {},
          }),
          // @ts-ignore - timeout option
          timeout: TIMEOUT_MS,
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const rawTools = data?.result?.tools || [];
          const tools = parseTools(rawTools);
          const latencyMs = Date.now() - startTime;

          return { tools, latencyMs, connected: true };
        }
      } catch {
        // Try next URL
      }
    }

    return {
      tools: [],
      latencyMs: Date.now() - startTime,
      connected: false,
      error: 'Could not connect to HTTP MCP server. Ensure it is running.',
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
  transport: ServerTransport
): Promise<ConnectionResult> {
  if (transport === 'stdio') {
    return connectStdio(repo);
  }

  if (transport === 'http') {
    return connectHttp(repo);
  }

  // Unknown transport — try stdio first, then HTTP
  const stdioResult = await connectStdio(repo);
  if (stdioResult.connected) {
    return stdioResult;
  }

  return connectHttp(repo);
}
