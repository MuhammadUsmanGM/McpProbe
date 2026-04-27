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
  const isDryRun = connection.error?.startsWith('Dry run');

  const transportKnown = transport === 'stdio' || transport === 'http';

  return CLIENT_DEFINITIONS.map((client) => {
    // Transport check (real compat signal — independent of probe success)
    if (transportKnown && !client.transports.includes(transport)) {
      return {
        client: client.name,
        status: 'error' as const,
        message: `${transport.toUpperCase()} transport not supported`,
      };
    }

    // Dry-run: transport compatibility only
    if (isDryRun) {
      const t = transportKnown ? transport : 'detected';
      return {
        client: client.name,
        status: 'ready' as const,
        message: `${t} transport compatible (dry run)`,
      };
    }

    // Probe failed — but transport itself is compatible. Don't penalize the client.
    if (!connection.connected) {
      const t = transportKnown ? transport : 'server';
      return {
        client: client.name,
        status: 'warning' as const,
        message: `${t} transport compatible — probe couldn't verify tools`,
      };
    }

    if (tools.length === 0) {
      return {
        client: client.name,
        status: 'warning' as const,
        message: 'Connected, but no tools exposed',
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
