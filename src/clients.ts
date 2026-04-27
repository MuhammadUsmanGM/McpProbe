import { ServerTransport, InstallationProfile } from './types';

export interface ClientDefinition {
  key: string;
  name: string;
  transports: ServerTransport[];
  warningCheck: 'descriptions' | 'inputTypes';
  configFormat: 'json' | 'toml' | 'yaml';
  configFilePath: string;
  generateConfig: (profile: InstallationProfile) => string;
}

interface CommandSpec {
  command: string;
  args: string[];
}

function commandFromProfile(profile: InstallationProfile): CommandSpec {
  switch (profile.strategy) {
    case 'npx':
      return { command: 'npx', args: ['-y', profile.packageName!] };
    case 'docker':
      return {
        command: 'docker',
        args: ['run', '-i', '--rm', profile.dockerImage || `<image-for-${profile.packageName}>`],
      };
    case 'http':
      // command/args not used for http; consumer should branch on strategy
      return { command: '', args: [] };
    case 'unknown':
    default:
      return { command: '<command>', args: [`<args-for-${profile.packageName}>`] };
  }
}

function jsonStdio(
  rootKey: string,
  profile: InstallationProfile,
  opts?: { httpKey?: 'url' | 'serverUrl'; transportField?: boolean; supportsHttp?: boolean }
): string {
  const serverName = profile.packageName || 'server';

  if (profile.strategy === 'http') {
    if (opts?.supportsHttp === false) {
      return `// This client only supports stdio transport, but the server is HTTP-only.\n// Use a client that supports HTTP (Claude Code, Cursor, VS Code, Continue, Zed, JetBrains, etc.)\n// Remote endpoint: ${profile.remoteUrl}`;
    }
    const inner: Record<string, any> = {};
    inner[opts?.httpKey || 'url'] = profile.remoteUrl;
    if (opts?.transportField) inner.type = 'http';
    return JSON.stringify({ [rootKey]: { [serverName]: inner } }, null, 2);
  }

  const { command, args } = commandFromProfile(profile);
  const inner: Record<string, any> = { command, args };
  return JSON.stringify({ [rootKey]: { [serverName]: inner } }, null, 2);
}

function codexConfig(profile: InstallationProfile): string {
  const serverName = profile.packageName || 'server';
  if (profile.strategy === 'http') {
    return `[mcp_servers.${serverName}]\nurl = "${profile.remoteUrl}"`;
  }
  const { command, args } = commandFromProfile(profile);
  const argsToml = JSON.stringify(args);
  return `[mcp_servers.${serverName}]\ncommand = "${command}"\nargs = ${argsToml}`;
}

function gooseConfig(profile: InstallationProfile): string {
  const serverName = profile.packageName || 'server';
  if (profile.strategy === 'http') {
    return `extensions:\n  ${serverName}:\n    name: ${serverName}\n    type: sse\n    uri: ${profile.remoteUrl}\n    enabled: true`;
  }
  const { command, args } = commandFromProfile(profile);
  return `extensions:\n  ${serverName}:\n    name: ${serverName}\n    cmd: ${command}\n    args: ${JSON.stringify(args)}\n    enabled: true\n    type: stdio`;
}

function continueConfig(profile: InstallationProfile): string {
  const serverName = profile.packageName || 'server';
  if (profile.strategy === 'http') {
    return `name: ${serverName} MCP\nversion: 0.0.1\nschema: v1\nmcpServers:\n  - name: ${serverName}\n    url: ${profile.remoteUrl}`;
  }
  const { command, args } = commandFromProfile(profile);
  const argLines = args.map((a) => `      - "${a}"`).join('\n');
  return `name: ${serverName} MCP\nversion: 0.0.1\nschema: v1\nmcpServers:\n  - name: ${serverName}\n    command: ${command}\n    args:\n${argLines}`;
}

export const CLIENT_DEFINITIONS: ClientDefinition[] = [
  {
    key: 'claude',
    name: 'Claude Desktop',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath:
      '~/Library/Application Support/Claude/claude_desktop_config.json (macOS)\n  %APPDATA%\\Claude\\claude_desktop_config.json (Windows)',
    generateConfig: (p) => jsonStdio('mcpServers', p, { supportsHttp: false }),
  },
  {
    key: 'claude-code',
    name: 'Claude Code',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '.mcp.json (project) or ~/.claude.json (global)',
    generateConfig: (p) => jsonStdio('mcpServers', p, { transportField: true }),
  },
  {
    key: 'cursor',
    name: 'Cursor',
    transports: ['stdio', 'http'],
    warningCheck: 'inputTypes',
    configFormat: 'json',
    configFilePath: '.cursor/mcp.json (project root)',
    generateConfig: (p) => jsonStdio('mcpServers', p),
  },
  {
    key: 'windsurf',
    name: 'Windsurf',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.windsurf/mcp_config.json',
    generateConfig: (p) => jsonStdio('mcpServers', p, { httpKey: 'serverUrl' }),
  },
  {
    key: 'cline',
    name: 'Cline',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: 'VS Code settings.json → "cline.mcpServers"',
    generateConfig: (p) => jsonStdio('mcpServers', p),
  },
  {
    key: 'vscode',
    name: 'VS Code',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '.vscode/mcp.json (workspace) or User Profile mcp.json (global)',
    generateConfig: (p) => jsonStdio('servers', p, { transportField: true }),
  },
  {
    key: 'codex',
    name: 'Codex',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'toml',
    configFilePath: '~/.codex/config.toml (global) or .codex/config.toml (project)',
    generateConfig: codexConfig,
  },
  {
    key: 'gemini',
    name: 'Gemini CLI',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.gemini/settings.json (global) or .gemini/settings.json (project)',
    generateConfig: (p) => jsonStdio('mcpServers', p, { supportsHttp: false }),
  },
  {
    key: 'goose',
    name: 'Goose',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'yaml',
    configFilePath: '~/.config/goose/config.yaml',
    generateConfig: gooseConfig,
  },
  {
    key: 'continue',
    name: 'Continue',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'yaml',
    configFilePath:
      '.continue/mcpServers/*.yaml (workspace) or ~/.continue/config.yaml (global)',
    generateConfig: continueConfig,
  },
  {
    key: 'zed',
    name: 'Zed',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath:
      '~/.config/zed/settings.json (macOS/Linux)\n  %APPDATA%\\Zed\\settings.json (Windows)',
    generateConfig: (p) => jsonStdio('context_servers', p),
  },
  {
    key: 'amp',
    name: 'Amp',
    transports: ['stdio'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: '~/.config/amp/settings.json',
    generateConfig: (p) => jsonStdio('mcpServers', p, { supportsHttp: false }),
  },
  {
    key: 'jetbrains',
    name: 'JetBrains AI',
    transports: ['stdio', 'http'],
    warningCheck: 'descriptions',
    configFormat: 'json',
    configFilePath: 'IDE Settings → Tools → AI Assistant → MCP',
    generateConfig: (p) => jsonStdio('mcpServers', p),
  },
];
