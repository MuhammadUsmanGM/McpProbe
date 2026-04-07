# Contributing to MCPProbe

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to MCPProbe. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Local Development Setup

To develop locally, you'll need Node.js (v18+) and npm installed.

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/mcpprobe.git
   cd mcpprobe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the CLI tool in dev mode:
   ```bash
   npm run dev -- https://github.com/modelcontextprotocol/sqlite
   ```

4. Compile for production testing:
   ```bash
   npm run build
   node dist/index.js --help
   ```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the CLI interface, this includes new CLI flags or scoring metrics.
3. Keep pull requests focused on a single issue/feature.
4. You may merge the Pull Request in once you have the sign-off of the maintainers, or if you do not have permission to do that, you may request the reviewer to merge it for you.

## Code Style & Scripts

- We use TypeScript targeting `ES2020`.
- All UI components on the terminal use `chalk` for color and `boxen` for panels. Please keep the CLI output clean and minimal.
- All new dependencies should be justified as we aim to stay lightweight for `npx` executions.

## Creating an Issue

- If you spot a problem with the CLI (e.g. failing to parse a specific MCP server), please create an issue spanning:
  1. The OS you're running on.
  2. The target URL / Local path being probed.
  3. What the expected output was versus the reality.
