import { ProbeResult, Tool, CompatEntry, ScoreBreakdown } from '../types';
import { getConfigFilePath } from '../generator/config';

// Dynamic imports for ESM modules
async function getChalk() {
  const mod = await import('chalk');
  return mod.default;
}

const LINE = '─'.repeat(50);

/**
 * Display full probe results in the terminal.
 */
export async function displayResults(result: ProbeResult, options: {
  showTools?: boolean;
  showScore?: boolean;
  configClient?: string;
  copied?: boolean;
}): Promise<void> {
  const chalk = await getChalk();
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
  console.log(`${chalk.green('✔')} ${chalk.gray('Server type')}          ${chalk.white(result.connection.connected ? result.transport : chalk.red('failed'))}`);

  if (result.connection.connected) {
    console.log(`${chalk.green('✔')} ${chalk.gray('Connected')}            ${chalk.white(result.connection.latencyMs + 'ms')}`);
    console.log(`${chalk.green('✔')} ${chalk.gray('Tools discovered')}     ${chalk.white(String(result.tools.length))}`);
  } else {
    console.log(`${chalk.red('✗')} ${chalk.gray('Connection')}           ${chalk.red(result.connection.error || 'Failed')}`);
  }

  // If --tools only
  if (options.showTools) {
    displayTools(chalk, result.tools);
    return;
  }

  // If --score only
  if (options.showScore) {
    displayScore(chalk, result.score);
    return;
  }

  // Full output
  displayTools(chalk, result.tools);
  displayCompatibility(chalk, result.compatibility);
  displayScore(chalk, result.score);

  // Config section
  const configClient = options.configClient || 'claude';
  displayConfig(chalk, result.configs, configClient, options.copied || false);

  // Footer hints
  console.log('');
  console.log(chalk.gray('  Run with --json to save full report'));
  console.log(chalk.gray('  Run with --config cursor for Cursor config'));
  console.log('');
}

function displayTools(chalk: any, tools: Tool[]): void {
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

function displayCompatibility(chalk: any, compat: CompatEntry[]): void {
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

function displayScore(chalk: any, score: { total: number; maxTotal: number; grade: string; breakdown: ScoreBreakdown[] }): void {
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

function displayConfig(chalk: any, configs: Record<string, string>, client: string, copied: boolean): void {
  const clientKey = client.toLowerCase();
  const clientNames: Record<string, string> = {
    claude: 'Claude Desktop',
    cursor: 'Cursor',
    windsurf: 'Windsurf',
    cline: 'Cline',
  };

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
