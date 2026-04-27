import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverRemoteUrls } from '../src/engine/connector';
import { RepoMetadata } from '../src/types';

function makeRepo(readmeContent: string): RepoMetadata {
  return {
    name: 'demo',
    fullName: 'demo/demo',
    description: '',
    stars: 0,
    defaultBranch: 'main',
    url: 'https://github.com/demo/demo',
    packageJson: null,
    readmeContent,
    isLocal: false,
  };
}

test('discoverRemoteUrls: finds /mcp endpoint', () => {
  const urls = discoverRemoteUrls(
    makeRepo('Connect to https://api.example.com/mcp/ for tools.')
  );
  assert.deepEqual(urls, ['https://api.example.com/mcp/']);
});

test('discoverRemoteUrls: filters VSCode installer redirects', () => {
  const urls = discoverRemoteUrls(
    makeRepo(
      'Install: https://insiders.vscode.dev/redirect/mcp/install?name=foo and connect to https://api.example.com/mcp'
    )
  );
  assert.deepEqual(urls, ['https://api.example.com/mcp']);
});

test('discoverRemoteUrls: ignores non-endpoint URLs', () => {
  const urls = discoverRemoteUrls(
    makeRepo('See https://example.com/docs and https://example.com/about/mcp-overview')
  );
  assert.deepEqual(urls, []);
});

test('discoverRemoteUrls: prefers shorter URLs', () => {
  const urls = discoverRemoteUrls(
    makeRepo(
      'Try https://very-long-internal-corp-domain.example.com/api/v2/mcp or https://api.x.com/mcp'
    )
  );
  assert.equal(urls[0], 'https://api.x.com/mcp');
});

test('discoverRemoteUrls: skips github.com / npmjs.com', () => {
  const urls = discoverRemoteUrls(
    makeRepo('Source: https://github.com/owner/repo/blob/main/mcp')
  );
  assert.deepEqual(urls, []);
});

test('discoverRemoteUrls: deduplicates', () => {
  const urls = discoverRemoteUrls(
    makeRepo('https://api.example.com/mcp and again https://api.example.com/mcp')
  );
  assert.equal(urls.length, 1);
});

test('discoverRemoteUrls: strips trailing punctuation', () => {
  const urls = discoverRemoteUrls(
    makeRepo('Connect at https://api.example.com/mcp.')
  );
  assert.deepEqual(urls, ['https://api.example.com/mcp']);
});
