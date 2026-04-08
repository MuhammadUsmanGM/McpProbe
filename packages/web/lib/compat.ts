import { Tool, ServerTransport, CompatEntry, CompatStatus, ConnectionResult } from './types';

/**
 * Check compatibility with AI clients.
 */
export function checkCompatibility(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult
): CompatEntry[] {
  const results: CompatEntry[] = [];

  const missingDescriptions = tools.filter((t) => !t.description).length;
  const missingInputTypes = tools.flatMap((t) => t.inputs).filter((i) => !i.type || i.type === 'unknown').length;

  // Claude Desktop
  results.push(checkClaudeDesktop(transport, tools, connection, missingDescriptions));

  // Cursor
  results.push(checkCursor(transport, tools, connection, missingInputTypes));

  // Windsurf
  results.push(checkWindsurf(transport, tools, connection, missingDescriptions));

  // Cline
  results.push(checkCline(transport, tools, connection, missingDescriptions));

  return results;
}

function checkClaudeDesktop(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (transport === 'http') {
    return {
      client: 'Claude Desktop',
      status: 'error',
      message: 'HTTP transport not supported by Claude Desktop',
    };
  }

  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Claude Desktop',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Claude Desktop',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Claude Desktop',
    status: 'ready',
    message: 'Ready',
  };
}

function checkCursor(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingTypes: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Cursor',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingTypes > 0) {
    return {
      client: 'Cursor',
      status: 'warning',
      message: `Missing input types (${missingTypes})`,
    };
  }

  return {
    client: 'Cursor',
    status: 'ready',
    message: 'Ready',
  };
}

function checkWindsurf(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Windsurf',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Windsurf',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Windsurf',
    status: 'ready',
    message: 'Ready',
  };
}

function checkCline(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (transport === 'http') {
    return {
      client: 'Cline',
      status: 'error',
      message: 'HTTP transport not supported by Cline',
    };
  }

  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Cline',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Cline',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Cline',
    status: 'ready',
    message: 'Ready',
  };
}
