# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-07

### Added
- **Core Engine:** Connect to any stdio or HTTP/SSE MCP server via JSON-RPC.
- **Auto-Discovery:** Automatically detect server transport type via `package.json` heuristics or README scanning.
- **Schema Parsing:** Full extraction of tool methods, descriptions, and input schemas.
- **Compatibility Matrix:** Automated readiness checks for `Claude Desktop`, `Cursor`, `Windsurf`, and `Cline`.
- **Scoring System:** 0-100 grading system checking latency, descriptions, typing, hardcoded secrets, and error handling.
- **Config Generator:** Instantly copy-pasteable JSON configs mapped to each AI client's local integration folder.
- **Export Formats:** Interactive colored terminal Output, `--md` (Markdown), and `--json` targets.
- **Zero-Install Support:** Complete readiness for single-command `npx mcpprobe` executions.
