import fetch from 'node-fetch';
import { RepoMetadata, InstallationProfile, InstallStrategy } from '../types';
import { CLIENT_DEFINITIONS } from '../clients';

/**
 * Quick-and-cheap check that a name is published on npm.
 */
async function isPublishedOnNpm(name: string): Promise<boolean> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
      method: 'HEAD',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Build an installation profile from repo metadata + connection state.
 * Order of preference: explicit remote URL > docker > npm package > unknown.
 */
export async function buildInstallProfile(
  repo: RepoMetadata,
  remoteUrl?: string
): Promise<InstallationProfile> {
  const packageName = repo.packageJson?.name || repo.name;

  if (remoteUrl) {
    return { strategy: 'http', remoteUrl, packageName };
  }

  // npm published? (package.json must declare "bin" or have a real name on npm)
  const hasBin = !!repo.packageJson?.bin;
  if (hasBin && repo.packageJson?.name) {
    const published = await isPublishedOnNpm(repo.packageJson.name);
    if (published) {
      return { strategy: 'npx', packageName: repo.packageJson.name };
    }
  }

  if (repo.hasDockerfile) {
    return {
      strategy: 'docker',
      packageName,
      dockerImage: repo.dockerImageHint,
    };
  }

  // Best-effort: npm name might still be valid even without bin
  if (repo.packageJson?.name) {
    const published = await isPublishedOnNpm(repo.packageJson.name);
    if (published) {
      return { strategy: 'npx', packageName: repo.packageJson.name };
    }
  }

  return { strategy: 'unknown' as InstallStrategy, packageName };
}

/**
 * Generate config snippets for each AI client.
 */
export function generateConfigs(
  repo: RepoMetadata,
  profile: InstallationProfile
): Record<string, string> {
  const configs: Record<string, string> = {};
  for (const client of CLIENT_DEFINITIONS) {
    configs[client.key] = client.generateConfig(profile);
  }
  return configs;
}

/**
 * Get the file path hint for where each client stores its config.
 */
export function getConfigFilePath(client: string): string {
  const def = CLIENT_DEFINITIONS.find((c) => c.key === client.toLowerCase());
  return def?.configFilePath || '';
}
