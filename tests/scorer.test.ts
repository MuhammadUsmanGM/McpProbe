import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreServer } from '../src/analyzer/scorer';
import { RepoMetadata, ConnectionResult, Tool } from '../src/types';

function repo(readme = 'Install via npm. Usage: npx demo'): RepoMetadata {
  return {
    name: 'demo',
    fullName: 'demo/demo',
    description: '',
    stars: 0,
    defaultBranch: 'main',
    url: 'https://github.com/demo/demo',
    packageJson: null,
    readmeContent: readme + ' '.repeat(250),
    isLocal: false,
  };
}

function conn(connected: boolean, latencyMs = 100, error?: string): ConnectionResult {
  return { connected, latencyMs, tools: [], error };
}

const goodTool: Tool = {
  name: 't',
  description: 'does a thing',
  inputSchema: { properties: { x: { type: 'string' } } },
  inputs: [{ name: 'x', type: 'string', required: true }],
};

test('scorer: probe failure marks dynamic checks unmeasured', () => {
  const result = scoreServer(repo(), [], conn(false, 0, 'unreachable'));
  const dynamicKeys = ['responds_under_3s', 'tools_described', 'inputs_typed', 'has_error_handling'];
  for (const key of dynamicKeys) {
    const row = result.breakdown.find((b) => b.key === key);
    assert.ok(row?.unmeasured, `${key} should be unmeasured when probe fails`);
  }
});

test('scorer: maxTotal excludes unmeasured criteria', () => {
  const result = scoreServer(repo(), [], conn(false, 0, 'unreachable'));
  // Only secrets (20) + readme (15) measured; both pass with the default readme
  assert.equal(result.maxTotal, 35);
  assert.equal(result.total, 35);
  assert.equal(result.grade, 'A');
});

test('scorer: connected probe measures everything', () => {
  const result = scoreServer(repo(), [goodTool], conn(true, 100));
  assert.equal(result.maxTotal, 100);
  assert.ok(result.breakdown.every((b) => !b.unmeasured));
});

test('scorer: secrets in README dock points', () => {
  const r = repo('# install guide. ghp_' + 'a'.repeat(36));
  const result = scoreServer(r, [], conn(false));
  const secrets = result.breakdown.find((b) => b.key === 'no_secrets');
  assert.equal(secrets?.passed, false);
});

test('scorer: empty readme = 0 readme points, no install guide', () => {
  const r: RepoMetadata = { ...repo(), readmeContent: '' };
  const result = scoreServer(r, [], conn(false));
  const readme = result.breakdown.find((b) => b.key === 'has_readme');
  assert.equal(readme?.earnedPoints, 0);
});
