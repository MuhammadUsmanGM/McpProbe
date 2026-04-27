import test from 'node:test';
import assert from 'node:assert/strict';
import { CLIENT_DEFINITIONS } from '../src/clients';
import { InstallationProfile } from '../src/types';

function findClient(key: string) {
  const c = CLIENT_DEFINITIONS.find((x) => x.key === key);
  if (!c) throw new Error(`unknown client ${key}`);
  return c;
}

test('clients: claude-code emits npx config for npx profile', () => {
  const profile: InstallationProfile = { strategy: 'npx', packageName: 'foo-mcp' };
  const out = findClient('claude-code').generateConfig(profile);
  const json = JSON.parse(out);
  assert.equal(json.mcpServers['foo-mcp'].command, 'npx');
  assert.deepEqual(json.mcpServers['foo-mcp'].args, ['-y', 'foo-mcp']);
});

test('clients: claude-code emits http url for http profile', () => {
  const profile: InstallationProfile = {
    strategy: 'http',
    packageName: 'foo',
    remoteUrl: 'https://api.example.com/mcp',
  };
  const out = findClient('claude-code').generateConfig(profile);
  const json = JSON.parse(out);
  assert.equal(json.mcpServers.foo.url, 'https://api.example.com/mcp');
  assert.equal(json.mcpServers.foo.type, 'http');
});

test('clients: claude desktop refuses http profile (stdio-only)', () => {
  const profile: InstallationProfile = {
    strategy: 'http',
    packageName: 'foo',
    remoteUrl: 'https://api.example.com/mcp',
  };
  const out = findClient('claude').generateConfig(profile);
  // Should be a comment, not JSON
  assert.ok(out.startsWith('//'));
  assert.ok(out.includes('https://api.example.com/mcp'));
});

test('clients: docker profile emits docker run command', () => {
  const profile: InstallationProfile = {
    strategy: 'docker',
    packageName: 'foo',
    dockerImage: 'ghcr.io/owner/foo:latest',
  };
  const out = findClient('cursor').generateConfig(profile);
  const json = JSON.parse(out);
  assert.equal(json.mcpServers.foo.command, 'docker');
  assert.ok(json.mcpServers.foo.args.includes('ghcr.io/owner/foo:latest'));
});

test('clients: codex emits TOML', () => {
  const profile: InstallationProfile = { strategy: 'npx', packageName: 'foo' };
  const out = findClient('codex').generateConfig(profile);
  assert.ok(out.includes('[mcp_servers.foo]'));
  assert.ok(out.includes('command = "npx"'));
});

test('clients: codex emits url for http profile', () => {
  const profile: InstallationProfile = {
    strategy: 'http',
    packageName: 'foo',
    remoteUrl: 'https://api.example.com/mcp',
  };
  const out = findClient('codex').generateConfig(profile);
  assert.ok(out.includes('url = "https://api.example.com/mcp"'));
});

test('clients: every client has a generator', () => {
  for (const c of CLIENT_DEFINITIONS) {
    assert.equal(typeof c.generateConfig, 'function', `${c.key} missing generator`);
  }
});

test('clients: every http-supporting client emits valid config for http profile', () => {
  const profile: InstallationProfile = {
    strategy: 'http',
    packageName: 'foo',
    remoteUrl: 'https://api.example.com/mcp',
  };
  for (const c of CLIENT_DEFINITIONS) {
    if (!c.transports.includes('http')) continue;
    const out = c.generateConfig(profile);
    assert.ok(out.includes('https://api.example.com/mcp'), `${c.key} should include the URL`);
  }
});
