import { RepoMetadata } from '../types';
import { CLIENT_DEFINITIONS } from '../clients';

/**
 * Generate config snippets for each AI client.
 */
export function generateConfigs(repo: RepoMetadata): Record<string, string> {
  const serverName = repo.packageJson?.name || repo.name;
  const configs: Record<string, string> = {};
  for (const client of CLIENT_DEFINITIONS) {
    configs[client.key] = client.generateConfig(serverName);
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
