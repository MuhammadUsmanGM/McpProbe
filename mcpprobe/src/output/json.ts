import * as fs from 'fs';
import * as path from 'path';
import { ProbeResult } from '../types';

/**
 * Save probe results as JSON file.
 */
export function saveJsonReport(result: ProbeResult, outputPath?: string): string {
  const fileName = `mcpprobe-${result.repo.name}-${Date.now()}.json`;
  const filePath = outputPath || path.join(process.cwd(), fileName);

  const report = {
    probe: {
      version: '1.0.0',
      probedAt: result.probedAt,
      target: result.repo.url,
    },
    repository: {
      name: result.repo.name,
      fullName: result.repo.fullName,
      description: result.repo.description,
      stars: result.repo.stars,
      isLocal: result.repo.isLocal,
    },
    transport: result.transport,
    connection: {
      connected: result.connection.connected,
      latencyMs: result.connection.latencyMs,
      error: result.connection.error || null,
    },
    tools: result.tools.map((t) => ({
      name: t.name,
      description: t.description || null,
      inputs: t.inputs.map((i) => ({
        name: i.name,
        type: i.type,
        description: i.description || null,
        required: i.required,
      })),
    })),
    compatibility: result.compatibility.map((c) => ({
      client: c.client,
      status: c.status,
      message: c.message,
    })),
    score: {
      total: result.score.total,
      maxTotal: result.score.maxTotal,
      grade: result.score.grade,
      breakdown: result.score.breakdown,
    },
    configs: result.configs,
  };

  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
  return filePath;
}
