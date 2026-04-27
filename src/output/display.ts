import chalk from 'chalk';
import { ProbeResult, Tool, CompatEntry, ScoreBreakdown } from '../types';
import { getConfigFilePath } from '../generator/config';
import { CLIENT_DEFINITIONS } from '../clients';

const LINE = '─'.repeat(50);

/**
 * Display full probe results in the terminal.
 */
export function displayResults(result: ProbeResult, options: {
  showTools?: boolean;
  showScore?: boolean;
  configClient?: string;
  copied?: boolean;
}): void {
  // Header
  const logo = `███╗   ███╗ ██████╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝
██╔████╔██║██║     ██████╔╝██████╔╝██████╔╝██║   ██║██████╔╝█████╗
██║╚██╔╝██║██║     ██╔═══╝ ██╔═══╝ ██╔══██╗██║   ██║██╔══██╗██╔══╝
██║ ╚═╝ ██║╚██████╗██║     ██║     ██║  ██║╚██████╔╝██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝`;

  const subtitle = "  probe any mcp server · tools · compat · score · configs";

  console.log('\n' + chalk.hex('#8B5CF6').bold(logo));
  console.log(chalk.hex('#10B981')(subtitle) + '\n');

  // Probe summary
  console.log(`\n${chalk.gray('Probing')} ${chalk.white(result.repo.url)}${chalk.gray('...')}\n`);

  const starStr = result.repo.stars > 0 ? chalk.yellow(` (★ ${result.repo.stars})`) : '';
  console.log(`${chalk.green('✔')} ${chalk.gray('Repo fetched')}         ${chalk.white(result.repo.name)}${starStr}`);

  const transportLabel = result.transport === 'unknown' ? chalk.gray('unknown') : chalk.white(result.transport);
  console.log(`${chalk.green('✔')} ${chalk.gray('Server type')}          ${transportLabel}`);

  const isDryRun = result.connection.error?.startsWith('Dry run');
  if (result.connection.connected) {
    console.log(`${chalk.green('✔')} ${chalk.gray('Connected')}            ${chalk.white(result.connection.latencyMs + 'ms')}`);
    console.log(`${chalk.green('✔')} ${chalk.gray('Tools discovered')}     ${chalk.white(String(result.tools.length))}`);
  } else if (isDryRun) {
    console.log(`${chalk.yellow('•')} ${chalk.gray('Connection')}           ${chalk.gray('skipped (dry run)')}`);
  } else {
    console.log(`${chalk.yellow('⚠')} ${chalk.gray('Connection')}           ${chalk.yellow('unreachable')} ${chalk.gray('— ' + (result.connection.error || 'no response'))}`);
  }

  // If --tools only
  if (options.showTools) {
    displayTools(result.tools);
    return;
  }

  // If --score only
  if (options.showScore) {
    displayScore(result.score);
    return;
  }

  // Full output
  displayTools(result.tools);
  displayCompatibility(result.compatibility);
  displayScore(result.score);

  // Config section. Default to claude-code (supports both stdio + http);
  // fall back to claude when explicitly requested elsewhere.
  const configClient = options.configClient || 'claude-code';
  displayConfig(result.configs, configClient, options.copied || false);

  // Footer hints
  console.log('');
  console.log(chalk.gray('  Run with --json to save full report'));
  console.log(chalk.gray('  Run with --config cursor for Cursor config'));
  console.log('');
}

function displayTools(tools: Tool[]): void {
  console.log(`\n${chalk.gray(LINE)}`);
  console.log(chalk.bold.white(`  TOOLS (${tools.length})`));
  console.log(chalk.gray(LINE));

  if (tools.length === 0) {
    console.log(chalk.gray('\n  No tools found.\n'));
    return;
  }

  const displayCount = Math.min(tools.length, 5);
  const remaining = tools.length - displayCount;

  for (let i = 0; i < displayCount; i++) {
    const tool = tools[i];
    console.log(`\n  ${chalk.cyan.bold(tool.name)}`);
    if (tool.description) {
      console.log(`  └─ ${chalk.gray(tool.description)}`);
    }
    if (tool.inputs.length > 0) {
      const inputLines = tool.inputs.map((inp) => {
        const req = inp.required ? chalk.yellow('required') : chalk.gray('optional');
        return `     ${chalk.white(inp.name)} ${chalk.gray('(' + inp.type + ',')} ${req}${chalk.gray(')')}`;
      });
      console.log(`     ${chalk.gray('Inputs:')}`);
      inputLines.forEach((line) => console.log(line));
    }
  }

  if (remaining > 0) {
    console.log(`\n  ${chalk.gray(`... ${remaining} more tool${remaining > 1 ? 's' : ''}`)}`);
  }
}

function displayCompatibility(compat: CompatEntry[]): void {
  console.log(`\n${chalk.gray(LINE)}`);
  console.log(chalk.bold.white('  COMPATIBILITY'));
  console.log(chalk.gray(LINE));
  console.log('');

  for (const entry of compat) {
    const icon = entry.status === 'ready'
      ? chalk.green('✅')
      : entry.status === 'warning'
        ? chalk.yellow('⚠️ ')
        : chalk.red('❌');

    const statusText = entry.status === 'ready'
      ? chalk.green(entry.message)
      : entry.status === 'warning'
        ? chalk.yellow(entry.message)
        : chalk.red(entry.message);

    console.log(`  ${chalk.white(entry.client.padEnd(18))} ${icon}  ${statusText}`);
  }
}

function displayScore(score: { total: number; maxTotal: number; grade: string; breakdown: ScoreBreakdown[] }): void {
  console.log(`\n${chalk.gray(LINE)}`);

  const gradeColor = score.grade === 'A' ? chalk.green : score.grade === 'B' ? chalk.yellow : score.grade === 'C' ? chalk.hex('#FFA500') : chalk.red;
  console.log(chalk.bold.white(`  SCORE   `) + gradeColor.bold(`${score.total} / ${score.maxTotal}`));
  console.log(chalk.gray(LINE));
  console.log('');

  for (const item of score.breakdown) {
    const icon = item.passed ? chalk.green('✔') : chalk.red('✗');
    const points = item.passed
      ? chalk.green(`+${item.earnedPoints}`)
      : chalk.red(`+${item.earnedPoints} / ${item.maxPoints}`);
    console.log(`  ${icon}  ${chalk.gray(item.label.padEnd(30))} ${points}`);
  }
}

function displayConfig(configs: Record<string, string>, client: string, copied: boolean): void {
  const clientKey = client.toLowerCase();
  const clientNames: Record<string, string> = Object.fromEntries(
    CLIENT_DEFINITIONS.map((c) => [c.key, c.name])
  );

  const configStr = configs[clientKey];
  if (!configStr) return;

  console.log(`\n${chalk.gray(LINE)}`);
  console.log(chalk.bold.white(`  CONFIG  →  ${clientNames[clientKey] || client}`));
  console.log(chalk.gray(LINE));
  console.log('');

  // Syntax-highlight the JSON config
  const lines = configStr.split('\n');
  for (const line of lines) {
    console.log(`  ${chalk.green(line)}`);
  }

  const filePath = getConfigFilePath(clientKey);
  if (filePath) {
    console.log(`\n  ${chalk.gray('File:')} ${chalk.gray(filePath)}`);
  }

  if (copied) {
    console.log(`\n  ${chalk.green('Copied to clipboard ✔')}`);
  }
}
