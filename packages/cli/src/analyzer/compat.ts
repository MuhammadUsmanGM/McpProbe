import { Tool, ServerTransport, CompatEntry, ConnectionResult } from '../types';
import { CLIENT_DEFINITIONS } from '../clients';

/**
 * Check compatibility with AI clients.
 */
export function checkCompatibility(
  transport: ServerTransport,
  tools: Tool[],
  connection: ConnectionResult
): CompatEntry[] {
  const missingDescriptions = tools.filter((t) => !t.description).length;
  const missingInputTypes = tools.flatMap((t) => t.inputs).filter((i) => !i.type || i.type === 'unknown').length;

  return CLIENT_DEFINITIONS.map((client) => {
    // Transport check
    if (!client.transports.includes(transport)) {
      return {
        client: client.name,
        status: 'error' as const,
        message: `${transport.toUpperCase()} transport not supported by ${client.name}`,
      };
    }

    // Connection check
    if (!connection.connected || tools.length === 0) {
      return {
        client: client.name,
        status: 'error' as const,
        message: connection.error || 'Could not connect or no tools found',
      };
    }

    // Quality check
    const warningCount = client.warningCheck === 'inputTypes' ? missingInputTypes : missingDescriptions;
    if (warningCount > 0) {
      const label = client.warningCheck === 'inputTypes' ? 'input types' : 'tool descriptions';
      return {
        client: client.name,
        status: 'warning' as const,
        message: `Missing ${label} (${warningCount})`,
      };
    }

    return {
      client: client.name,
      status: 'ready' as const,
      message: 'Ready',
    };
  });
}
