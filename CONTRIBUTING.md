# Contributing to MCPProbe

First off, thanks for taking the time to contribute! 🎉

This repository is structured as a monorepo containing multiple packages (currently CLI, with Web upcoming). The following is a set of guidelines for contributing to MCPProbe. Feel free to propose changes to this document in a pull request.

## Local Development Setup

To develop locally, you'll need Node.js (v18+) and npm installed.

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/mcpprobe.git
   cd mcpprobe
   ```

2. Navigate to the specific package you want to work on (e.g. the CLI):
   ```bash
   cd packages/cli
   npm install
   ```

3. Run the CLI tool in dev mode:
   ```bash
   npm run dev -- https://github.com/modelcontextprotocol/sqlite
   ```

4. Compile for production testing before proposing changes:
   ```bash
   npm run build
   node dist/index.js --help
   ```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Keep pull requests focused on a single issue/feature. 
3. If changing the CLI, update the `packages/cli/README.md` with details of changes to the CLI interface (like new flags or scoring metrics).
4. Outline exactly what you've changed in the Pull Request description for easier review.

## Code Style & Guidelines

- We use TypeScript targeting `ES2020` for standard packages.
- Within the CLI package, UI components use `chalk` for color and native terminal commands to keep dependencies minimal (crucial for `npx` execution times).
- All new dependencies should be heavily justified to retain ultra-fast execution speeds.

## Creating an Issue

If you spot a problem with the CLI (e.g. failing to parse a specific MCP server), please create an issue spanning:
1. The OS you're running on.
2. The target URL / Local path being probed.
3. What the expected output was versus the reality.
