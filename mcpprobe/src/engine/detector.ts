import { RepoMetadata, ServerTransport } from '../types';

/**
 * Detect the MCP server transport type (stdio vs HTTP/SSE).
 * Analyzes package.json dependencies, scripts, and README content.
 */
export function detectTransport(repo: RepoMetadata): ServerTransport {
  const pkg = repo.packageJson;
  const readme = repo.readmeContent.toLowerCase();

  // Signals for each transport
  let stdioSignals = 0;
  let httpSignals = 0;

  if (pkg) {
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    // Check for MCP SDK (supports both, but stdio is default)
    if (allDeps['@modelcontextprotocol/sdk']) {
      stdioSignals += 1;
    }

    // Check for HTTP/Express/Fastify frameworks
    const httpFrameworks = ['express', 'fastify', 'hono', 'koa', '@hono/node-server'];
    for (const fw of httpFrameworks) {
      if (allDeps[fw]) {
        httpSignals += 2;
      }
    }

    // Check scripts for hints
    const scripts = pkg.scripts || {};
    const allScripts = Object.values(scripts).join(' ').toLowerCase();

    if (allScripts.includes('stdio') || allScripts.includes('--stdio')) {
      stdioSignals += 3;
    }

    if (allScripts.includes('server') || allScripts.includes('http') || allScripts.includes('sse')) {
      httpSignals += 1;
    }

    // Check main entry for hints
    const mainEntry = (pkg.main || '').toLowerCase();
    if (mainEntry.includes('stdio')) {
      stdioSignals += 2;
    }
    if (mainEntry.includes('http') || mainEntry.includes('server')) {
      httpSignals += 1;
    }
  }

  // Check README for transport hints
  if (readme.includes('stdio')) {
    stdioSignals += 1;
  }
  if (readme.includes('--transport stdio') || readme.includes('transport: stdio')) {
    stdioSignals += 3;
  }
  if (readme.includes('sse') || readme.includes('server-sent events') || readme.includes('http transport')) {
    httpSignals += 2;
  }
  if (readme.includes('--transport http') || readme.includes('transport: http')) {
    httpSignals += 3;
  }

  // Default: if MCP SDK present with no strong HTTP signals, assume stdio
  if (stdioSignals === 0 && httpSignals === 0) {
    if (pkg?.dependencies?.['@modelcontextprotocol/sdk'] || pkg?.devDependencies?.['@modelcontextprotocol/sdk']) {
      return 'stdio';
    }
    return 'unknown';
  }

  if (httpSignals > stdioSignals) {
    return 'http';
  }

  return 'stdio';
}
