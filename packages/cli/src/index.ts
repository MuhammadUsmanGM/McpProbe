#!/usr/bin/env node

import { Command } from 'commander';
import { runProbe } from './commands/probe';

async function main() {
  const chalk = (await import('chalk')).default;
  const program = new Command();

  const logo = `███╗   ███╗ ██████╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝
██╔████╔██║██║     ██████╔╝██████╔╝██████╔╝██║   ██║██████╔╝█████╗  
██║╚██╔╝██║██║     ██╔═══╝ ██╔═══╝ ██╔══██╗██║   ██║██╔══██╗██╔══╝  
██║ ╚═╝ ██║╚██████╗██║     ██║     ██║  ██║╚██████╔╝██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝`;

  const subtitle = "  probe any mcp server · tools · compat · score · configs";

  const branding = '\n' + chalk.hex('#8B5CF6').bold(logo) + '\n' + chalk.hex('#10B981')(subtitle) + '\n';

  program
    .name('mcpprobe')
    .description('Probe any MCP server — tools, compatibility, score, configs')
    .version('1.0.0')
    .argument('[target]', 'GitHub URL or local path to an MCP server')
    .option('--json', 'Save report as JSON file')
    .option('--md', 'Save report as markdown file')
    .option('--tools', 'Only show tools')
    .option('--score', 'Only show score')
    .option('--config <client>', 'Show config for a specific client (claude, claude-code, cursor, windsurf, cline, vscode, codex, gemini, goose, continue, zed, amp, jetbrains)')
    .option('--copy', 'Copy config to clipboard (use with --config)')
    .addHelpText('beforeAll', branding)
    .action(async (target: string | undefined, opts: any) => {
      if (!target) {
        console.log(branding);
        program.help();
        return;
      }

      const validClients = ['claude', 'claude-code', 'cursor', 'windsurf', 'cline', 'vscode', 'codex', 'gemini', 'goose', 'continue', 'zed', 'amp', 'jetbrains'];
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
}

main().catch(console.error);
