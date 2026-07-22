---
layout: ../../layouts/Docs.astro
title: Install
---

# Install the MCP server

Table Intelligence ships as a **local MCP server**. Your agent starts it on your
machine over stdio; it talks to this website only to read your role (`free` or `pro`) and to save the
reports, campaigns, and emails you explicitly ask it to save. Your datasets never leave your
machine.

Every supported agent uses the **same command + environment variables** — only the config file
location and shape differ. This page covers each one.

## Prerequisites

1. **[uv](https://docs.astral.sh/uv/)** (recommended) — it runs the server in an isolated
   environment with no manual setup. Install it with
   `curl -LsSf https://astral.sh/uv/install.sh | sh` (macOS/Linux) or
   `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows).
2. **An API key** — [create a free account](/signup) (it includes a 3‑day trial) and copy the
   `ti_...` key from **Account → API keys**.

That's it. The package is on PyPI (`tabint`), so `uvx` downloads and runs it on first launch —
**no `git clone`, no virtualenv, no `pip install`**.

> **Why `--from tabint tabint-mcp`?** The *package* is named `tabint`; `tabint-mcp` is the server
> command inside it. `uvx --from tabint tabint-mcp` tells uv to install the `tabint` package and
> then run its `tabint-mcp` entry point.

## The shared command block

Every agent below runs the same thing — `uvx` launching the server, with two environment
variables:

| Field | Value |
|-------|-------|
| `command` | `uvx` |
| `args` | `["--from", "tabint", "tabint-mcp"]` |
| `env.TABINT_API_KEY` | your `ti_...` key |
| `env.TABINT_CONTROL_PLANE_URL` | `https://shubhamrandive.com` |

Prefer a one-off check first? Run it from your terminal:

```bash
TABINT_API_KEY=ti_xxx uvx --from tabint tabint-mcp --help
```

It should install quickly and print the server banner. If that works, the config blocks below will
work too.

---

## Claude Code

Claude Code is the Anthropic CLI. The fastest way in is its `claude mcp add` command, which writes
the config for you.

**Option A — CLI (recommended):**

```bash
claude mcp add table-intelligence \
  --env TABINT_API_KEY=ti_xxx \
  --env TABINT_CONTROL_PLANE_URL=https://shubhamrandive.com \
  -s user \
  -- uvx --from tabint tabint-mcp
```

`-s user` installs it globally; use `-s project` to check it into a repo's `.mcp.json`, or
`-s local` (the default) for just this project.

**Option B — config file:**

- User scope: `~/.claude.json` → top-level `mcpServers` key.
- Project scope: `<project>/.mcp.json`.

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "ti_xxx",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  }
}
```

Verify with `claude mcp list` and `claude mcp get table-intelligence`.

## Claude Desktop

Claude Desktop reads a single JSON file.

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add (or merge into) the `mcpServers` object:

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "ti_xxx",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  }
}
```

Restart Claude Desktop after editing. The server appears under **Settings → Connectors**.

> **Claude Cowork is different.** Cowork (the web/team product at claude.ai) can only reach
> **remote** MCP servers over HTTP with OAuth — it cannot launch a local stdio process. To use
> Table Intelligence from Cowork you would need to deploy it as a remote server; the local install
> on this page works with Claude Code and Claude Desktop, not Cowork.

## Codex (OpenAI)

Codex keeps MCP servers in `~/.codex/config.toml`, one `[mcp_servers.<name>]` table per server:

```toml
[mcp_servers.table-intelligence]
command = "uvx"
args = ["--from", "tabint", "tabint-mcp"]

[mcp_servers.table-intelligence.env]
TABINT_API_KEY = "ti_xxx"
TABINT_CONTROL_PLANE_URL = "https://shubhamrandive.com"
```

Codex also has a `codex mcp add` helper in recent versions that writes the same file.

> Known issue: some Codex builds fail to detect `config.toml` MCP entries on first run
> (see openai/codex#3441). If the server doesn't show up, restart Codex or re-run
> `codex mcp list` to force a re-scan.

## Cursor

Cursor reads `.cursor/mcp.json` (per project) or the **Settings → MCP** panel (global):

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "ti_xxx",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  }
}
```

## Windsurf

Windsurf (Codeium) reads:

- **macOS / Linux:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "ti_xxx",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  }
}
```

You can also open this file from inside Windsurf: click the **hammer icon** in the Cascade panel →
**Configure**.

## Cline (VS Code extension)

Cline stores MCP config in VS Code's global storage:

```
~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "ti_xxx",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Or use the UI: open the Cline panel → **Configure** tab → **Configure MCP Servers**.

## Zed

Zed reads a `context_servers` block in settings.

- **User (global):** `~/.config/zed/settings.json`
- **Project:** `<project>/.zed/settings.json`

```json
{
  "context_servers": {
    "table-intelligence": {
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "ti_xxx",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  }
}
```

After saving, confirm the server has a green status dot in **Settings → AI → MCP Servers**. The
project-level file occasionally isn't picked up (zed-industries/zed#51951); prefer the user-level
file if you run into that.

## VS Code with GitHub Copilot

VS Code's agent mode reads `.vscode/mcp.json` (per workspace) or a user-profile MCP config.
You can use the `${input:...}` substitution so VS Code prompts for the key instead of you pasting
it inline:

```json
{
  "servers": {
    "table-intelligence": {
      "type": "stdio",
      "command": "uvx",
      "args": ["--from", "tabint", "tabint-mcp"],
      "env": {
        "TABINT_API_KEY": "${input:tabintKey}",
        "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
      }
    }
  },
  "inputs": [
    {
      "id": "tabintKey",
      "type": "promptString",
      "description": "Your Table Intelligence API key (ti_...)",
      "password": true
    }
  ]
}
```

You can also add it from the command palette → **MCP: Add Server**. VS Code will ask you to approve
any workspace-level `mcp.json` the first time.

## ZCode

ZCode keeps MCP servers under a nested `mcp.servers` key (not a top-level `mcpServers` object, unlike
most agents on this page):

- **User (global):** `~/.zcode/cli/config.json`
- **Workspace (per project):** `<project>/.zcode/config.json`

```json
{
  "mcp": {
    "servers": {
      "table-intelligence": {
        "command": "uvx",
        "args": ["--from", "tabint", "tabint-mcp"],
        "env": {
          "TABINT_API_KEY": "ti_xxx",
          "TABINT_CONTROL_PLANE_URL": "https://shubhamrandive.com"
        }
      }
    }
  }
}
```

Servers from both scopes connect **automatically** at session start — there's no manual
authorization step. Inspect status and reconnect under **Settings → MCP**.

> ZCode also reads `.agents/mcp.json` (with a top-level `mcpServers` key) as a compatibility
> fallback, but only within a scope that has no servers in `.zcode/config.json`. Prefer the
> `mcp.servers` shape above.

---

## Verify it works

In your agent, ask:

> What's my Table Intelligence account status?

The agent should call the **`account_status`** tool and report your role (`pro` or
`free`). If it reports `free` even though you set `TABINT_API_KEY`, double-check the key value and
that it starts with `ti_`.

## Troubleshooting

- **`uvx: command not found`.** Install uv:
  `curl -LsSf https://astral.sh/uv/install.sh | sh` (macOS/Linux) or
  `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows), then restart your shell.
- **First launch is slow.** `uvx` downloads the package and its dependencies on first run; after
  that they're cached and startup is fast. If it stalls, check your network — uv pulls from PyPI.
- **`account_status` says `free` with a key set.** Verify `TABINT_API_KEY` is spelled correctly
  and starts with `ti_`. The key is validated against
  `TABINT_CONTROL_PLANE_URL` — leave it at `https://shubhamrandive.com` unless you've been told
  otherwise.
- **"not entitled" / `pro_feature` on a trial account.** Subscriptions (with a 3-day free trial)
  start on the [pricing page](/pricing). After a trial lapses, `account_status` reports `free`.
- **Cowork can't see the server.** Cowork is remote-only — see the note in the Claude Desktop
  section. Use Claude Code or Claude Desktop for local installs.
- **Server shows as failed in the agent.** Run the command manually in a terminal to see the
  startup error:
  ```bash
  TABINT_API_KEY=ti_xxx uvx --from tabint tabint-mcp
  ```
  It should install (first run) and then wait silently for stdio input. If it crashes, the
  traceback will tell you why (most often a stale uv cache — fix with `uv cache clean`).

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `TABINT_API_KEY` | yes | Your `ti_...` account key from [Account → API keys](/dashboard/account). Entitles you to paid tools and identifies your saved reports/campaigns. |
| `TABINT_CONTROL_PLANE_URL` | no (defaults to `https://shubhamrandive.com`) | The website base URL the server calls for entitlement + storage. |
| `TABULAR_BASE` | no | Where on-disk analysis sessions are stored (defaults to the current working directory). |
