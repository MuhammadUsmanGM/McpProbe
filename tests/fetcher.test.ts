import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubUrl, isLocalPath } from '../src/engine/fetcher';

test('parseGitHubUrl: bare https URL', () => {
  assert.deepEqual(parseGitHubUrl('https://github.com/owner/repo'), {
    owner: 'owner',
    repo: 'repo',
  });
});

test('parseGitHubUrl: .git suffix', () => {
  assert.deepEqual(parseGitHubUrl('https://github.com/owner/repo.git'), {
    owner: 'owner',
    repo: 'repo',
  });
});

test('parseGitHubUrl: bare github.com (no scheme)', () => {
  assert.deepEqual(parseGitHubUrl('github.com/owner/repo'), {
    owner: 'owner',
    repo: 'repo',
  });
});

test('parseGitHubUrl: tree subpath', () => {
  assert.deepEqual(
    parseGitHubUrl('https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite'),
    {
      owner: 'modelcontextprotocol',
      repo: 'servers',
      ref: 'main',
      subPath: 'src/sqlite',
    }
  );
});

test('parseGitHubUrl: blob subpath', () => {
  assert.deepEqual(
    parseGitHubUrl('https://github.com/owner/repo/blob/feature-x/path/file.ts'),
    {
      owner: 'owner',
      repo: 'repo',
      ref: 'feature-x',
      subPath: 'path/file.ts',
    }
  );
});

test('parseGitHubUrl: tree without subpath', () => {
  assert.deepEqual(parseGitHubUrl('https://github.com/owner/repo/tree/develop'), {
    owner: 'owner',
    repo: 'repo',
    ref: 'develop',
    subPath: undefined,
  });
});

test('parseGitHubUrl: invalid input returns null', () => {
  assert.equal(parseGitHubUrl('not-a-url'), null);
  assert.equal(parseGitHubUrl('https://gitlab.com/owner/repo'), null);
});

test('isLocalPath: detects unix paths', () => {
  assert.equal(isLocalPath('./foo'), true);
  assert.equal(isLocalPath('/abs/path'), true);
});

test('isLocalPath: detects windows paths', () => {
  assert.equal(isLocalPath('C:/foo'), true);
  assert.equal(isLocalPath('D:\\bar'), true);
});

test('isLocalPath: rejects URLs', () => {
  assert.equal(isLocalPath('https://github.com/owner/repo'), false);
  assert.equal(isLocalPath('github.com/owner/repo'), false);
});
