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

  // Claude Code
  results.push(checkClaudeCode(transport, tools, connection, missingDescriptions));

  // Cursor
  results.push(checkCursor(transport, tools, connection, missingInputTypes));

  // Windsurf
  results.push(checkWindsurf(transport, tools, connection, missingDescriptions));

  // Cline
  results.push(checkCline(transport, tools, connection, missingDescriptions));

  // VS Code (Copilot)
  results.push(checkVSCode(transport, tools, connection, missingDescriptions));

  // Codex (OpenAI)
  results.push(checkCodex(transport, tools, connection, missingDescriptions));

  // Gemini CLI
  results.push(checkGeminiCLI(transport, tools, connection, missingDescriptions));

  // Goose
  results.push(checkGoose(transport, tools, connection, missingDescriptions));

  // Continue
  results.push(checkContinue(transport, tools, connection, missingDescriptions));

  // Zed
  results.push(checkZed(transport, tools, connection, missingDescriptions));

  // Amp
  results.push(checkAmp(transport, tools, connection, missingDescriptions));

  // JetBrains AI
  results.push(checkJetBrains(transport, tools, connection, missingDescriptions));

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

function checkClaudeCode(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Claude Code',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Claude Code',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Claude Code',
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

function checkVSCode(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'VS Code',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'VS Code',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'VS Code',
    status: 'ready',
    message: 'Ready',
  };
}

function checkCodex(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (transport === 'http') {
    return {
      client: 'Codex',
      status: 'error',
      message: 'HTTP transport not supported by Codex CLI',
    };
  }

  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Codex',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Codex',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Codex',
    status: 'ready',
    message: 'Ready',
  };
}

function checkGeminiCLI(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Gemini CLI',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Gemini CLI',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Gemini CLI',
    status: 'ready',
    message: 'Ready',
  };
}

function checkGoose(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (transport === 'http') {
    return {
      client: 'Goose',
      status: 'error',
      message: 'HTTP transport not supported by Goose',
    };
  }

  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Goose',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Goose',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Goose',
    status: 'ready',
    message: 'Ready',
  };
}

function checkContinue(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Continue',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Continue',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Continue',
    status: 'ready',
    message: 'Ready',
  };
}

function checkZed(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Zed',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Zed',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Zed',
    status: 'ready',
    message: 'Ready',
  };
}

function checkAmp(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'Amp',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'Amp',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'Amp',
    status: 'ready',
    message: 'Ready',
  };
}

function checkJetBrains(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult,
  missingDesc: number
): CompatEntry {
  if (!connection.connected || tools.length === 0) {
    return {
      client: 'JetBrains AI',
      status: 'error',
      message: connection.error || 'Could not connect or no tools found',
    };
  }

  if (missingDesc > 0) {
    return {
      client: 'JetBrains AI',
      status: 'warning',
      message: `Missing tool descriptions (${missingDesc})`,
    };
  }

  return {
    client: 'JetBrains AI',
    status: 'ready',
    message: 'Ready',
  };
}
