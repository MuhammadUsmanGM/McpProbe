import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { RepoMetadata, PackageJsonData } from '../types';

interface GitHubRepoResponse {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  default_branch: string;
  html_url: string;
}

/**
 * Parse a GitHub URL into owner/repo.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // github.com/owner/repo
  const patterns = [
    /(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/\s.]+?)(?:\.git)?(?:\/.*)?$/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }
  return null;
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
async function fetchGitHubRepo(owner: string, repo: string): Promise<RepoMetadata> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const repoRes = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'mcpprobe-cli',
    },
  });

  if (!repoRes.ok) {
    throw new Error(`GitHub API returned ${repoRes.status}: ${repoRes.statusText}`);
  }

  const repoData = (await repoRes.json()) as GitHubRepoResponse;

  // Fetch package.json
  let packageJson: PackageJsonData | null = null;
  try {
    const pkgUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/package.json`;
    const pkgRes = await fetch(pkgUrl);
    if (pkgRes.ok) {
      packageJson = (await pkgRes.json()) as PackageJsonData;
    }
  } catch {
    // package.json not found, that's ok
  }

  // Fetch README
  let readmeContent = '';
  try {
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/README.md`;
    const readmeRes = await fetch(readmeUrl);
    if (readmeRes.ok) {
      readmeContent = await readmeRes.text();
    }
  } catch {
    // README not found
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

  return fetchGitHubRepo(parsed.owner, parsed.repo);
}
