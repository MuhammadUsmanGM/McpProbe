# MCPProbe

> Probe any MCP server in seconds — tools, compatibility, score, configs.

**Zero-install CLI** that analyzes any MCP server and tells you everything about it: what tools it exposes, which AI clients support it, a health score, and ready-to-paste config snippets.

```bash
npx mcpprobe https://github.com/user/some-mcp-server
```

---

## What It Does

- **Fetches** repo metadata from GitHub API
- **Detects** the server type (stdio vs HTTP/SSE)
- **Connects** to the server and calls `tools/list`
- **Parses** every tool — name, description, input schema
- **Checks** compatibility against 4 AI clients
- **Scores** the server out of 100
- **Generates** copy-paste config for each client
- **Outputs** everything beautifully in the terminal

---

## Install

No install needed. Just run with `npx`:

```bash
npx mcpprobe <github-url>
```

Or install globally:

```bash
npm install -g mcpprobe
```

---

## Usage

```bash
# Basic probe
npx mcpprobe <github-url>

# Save report as JSON file
npx mcpprobe <github-url> --json

# Save report as markdown file
npx mcpprobe <github-url> --md

# Only show tools
npx mcpprobe <github-url> --tools

# Only show score
npx mcpprobe <github-url> --score

# Show config for a specific client
npx mcpprobe <github-url> --config claude
npx mcpprobe <github-url> --config cursor
npx mcpprobe <github-url> --config windsurf
npx mcpprobe <github-url> --config cline

# Copy config to clipboard
npx mcpprobe <github-url> --config claude --copy

# Probe a local MCP server
npx mcpprobe ./path/to/local/mcp-server

# Version
npx mcpprobe --version

# Help
npx mcpprobe --help
```

---

## Output

```
┌─────────────────────────────────────────┐
│  MCPProbe v1.0.0                        │
└─────────────────────────────────────────┘

Probing https://github.com/user/my-mcp-server...

✔ Repo fetched         my-mcp-server (★ 342)
✔ Server type          stdio
✔ Connected            120ms
✔ Tools discovered     7

──────────────────────────────────────────
  TOOLS (7)
──────────────────────────────────────────

  search_web
  └─ Search the internet for a query
     Inputs: query (string, required)
             max_results (number, optional)

  read_file
  └─ Read contents of a local file
     Inputs: path (string, required)

  ... 5 more tools

──────────────────────────────────────────
  COMPATIBILITY
──────────────────────────────────────────

  Claude Desktop    ✅  Ready
  Cursor            ✅  Ready
  Windsurf          ⚠️   Missing tool descriptions (3)
  Cline             ✅  Ready

──────────────────────────────────────────
  SCORE   82 / 100
──────────────────────────────────────────

  ✔  Responds under 3s              +20
  ✔  All tools have descriptions    +20
  ✔  All inputs typed               +15
  ✔  No hardcoded secrets           +20
  ✔  README with install guide      +15
  ✗  Missing error schemas          +0 / 10

──────────────────────────────────────────
  CONFIG  →  Claude Desktop
──────────────────────────────────────────

  {
    "mcpServers": {
      "my-mcp-server": {
        "command": "npx",
        "args": ["-y", "my-mcp-server"]
      }
    }
  }
```

---

## Scoring

| Check | Points | Criteria |
|-------|--------|----------|
| Responds under 3s | 20 | Probe latency < 3000ms |
| All tools described | 20 | Every tool has a description |
| All inputs typed | 15 | Every input has a type |
| No hardcoded secrets | 20 | No API keys/tokens in source |
| README with install guide | 15 | README.md exists with setup info |
| Error handling | 10 | Input schemas have error definitions |

**Grades:** A (80-100) · B (60-79) · C (40-59) · F (<40)

---

## Compatibility

Checks readiness for:

- **Claude Desktop** — stdio only, needs tool descriptions
- **Cursor** — stdio + HTTP, needs typed inputs
- **Windsurf** — stdio + HTTP, needs tool descriptions
- **Cline** — stdio only, needs tool descriptions

---

## License

MIT © Muhammad Usman
