import { RepoMetadata } from '../types';

/**
 * Generate config snippets for each AI client.
 */
export function generateConfigs(repo: RepoMetadata): Record<string, string> {
  const serverName = repo.packageJson?.name || repo.name;
  const configs: Record<string, string> = {};

  configs['claude'] = generateClaudeConfig(serverName);
  configs['cursor'] = generateCursorConfig(serverName);
  configs['windsurf'] = generateWindsurfConfig(serverName);
  configs['cline'] = generateClineConfig(serverName);

  return configs;
}

function generateClaudeConfig(serverName: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [serverName]: {
          command: 'npx',
          args: ['-y', serverName],
        },
      },
    },
    null,
    2
  );
}

function generateCursorConfig(serverName: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [serverName]: {
          command: 'npx',
          args: ['-y', serverName],
        },
      },
    },
    null,
    2
  );
}

function generateWindsurfConfig(serverName: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [serverName]: {
          command: 'npx',
          args: ['-y', serverName],
        },
      },
    },
    null,
    2
  );
}

function generateClineConfig(serverName: string): string {
  return JSON.stringify(
    {
      'cline.mcpServers': {
        [serverName]: {
          command: 'npx',
          args: ['-y', serverName],
        },
      },
    },
    null,
    2
  );
}

/**
 * Get the file path hint for where each client stores its config.
 */
export function getConfigFilePath(client: string): string {
  switch (client.toLowerCase()) {
    case 'claude':
      return '~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n  %APPDATA%\\Claude\\claude_desktop_config.json (Windows)';
    case 'cursor':
      return '.cursor/mcp.json (project root)';
    case 'windsurf':
      return '~/.windsurf/mcp_config.json';
    case 'cline':
      return 'VS Code settings.json → "cline.mcpServers"';
    default:
      return '';
  }
}
