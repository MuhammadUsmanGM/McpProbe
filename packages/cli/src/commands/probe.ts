import { ProbeResult, CLIOptions } from '../types';
import { fetchRepoMetadata } from '../engine/fetcher';
import { detectTransport } from '../engine/detector';
import { connectToServer } from '../engine/connector';
import { scoreServer } from '../analyzer/scorer';
import { checkCompatibility } from '../analyzer/compat';
import { generateConfigs } from '../generator/config';
import { displayResults } from '../output/display';
import { saveJsonReport } from '../output/json';
import { saveMarkdownReport } from '../output/markdown';
import { copyToClipboard } from '../utils/clipboard';
import { createSpinner } from '../utils/spinner';

/**
 * Main probe command — orchestrates the full probe pipeline.
 */
export async function runProbe(target: string, options: CLIOptions): Promise<void> {
  const spinner = await createSpinner('Fetching repository metadata...');

  try {
    // Step 1: Fetch repo metadata
    spinner.start();
    const repo = await fetchRepoMetadata(target);
    spinner.succeed(`Repo fetched: ${repo.name}${repo.stars > 0 ? ` (★ ${repo.stars})` : ''}`);

    // Step 2: Detect transport
    const transportSpinner = await createSpinner('Detecting server type...');
    transportSpinner.start();
    const transport = detectTransport(repo);
    transportSpinner.succeed(`Server type: ${transport}`);

    // Step 3: Connect and discover tools
    const connectSpinner = await createSpinner('Connecting to server...');
    connectSpinner.start();
    const connection = await connectToServer(repo, transport, { skipConfirm: options.yes });

    if (connection.connected) {
      connectSpinner.succeed(`Connected (${connection.latencyMs}ms) — ${connection.tools.length} tools found`);
    } else {
      connectSpinner.warn(`Connection skipped — ${connection.error || 'could not connect'}`);
    }

    const tools = connection.tools;

    // Step 4: Score
    const score = scoreServer(repo, tools, connection);

    // Step 5: Compatibility
    const compatibility = checkCompatibility(transport, tools, connection);

    // Step 6: Generate configs
    const configs = generateConfigs(repo);

    // Assemble result
    const result: ProbeResult = {
      repo,
      transport,
      connection,
      tools,
      compatibility,
      score,
      configs,
      probedAt: new Date().toISOString(),
    };

    // Output based on flags
    if (options.json) {
      const filePath = saveJsonReport(result);
      const chalk = (await import('chalk')).default;
      console.log(`\n${chalk.green('✔')} Report saved to ${chalk.white(filePath)}\n`);
      return;
    }

    if (options.md) {
      const filePath = saveMarkdownReport(result);
      const chalk = (await import('chalk')).default;
      console.log(`\n${chalk.green('✔')} Report saved to ${chalk.white(filePath)}\n`);
      return;
    }

    // Copy config to clipboard if requested
    let copied = false;
    if (options.copy && options.config) {
      const configStr = configs[options.config.toLowerCase()];
      if (configStr) {
        copied = await copyToClipboard(configStr);
      }
    }

    // Display terminal output
    await displayResults(result, {
      showTools: options.tools,
      showScore: options.score,
      configClient: options.config,
      copied,
    });
  } catch (error) {
    spinner.fail(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
