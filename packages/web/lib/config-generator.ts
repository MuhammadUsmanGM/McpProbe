import { RepoMetadata } from './types';

/**
 * Generate config snippets for each AI client.
 */
export function generateConfigs(repo: RepoMetadata): Record<string, string> {
  const serverName = repo.packageJson?.name || repo.name;
  const configs: Record<string, string> = {};

  configs['claude'] = generateClaudeConfig(serverName);
  configs['claude-code'] = generateClaudeCodeConfig(serverName);
  configs['cursor'] = generateCursorConfig(serverName);
  configs['windsurf'] = generateWindsurfConfig(serverName);
  configs['cline'] = generateClineConfig(serverName);
  configs['vscode'] = generateVSCodeConfig(serverName);
  configs['codex'] = generateCodexConfig(serverName);
  configs['gemini'] = generateGeminiConfig(serverName);
  configs['goose'] = generateGooseConfig(serverName);
  configs['continue'] = generateContinueConfig(serverName);
  configs['zed'] = generateZedConfig(serverName);
  configs['amp'] = generateAmpConfig(serverName);
  configs['jetbrains'] = generateJetBrainsConfig(serverName);

  return configs;
}

function generateClaudeConfig(serverName: string): string {
  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateClaudeCodeConfig(serverName: string): string {
  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateCursorConfig(serverName: string): string {
  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateWindsurfConfig(serverName: string): string {
  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateClineConfig(serverName: string): string {
  return JSON.stringify({
    'cline.mcpServers': {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateVSCodeConfig(serverName: string): string {
  return JSON.stringify({
    servers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateCodexConfig(serverName: string): string {
  return `[mcp_servers.${serverName}]\ncommand = "npx"\nargs = ["-y", "${serverName}"]`;
}

function generateGeminiConfig(serverName: string): string {
  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateGooseConfig(serverName: string): string {
  return `extensions:\n  ${serverName}:\n    name: ${serverName}\n    cmd: npx\n    args: ["-y", "${serverName}"]\n    enabled: true\n    type: stdio`;
}

function generateContinueConfig(serverName: string): string {
  return `name: ${serverName} MCP\nversion: 0.0.1\nschema: v1\nmcpServers:\n  - name: ${serverName}\n    command: npx\n    args:\n      - "-y"\n      - "${serverName}"`;
}

function generateZedConfig(serverName: string): string {
  return JSON.stringify({
    context_servers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateAmpConfig(serverName: string): string {
  return JSON.stringify({
    'amp.mcpServers': {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

function generateJetBrainsConfig(serverName: string): string {
  return JSON.stringify({
    mcpServers: {
      [serverName]: {
        command: 'npx',
        args: ['-y', serverName],
      },
    },
  }, null, 2);
}

export function getConfigFilePath(client: string): string {
  switch (client.toLowerCase()) {
    case 'claude': return '~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n  %APPDATA%\\Claude\\claude_desktop_config.json (Windows)';
    case 'claude-code': return '.mcp.json (project) or ~/.claude.json (global)';
    case 'cursor': return '.cursor/mcp.json (project root)';
    case 'windsurf': return '~/.windsurf/mcp_config.json';
    case 'cline': return 'VS Code settings.json → "cline.mcpServers"';
    case 'vscode': return '.vscode/mcp.json (workspace) or User Profile mcp.json (global)';
    case 'codex': return '~/.codex/config.toml (global) or .codex/config.toml (project)';
    case 'gemini': return '~/.gemini/settings.json (global) or .gemini/settings.json (project)';
    case 'goose': return '~/.config/goose/config.yaml';
    case 'continue': return '.continue/mcpServers/*.yaml (workspace) or ~/.continue/config.yaml (global)';
    case 'zed': return '~/.config/zed/settings.json (macOS/Linux)\n  %APPDATA%\\Zed\\settings.json (Windows)';
    case 'amp': return '~/.config/amp/settings.json';
    case 'jetbrains': return 'IDE Settings → Tools → AI Assistant → MCP';
    default: return '';
  }
}
