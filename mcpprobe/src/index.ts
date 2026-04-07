#!/usr/bin/env node

import { Command } from 'commander';
import { runProbe } from './commands/probe';

const program = new Command();

program
  .name('mcpprobe')
  .description('Probe any MCP server — tools, compatibility, score, configs')
  .version('1.0.0')
  .argument('[target]', 'GitHub URL or local path to an MCP server')
  .option('--json', 'Save report as JSON file')
  .option('--md', 'Save report as markdown file')
  .option('--tools', 'Only show tools')
  .option('--score', 'Only show score')
  .option('--config <client>', 'Show config for a specific client (claude, cursor, windsurf, cline)')
  .option('--copy', 'Copy config to clipboard (use with --config)')
  .action(async (target: string | undefined, opts: any) => {
    if (!target) {
      program.help();
      return;
    }

    const validClients = ['claude', 'cursor', 'windsurf', 'cline'];
    if (opts.config && !validClients.includes(opts.config.toLowerCase())) {
      console.error(
        `\nError: Invalid client "${opts.config}". Use one of: ${validClients.join(', ')}\n`
      );
      process.exit(1);
    }

    await runProbe(target, {
      json: opts.json,
      md: opts.md,
      tools: opts.tools,
      score: opts.score,
      config: opts.config,
      copy: opts.copy,
    });
  });

program.parse(process.argv);
