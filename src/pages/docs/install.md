---
layout: ../../layouts/Docs.astro
title: Install
---

# Install the MCP server

## Prerequisites

- **[uv](https://docs.astral.sh/uv/)** (provides `uvx`) and **Python 3.10+**.
- An API key — [create a free account](/signup) and copy it.

## The config block

Add this to your MCP client, pasting your API key:

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "table-intelligence", "table-intelligence-mcp"],
      "env": {
        "TABINT_API_KEY": "<your api key>",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  }
}
```

## Per‑client

| Client | How |
|--------|-----|
| **Claude Cowork** | Add the JSON above in the MCP/connectors settings. |
| **Claude Desktop** | Edit `claude_desktop_config.json` and add the `table-intelligence` entry. |
| **Claude Code** | `claude mcp add` (or edit the MCP config) with the command + env above. |
| **Codex** | Add the server to your `config.toml` MCP section. |
| **Cursor / Windsurf** | Add the JSON to the MCP settings / `mcp.json`. |

## Verify

Ask your agent to run the `account_status` tool — it should report your subscription tier
(`trial`, `paid`, or `free`). If it says `free` with a key set, double‑check `TABINT_API_KEY`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `TABINT_API_KEY` | Your account key (from the website). Required for reports + entitlement. |
| `TABINT_CONTROL_PLANE_URL` | The website base URL (`https://shubhamrandive.com`). |
