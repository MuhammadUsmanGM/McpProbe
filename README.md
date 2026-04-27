<div align="center">
  <img src="https://raw.githubusercontent.com/modelcontextprotocol/specification/main/mcp-logo.png" width="80" height="80" alt="MCP Logo" />
  <h1>MCPProbe</h1>

  <p>
    <a href="https://www.npmjs.com/package/mcpprobe"><img src="https://img.shields.io/npm/v/mcpprobe.svg?style=for-the-badge&color=8B5CF6&labelColor=1e1e2e" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/mcpprobe"><img src="https://img.shields.io/npm/dm/mcpprobe.svg?style=for-the-badge&color=10B981&labelColor=1e1e2e" alt="Downloads" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&color=3b82f6&labelColor=1e1e2e" alt="License" /></a>
  </p>

  <p><strong>Instant diagnostics for the Model Context Protocol ecosystem.</strong></p>
  <p><i>Probe any MCP server in seconds — extract tools, verify compatibility, and generate configs.</i></p>
</div>

---

## 🧐 What is MCPProbe?

Building Model Context Protocol (MCP) servers is often a "black box" experience. You write the code, but you don't know if the schema is valid, if the latency is acceptable, or if it will actually work inside **Cursor**, **Claude**, or **VS Code**.

**MCPProbe** solves this. It acts as a universal diagnostic layer that connects to any MCP server (local or remote), dissects its capabilities, and tells you exactly how it performs.

## ⚡ Quick Start

No installation required. Instantly probe any server using `npx`:

```bash
# Probe a remote GitHub repository
npx mcpprobe https://github.com/wong2/mcp-slack-server

# Probe a local directory
npx mcpprobe ./my-custom-server
```

## ✨ Core Features

*   🔍 **Auto-Discovery:** Automatically detects transport protocols (Stdio vs. HTTP/SSE).
*   🛠️ **Tool Inspection:** Extracts every exposed tool, including nested descriptions and JSON-Schema arguments.
*   🏆 **Health Scoring:** A strict 0-100 grading system based on responsiveness, documentation quality, and security.
*   🎯 **Compatibility Matrix:** Verifies readiness for **13+ AI clients** including:
    *   *Claude Desktop, Cursor, Windsurf, Cline, VS Code (Copilot), Gemini CLI, Goose, Continue, Zed, and more.*
*   ⚙️ **Config Generator:** Generates production-ready JSON configurations to paste directly into your AI clients.

## 💻 CLI Commands

```bash
npx mcpprobe <github-url-or-local-path> [options]

Options:
  --json             💾 Export full analysis as a JSON file
  --md               📝 Export full analysis as a Markdown report
  --tools            🛠️  Display only the tools list
  --score            🏆 Display only the health score
  --config <client>  ⚙️  Generate config for: (cursor, claude, windsurf, etc.)
  --copy             📋 Copy the generated config to clipboard
  --dry-run          🧪 Static analysis only — skip server execution
  -y, --yes          ⏩ Skip confirmation prompts for npx execution
```

## 🤝 Contributing

We are building the definitive diagnostic tool for the MCP ecosystem. Contributions to the scoring algorithm, client configuration templates, or transport detection are highly welcome!

Please check the [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

<div align="center">
  <p>Built with ❤️ for the AI Developer Community</p>
  <p>MIT © 2026 Muhammad Usman</p>
</div>
