import * as fs from 'fs';
import * as path from 'path';
import { ProbeResult } from '../types';

/**
 * Save probe results as markdown file.
 */
export function saveMarkdownReport(result: ProbeResult, outputPath?: string): string {
  const fileName = `mcpprobe-${result.repo.name}-${Date.now()}.md`;
  const filePath = outputPath || path.join(process.cwd(), fileName);

  const lines: string[] = [];

  lines.push(`# MCPProbe Report: ${result.repo.name}`);
  lines.push('');
  lines.push(`> Probed at ${result.probedAt}`);
  lines.push('');

  // Repository
  lines.push('## Repository');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Name | ${result.repo.name} |`);
  lines.push(`| URL | ${result.repo.url} |`);
  lines.push(`| Stars | ${result.repo.stars} |`);
  lines.push(`| Transport | ${result.transport} |`);
  lines.push(`| Connected | ${result.connection.connected ? '✅' : '❌'} |`);
  lines.push(`| Latency | ${result.connection.latencyMs}ms |`);
  lines.push('');

  // Tools
  lines.push(`## Tools (${result.tools.length})`);
  lines.push('');

  for (const tool of result.tools) {
    lines.push(`### \`${tool.name}\``);
    if (tool.description) {
      lines.push(`${tool.description}`);
    }
    lines.push('');

    if (tool.inputs.length > 0) {
      lines.push(`| Input | Type | Required |`);
      lines.push(`|-------|------|----------|`);
      for (const input of tool.inputs) {
        lines.push(`| ${input.name} | ${input.type} | ${input.required ? '✅' : '❌'} |`);
      }
      lines.push('');
    }
  }

  // Compatibility
  lines.push('## Compatibility');
  lines.push('');
  lines.push(`| Client | Status | Details |`);
  lines.push(`|--------|--------|---------|`);
  for (const entry of result.compatibility) {
    const icon = entry.status === 'ready' ? '✅' : entry.status === 'warning' ? '⚠️' : '❌';
    lines.push(`| ${entry.client} | ${icon} | ${entry.message} |`);
  }
  lines.push('');

  // Score
  lines.push(`## Score: ${result.score.total} / ${result.score.maxTotal} (Grade: ${result.score.grade})`);
  lines.push('');
  lines.push(`| Check | Points | Status |`);
  lines.push(`|-------|--------|--------|`);
  for (const item of result.score.breakdown) {
    const icon = item.passed ? '✔' : '✗';
    lines.push(`| ${item.label} | ${item.earnedPoints}/${item.maxPoints} | ${icon} |`);
  }
  lines.push('');

  // Configs
  lines.push('## Config Snippets');
  lines.push('');

  const clientNames: Record<string, string> = {
    claude: 'Claude Desktop',
    'claude-code': 'Claude Code',
    cursor: 'Cursor',
    windsurf: 'Windsurf',
    cline: 'Cline',
    vscode: 'VS Code',
    codex: 'Codex',
    gemini: 'Gemini CLI',
    goose: 'Goose',
    continue: 'Continue',
    zed: 'Zed',
    amp: 'Amp',
    jetbrains: 'JetBrains AI',
  };

  for (const [key, config] of Object.entries(result.configs)) {
    lines.push(`### ${clientNames[key] || key}`);
    lines.push('');
    lines.push('```json');
    lines.push(config);
    lines.push('```');
    lines.push('');
  }

  const content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}
