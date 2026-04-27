import chalk from 'chalk';
import { ProbeResult, CLIOptions, ConnectionResult } from '../types';
import { fetchRepoMetadata } from '../engine/fetcher';
import { detectTransport } from '../engine/detector';
import { connectToServer } from '../engine/connector';
import { scoreServer } from '../analyzer/scorer';
import { checkCompatibility } from '../analyzer/compat';
import { generateConfigs, buildInstallProfile } from '../generator/config';
import { discoverRemoteUrls } from '../engine/connector';
import { displayResults } from '../output/display';
import { saveJsonReport } from '../output/json';
import { saveMarkdownReport } from '../output/markdown';
import { copyToClipboard } from '../utils/clipboard';
import { createSpinner } from '../utils/spinner';

/**
 * Main probe command — orchestrates the full probe pipeline.
 */
export async function runProbe(target: string, options: CLIOptions): Promise<void> {
  const spinner = createSpinner('Fetching repository metadata...');

  try {
    // Step 1: Fetch repo metadata
    spinner.start();
    const repo = await fetchRepoMetadata(target);
    spinner.succeed(`Repo fetched: ${repo.name}${repo.stars > 0 ? ` (★ ${repo.stars})` : ''}`);

    // Step 2: Detect transport
    const transportSpinner = createSpinner('Detecting server type...');
    transportSpinner.start();
    const transport = detectTransport(repo);
    transportSpinner.succeed(`Server type: ${transport}`);

    // Step 3: Connect and discover tools (skip in dry-run mode)
    let connection: ConnectionResult;

    if (options.dryRun) {
      const dryRunSpinner = createSpinner('Dry run — skipping connection...');
      dryRunSpinner.start();
      connection = { tools: [], latencyMs: 0, connected: false, error: 'Dry run — connection skipped' };
      dryRunSpinner.succeed('Dry run — static analysis only');
    } else {
      const connectSpinner = createSpinner('Connecting to server...');
      connectSpinner.start();
      connection = await connectToServer(repo, transport, {
        skipConfirm: options.yes,
        explicitUrl: options.url,
      });

      if (connection.connected) {
        connectSpinner.succeed(`Connected (${connection.latencyMs}ms) — ${connection.tools.length} tools found`);
      } else {
        connectSpinner.warn(`${transport} server unreachable — ${connection.error || 'no response'}`);
      }
    }

    const tools = connection.tools;

    // Step 4: Score
    const score = scoreServer(repo, tools, connection);

    // Step 5: Compatibility
    const compatibility = checkCompatibility(transport, tools, connection);

    // Step 6: Build install profile + generate configs
    const remoteUrl =
      options.url || (transport === 'http' && !repo.isLocal ? discoverRemoteUrls(repo)[0] : undefined);
    const installProfile = await buildInstallProfile(repo, remoteUrl);
    const configs = generateConfigs(repo, installProfile);

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
      console.log(`\n${chalk.green('✔')} Report saved to ${chalk.white(filePath)}\n`);
      return;
    }

    if (options.md) {
      const filePath = saveMarkdownReport(result);
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
    displayResults(result, {
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
