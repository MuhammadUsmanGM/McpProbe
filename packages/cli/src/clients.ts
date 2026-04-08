import { ServerTransport } from './types';

export interface ClientDefinition {
  key: string;
  name: string;
  transports: ServerTransport[];
  warningCheck: 'descriptions' | 'inputTypes';
  configFormat: 'json' | 'toml' | 'yaml';
  configFilePath: string;
  generateConfig: (serverName: string) => string;
}

function jsonConfig(rootKey: string, serverName: string): string {
  return JSON.stringify({ [rootKey]: { [serverName]: { command: 'npx', args: ['-y', serverName] } } }, null, 2);
}

export const CLIENT_DEFINITIONS: ClientDefinition[] = [
  {
    key: 'claude',
    name: 'Claude Desktop',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n  %APPDATA%\\Claude\\claude_desktop_config.json (Windows)',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'claude-code',
    name: 'Claude Code',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '.mcp.json (project) or ~/.claude.json (global)',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'cursor',
    name: 'Cursor',
    transports: ['stdio', 'http'],
    warningCheck: 'inputTypes',
    configFormat: 'json',
    configFilePath: '.cursor/mcp.json (project root)',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'windsurf',
    name: 'Windsurf',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.windsurf/mcp_config.json',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'cline',
    name: 'Cline',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: 'VS Code settings.json → "cline.mcpServers"',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'vscode',
    name: 'VS Code',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '.vscode/mcp.json (workspace) or User Profile mcp.json (global)',
    generateConfig: (s) => jsonConfig('servers', s),
  },
  {
    key: 'codex',
    name: 'Codex',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'toml',
    configFilePath: '~/.codex/config.toml (global) or .codex/config.toml (project)',
    generateConfig: (s) => `[mcp_servers.${s}]\ncommand = "npx"\nargs = ["-y", "${s}"]`,
  },
  {
    key: 'gemini',
    name: 'Gemini CLI',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.gemini/settings.json (global) or .gemini/settings.json (project)',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'goose',
    name: 'Goose',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'yaml',
    configFilePath: '~/.config/goose/config.yaml',
    generateConfig: (s) => `extensions:\n  ${s}:\n    name: ${s}\n    cmd: npx\n    args: ["-y", "${s}"]\n    enabled: true\n    type: stdio`,
  },
  {
    key: 'continue',
    name: 'Continue',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'yaml',
    configFilePath: '.continue/mcpServers/*.yaml (workspace) or ~/.continue/config.yaml (global)',
    generateConfig: (s) => `name: ${s} MCP\nversion: 0.0.1\nschema: v1\nmcpServers:\n  - name: ${s}\n    command: npx\n    args:\n      - "-y"\n      - "${s}"`,
  },
  {
    key: 'zed',
    name: 'Zed',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.config/zed/settings.json (macOS/Linux)\n  %APPDATA%\\Zed\\settings.json (Windows)',
    generateConfig: (s) => jsonConfig('context_servers', s),
  },
  {
    key: 'amp',
    name: 'Amp',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.config/amp/settings.json',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
  {
    key: 'jetbrains',
    name: 'JetBrains AI',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: 'IDE Settings → Tools → AI Assistant → MCP',
    generateConfig: (s) => jsonConfig('mcpServers', s),
  },
];
