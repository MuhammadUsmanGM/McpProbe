<div align="center">
  <h1>MCPProbe</h1>

  <p>
    [![npm version](https://img.shields.io/npm/v/mcpprobe.svg?style=for-the-badge&color=8B5CF6)](https://www.npmjs.org/package/mcpprobe)
    [![npm downloads](https://img.shields.io/npm/dm/mcpprobe.svg?style=for-the-badge&color=10B981)](https://www.npmjs.org/package/mcpprobe)
    [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  </p>

  <p><strong>Probe any MCP server in seconds — tools, compatibility, score, configs.</strong></p>
</div>

---

**MCPProbe** is a zero-install CLI that instantly dissects any Model Context Protocol (MCP) server. Pass a GitHub URL or local path, and it will automatically extract the tools it exposes, grade its quality, verify compatibility with major AI clients, and generate ready-to-paste configurations.

## ⚡ Quick Start

No installation required. Just run it via `npx`:

```bash
npx mcpprobe https://github.com/modelcontextprotocol/sqlite
```

*(You can also run it against a local directory: `npx mcpprobe ./my-mcp-server`)*

## ✨ Features

- 🔍 **Auto-Discovery:** Automatically detects stdio vs HTTP/SSE transports.
- 🛠️ **Tool Extraction:** Parses every tool, description, and input schema.
- 🎯 **Client Compatibility:** Verifies readiness for **13 major AI clients** — Claude Desktop, Claude Code, Cursor, Windsurf, Cline, VS Code (Copilot), Codex, Gemini CLI, Goose, Continue, Zed, Amp, and JetBrains AI.
- 🏆 **Health Score:** Grades the server (0-100) based on responsiveness, typing, and safety.
- ⚙️ **Config Generator:** Spits out exact JSON configurations to paste into your AI client.
- 🧾 **Exportable Reports:** Save full analyses via `--md` or `--json`.

## 💻 Commands

```bash
npx mcpprobe <github-url-or-local-path> [options]

Options:
  --json             Save report as JSON
  --md               Save report as Markdown
  --tools            Display only the tools
  --score            Display only the health score
  --config <client>  Show config for a specific client
                     (claude, claude-code, cursor, windsurf, cline, vscode,
                      codex, gemini, goose, continue, zed, amp, jetbrains)
  --copy             Copy the generated config to your clipboard
```

## 🤝 Contributing

We welcome contributions of all sizes! Whether it's adding support for a new AI client config, refining the scoring algorithm, or fixing bugs.

Please read our [**Contributing Guidelines**](CONTRIBUTING.md) to understand how to set up the project locally, run tests, and submit a pull request. We look forward to building this with you!

## 📜 License

[MIT](LICENSE) © Muhammad Usman
