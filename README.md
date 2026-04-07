<div align="center">
  <h1>MCPProbe</h1>

  <p>
    [![npm version](https://img.shields.io/npm/v/mcpprobe.svg?style=for-the-badge&color=8B5CF6)](https://www.npmjs.org/package/mcpprobe)
    [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  </p>

  <p><strong>Probe any MCP server in seconds — tools, compatibility, score, configs.</strong></p>

```text
███╗   ███╗ ██████╗██████╗ ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔════╝
██╔████╔██║██║     ██████╔╝██████╔╝██████╔╝██║   ██║██████╔╝█████╗  
██║╚██╔╝██║██║     ██╔═══╝ ██╔═══╝ ██╔══██╗██║   ██║██╔══██╗██╔══╝  
██║ ╚═╝ ██║╚██████╗██║     ██║     ██║  ██║╚██████╔╝██████╔╝███████╗
╚═╝     ╚═╝ ╚═════╝╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
```
</div>

---

The **MCPProbe** repository contains tools to test, analyze, and map Model Context Protocol (MCP) servers locally or remotely.

## 📦 Packages

| Package | Description | Status |
|---|---|---|
| [`packages/cli`](./packages/cli) | Zero-install CLI tool to instantly probe MCP servers. | ✅ Published |
| [`packages/web`](./packages/web) | Interactive web dashboard for visual MCP exploration. | 🚧 Coming Soon |

---

## ⚡ CLI — Quick Start

No installation required. Jump straight into the CLI using `npx`:

```bash
npx mcpprobe https://github.com/modelcontextprotocol/sqlite
```

*(You can also probe local directories: `npx mcpprobe ./my-mcp-server`)*

**Features:**
- 🔍 **Auto-Discovery:** stdio vs HTTP/SSE.
- 🛠️ **Tool Extraction:** Parses every tool and schema.
- 🎯 **Client Compatibility:** Claude Desktop, Cursor, Windsurf, Cline.
- 🏆 **Health Score:** Strict 0-100 grading system.
- ⚙️ **Config Generator:** Ready-to-paste JSON setups.

[**📖 View the full CLI Docs →**](./packages/cli/README.md)

---

## 🌐 Web — Coming Soon

A rich, drag-and-drop web interface for exploring your MCP fleet visually. It will connect to your local servers, render interactive node maps of available tools, and let you test JSON-RPC payloads in real time directly from the browser. 

*Stay tuned for updates.*

---

## 🤝 Contributing

We welcome contributions across all packages! Whether it's adding support for a new AI client config in the CLI, or laying the foundation for the web package.

Please read our [Contributing Guidelines](CONTRIBUTING.md) to understand how to set up the repository locally, run tests, and submit pull requests.

## 📜 License

[MIT](LICENSE) © Muhammad Usman
