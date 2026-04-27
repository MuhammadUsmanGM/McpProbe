import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { RepoMetadata, PackageJsonData } from '../types';

let cachedGhToken: string | null | undefined;

/**
 * Resolve a token from `gh auth token` if the gh CLI is installed and logged in.
 * Cached for the process lifetime; returns null on any failure.
 */
function tryGhCliToken(): string | null {
  if (cachedGhToken !== undefined) return cachedGhToken;
  try {
    const out = execFileSync('gh', ['auth', 'token'], {
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 2000,
    })
      .toString()
      .trim();
    cachedGhToken = out || null;
  } catch {
    cachedGhToken = null;
  }
  return cachedGhToken;
}

interface GitHubRepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  default_branch: string;
  html_url: string;
}

/**
 * Get GitHub auth headers if a token is available.
 */
function getGitHubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || tryGhCliToken();
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'mcpprobe-cli',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
}

/**
 * Parse a GitHub URL into owner/repo.
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string; ref?: string; subPath?: string } | null {
  // Handle formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // https://github.com/owner/repo/tree/<ref>/<subpath>
  // https://github.com/owner/repo/blob/<ref>/<subpath>
  // github.com/owner/repo
  const base = /(?:https?:\/\/)?github\.com\/([^/\s]+)\/([^/\s.]+?)(?:\.git)?(?:\/(.*))?$/i;
  const match = url.match(base);
  if (!match) return null;

  const [, owner, repo, rest] = match;
  if (!rest) return { owner, repo };

  const treeMatch = rest.match(/^(?:tree|blob)\/([^/]+)(?:\/(.*))?$/i);
  if (treeMatch) {
    const [, ref, subPath] = treeMatch;
    return {
      owner,
      repo,
      ref,
      subPath: subPath ? subPath.replace(/\/$/, '') : undefined,
    };
  }

  return { owner, repo };
}

/**
 * Check if the input is a local path.
 */
export function isLocalPath(input: string): boolean {
  return input.startsWith('.') || input.startsWith('/') || input.startsWith('\\') || /^[a-zA-Z]:/.test(input);
}

/**
 * Fetch repo metadata from GitHub API.
 */
async function fetchGitHubRepo(
  owner: string,
  repo: string,
  ref?: string,
  subPath?: string
): Promise<RepoMetadata> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = getGitHubHeaders();

  const repoRes = await fetch(apiUrl, { headers });

  if (!repoRes.ok) {
    const hasToken = !!(
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      tryGhCliToken()
    );

    if (repoRes.status === 403) {
      const hint = hasToken
        ? 'Your token may be invalid or lack permissions.'
        : 'You may have hit the GitHub API rate limit (60 req/hr). Set GITHUB_TOKEN/GH_TOKEN, or run `gh auth login`.';
      throw new Error(`GitHub API rate limited (403). ${hint}`);
    }

    if (repoRes.status === 404) {
      const hint = hasToken
        ? 'The repository may not exist or your token lacks access.'
        : 'The repository may be private. Set GITHUB_TOKEN/GH_TOKEN, or run `gh auth login`.';
      throw new Error(`Repository not found (404): ${owner}/${repo}. ${hint}`);
    }

    throw new Error(`GitHub API returned ${repoRes.status}: ${repoRes.statusText}`);
  }

  const repoData = (await repoRes.json()) as GitHubRepoResponse;
  const branch = ref || repoData.default_branch;
  const prefix = subPath ? `${subPath.replace(/^\/+|\/+$/g, '')}/` : '';

  // Fetch package.json (subpath-aware)
  let packageJson: PackageJsonData | null = null;
  try {
    const pkgUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${prefix}package.json`;
    const pkgRes = await fetch(pkgUrl, { headers });
    if (pkgRes.ok) {
      packageJson = (await pkgRes.json()) as PackageJsonData;
    }
  } catch {
    // package.json not found, that's ok
  }

  // Fetch README (subpath-aware, fall back to repo root)
  let readmeContent = '';
  const readmeCandidates = prefix
    ? [
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${prefix}README.md`,
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
      ]
    : [`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`];

  for (const readmeUrl of readmeCandidates) {
    try {
      const readmeRes = await fetch(readmeUrl, { headers });
      if (readmeRes.ok) {
        readmeContent = await readmeRes.text();
        break;
      }
    } catch {
      // continue
    }
  }

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
    subPath: subPath || undefined,
  };
}

/**
 * Fetch metadata from a local directory.
 */
function fetchLocalRepo(localPath: string): RepoMetadata {
  const absPath = path.resolve(localPath);

  if (!fs.existsSync(absPath)) {
    throw new Error(`Local path does not exist: ${absPath}`);
  }

  let packageJson: PackageJsonData | null = null;
  const pkgPath = path.join(absPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  }

  let readmeContent = '';
  const readmePath = path.join(absPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  }

  const name = packageJson?.name || path.basename(absPath);

  return {
    name,
    fullName: name,
    description: packageJson?.description || '',
    stars: 0,
    defaultBranch: '',
    url: absPath,
    packageJson,
    readmeContent,
    isLocal: true,
    localPath: absPath,
  };
}

/**
 * Main fetch function — handles both GitHub URLs and local paths.
 */
export async function fetchRepoMetadata(input: string): Promise<RepoMetadata> {
  if (isLocalPath(input)) {
    return fetchLocalRepo(input);
  }

  const parsed = parseGitHubUrl(input);
  if (!parsed) {
    throw new Error(
      `Invalid input: "${input}"\nExpected a GitHub URL (https://github.com/owner/repo) or a local path (./path/to/server)`
    );
  }

  return fetchGitHubRepo(parsed.owner, parsed.repo, parsed.ref, parsed.subPath);
}
