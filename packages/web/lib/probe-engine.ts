import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { RepoMetadata, PackageJsonData, ServerTransport, ConnectionResult, Tool, ToolInput } from './types';

const TIMEOUT_MS = 15000;

/**
 * GitHub API & Repo Metadata Fetching
 */

interface GitHubRepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  default_branch: string;
  html_url: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/\s.]+?)(?:\.git)?(?:\/.*)?$/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return { owner: match[1], repo: match[2] };
  }
  return null;
}

async function fetchGitHubRepo(owner: string, repo: string): Promise<RepoMetadata> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const repoRes = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'mcpprobe-web',
    },
  });

  if (!repoRes.ok) throw new Error(`GitHub API returned ${repoRes.status}: ${repoRes.statusText}`);
  const repoData = (await repoRes.json()) as GitHubRepoResponse;

  let packageJson: PackageJsonData | null = null;
  try {
    const pkgUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/package.json`;
    const pkgRes = await fetch(pkgUrl);
    if (pkgRes.ok) packageJson = (await pkgRes.json()) as PackageJsonData;
  } catch {}

  let readmeContent = '';
  try {
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/README.md`;
    const readmeRes = await fetch(readmeUrl);
    if (readmeRes.ok) readmeContent = await readmeRes.text();
  } catch {}

  return {
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description || '',
    stars: repoData.stargazers_count,
    defaultBranch: repoData.default_branch,
    url: repoData.html_url,
    packageJson,
    readmeContent,
    isLocal: false,
  };
}

export async function fetchRepoMetadata(input: string): Promise<RepoMetadata> {
  const parsed = parseGitHubUrl(input);
  if (!parsed) throw new Error(`Invalid GitHub URL: "${input}"`);
  return fetchGitHubRepo(parsed.owner, parsed.repo);
}

/**
 * Transport Detection
 */

export function detectTransport(repo: RepoMetadata): ServerTransport {
  const pkg = repo.packageJson;
  const readme = repo.readmeContent.toLowerCase();
  let stdioSignals = 0;
  let httpSignals = 0;

  if (pkg) {
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    if (allDeps['@modelcontextprotocol/sdk']) stdioSignals += 1;
    const httpFrameworks = ['express', 'fastify', 'hono', 'koa', '@hono/node-server'];
    for (const fw of httpFrameworks) if (allDeps[fw]) httpSignals += 2;

    const scripts = pkg.scripts || {};
    const allScripts = Object.values(scripts).join(' ').toLowerCase();
    if (allScripts.includes('stdio') || allScripts.includes('--stdio')) stdioSignals += 3;
    if (allScripts.includes('server') || allScripts.includes('http') || allScripts.includes('sse')) httpSignals += 1;
  }

  if (readme.includes('stdio')) stdioSignals += 1;
  if (readme.includes('--transport stdio')) stdioSignals += 3;
  if (readme.includes('sse') || readme.includes('http transport')) httpSignals += 2;
  if (readme.includes('--transport http')) httpSignals += 3;

  if (stdioSignals === 0 && httpSignals === 0) {
    if (pkg?.dependencies?.['@modelcontextprotocol/sdk']) return 'stdio';
    return 'unknown';
  }
  return httpSignals > stdioSignals ? 'http' : 'stdio';
}

/**
 * Tool Parsing
 */

function parseInputSchema(schema: any): ToolInput[] {
  if (!schema || typeof schema !== 'object') return [];
  const properties = schema.properties || {};
  const required = new Set<string>(Array.isArray(schema.required) ? schema.required : []);
  return Object.entries(properties).map(([name, prop]: [string, any]) => ({
    name,
    type: prop?.type || 'unknown',
    description: prop?.description,
    required: required.has(name),
  }));
}

export function parseTools(rawTools: any[]): Tool[] {
  if (!Array.isArray(rawTools)) return [];
  return rawTools.map((raw) => {
    if (!raw || typeof raw !== 'object' || !raw.name) return null;
    return {
      name: raw.name,
      description: raw.description,
      inputSchema: raw.inputSchema || raw.input_schema || null,
      inputs: parseInputSchema(raw.inputSchema || raw.input_schema),
    };
  }).filter(Boolean) as Tool[];
}

/**
 * Server Connection
 */

function sendJsonRpc(proc: ChildProcess, method: string, params: any = {}, id: number = 1): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`JSON-RPC timeout: ${method}`)), TIMEOUT_MS);
    let buffer = '';
    const onData = (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line.trim());
          if (parsed.id === id || parsed.result !== undefined) {
            clearTimeout(timeout);
            proc.stdout?.removeListener('data', onData);
            resolve(parsed);
            return;
          }
        } catch {}
      }
    };
    proc.stdout?.on('data', onData);
    proc.stdin?.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}

async function connectStdio(repo: RepoMetadata): Promise<ConnectionResult> {
  const startTime = Date.now();
  let proc: ChildProcess | null = null;
  try {
    const pkgName = repo.packageJson?.name || repo.name;
    // Note: In server environment, npx must be available
    proc = spawn('npx', ['-y', pkgName], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
    
    await sendJsonRpc(proc, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcpprobe-web', version: '1.0.0' },
    }, 1);
    
    proc.stdin?.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    const toolsResponse = await sendJsonRpc(proc, 'tools/list', {}, 2);
    
    return {
      tools: parseTools(toolsResponse?.result?.tools || []),
      latencyMs: Date.now() - startTime,
      connected: true,
    };
  } catch (error) {
    return {
      tools: [],
      latencyMs: Date.now() - startTime,
      connected: false,
      error: (error as Error).message,
    };
  } finally {
    proc?.kill('SIGTERM');
  }
}

async function connectHttp(repo: RepoMetadata): Promise<ConnectionResult> {
  const startTime = Date.now();
  try {
    // Basic heuristics for finding HTTP endpoint from README
    const urls = (repo.readmeContent.match(/https?:\/\/[^\s)]+/g) || []).filter(u => !u.includes('github.com'));
    if (urls.length === 0) urls.push('http://localhost:3000'); // Default fallback

    for (const url of urls) {
      try {
        const res = await fetch(`${url}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
          // signal: AbortSignal.timeout(TIMEOUT_MS) // Node 18+
        });
        if (res.ok) {
          const data = await res.json() as any;
          return { tools: parseTools(data?.result?.tools || []), latencyMs: Date.now() - startTime, connected: true };
        }
      } catch {}
    }
    return { tools: [], latencyMs: Date.now() - startTime, connected: false, error: 'Could not connect' };
  } catch (error) {
    return { tools: [], latencyMs: Date.now() - startTime, connected: false, error: (error as Error).message };
  }
}

export async function connectToServer(repo: RepoMetadata, transport: ServerTransport): Promise<ConnectionResult> {
  if (transport === 'stdio') return connectStdio(repo);
  if (transport === 'http') return connectHttp(repo);
  const stdio = await connectStdio(repo);
  return stdio.connected ? stdio : connectHttp(repo);
}

import { scoreServer } from './scorer';
import { checkCompatibility } from './compat';
import { generateConfigs } from './config-generator';

export async function analyzeServer(url: string) {
  const repo = await fetchRepoMetadata(url);
  const transport = detectTransport(repo);
  const connection = await connectToServer(repo, transport);
  const tools = connection.tools;
  const score = scoreServer(repo, tools, connection);
  const compatibility = checkCompatibility(transport, tools, connection);
  const configs = generateConfigs(repo);

  return {
    repo_url: url,
    repo_name: repo.name,
    repo_description: repo.description,
    stars: repo.stars,
    transport,
    tools: JSON.stringify(tools),
    compatibility: JSON.stringify(compatibility),
    score: score.total,
    score_breakdown: JSON.stringify(score.breakdown),
    grade: score.grade,
    probed_at: new Date().toISOString()
  };
}


