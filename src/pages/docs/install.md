---
layout: ../../layouts/Docs.astro
title: Install
---

# Install the MCP server

Table Intelligence ships as a **local MCP server** (`tabint`). Your agent starts it on your
machine over stdio; it talks to this website only to read your subscription tier and to save the
reports, campaigns, and emails you explicitly ask it to save. Your datasets never leave your
machine.

Every supported agent uses the **same command + environment variables** — only the config file
location and shape differ. This page covers each one.

## Prerequisites

1. **Python 3.10 or newer** — `python3 --version`.
2. **[uv](https://docs.astral.sh/uv/)** (recommended) or plain `pip`/`venv`.
3. **An API key** — [create a free account](/signup) (it includes a 3‑day trial) and copy the
   `ti_...` key from **Account → API keys**.
4. **The package itself.** It is **not on PyPI** — install it from a local clone:

   ```bash
   git clone https://github.com/shubham303/TableIntelligence.git
   cd TableIntelligence

   # with uv (recommended)
   uv sync --extra mcp            # creates .venv/ and installs everything

   # …or with plain pip
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -e ".[mcp]"
   ```

   Remember the **absolute path** to this clone and its `.venv` — you'll paste it into the
   config blocks below.

## The shared command block

Every agent below runs the same thing: the venv's Python, invoking the `tabint.mcp_server`
module, with two environment variables. All examples assume you cloned the repo to
`~/codes/TableIntelligence` — **replace that path with your own**.

| Field | Value |
|-------|-------|
| `command` | `/Users/<you>/codes/TableIntelligence/.venv/bin/python` |
| `args` | `["-m", "tabint.mcp_server"]` |
| `env.TABINT_API_KEY` | your `ti_...` key |
| `env.TABINT_CONTROL_PLANE_URL` | `https://shubhamrandive.com` |

If you'd rather invoke the console script directly, `/Users/<you>/codes/TableIntelligence/.venv/bin/tabint-mcp`
works too — drop `args` and use it as the `command`. The module form above is the most portable.

---

## Claude Code

Claude Code is the Anthropic CLI. The fastest way in is its `claude mcp add` command, which writes
the config for you.

**Option A — CLI (recommended):**

```bash
claude mcp add table-intelligence \
  /Users/<you>/codes/TableIntelligence/.venv/bin/python \
  -- -m tabint.mcp_server \
  -e TABINT_API_KEY=ti_xxx \
  -e TABINT_CONTROL_PLANE_URL=https://shubhamrandive.com \
  -s user
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
      "command": "/Users/<you>/codes/TableIntelligence/.venv/bin/python",
      "args": ["-m", "tabint.mcp_server"],
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
      "command": "/Users/<you>/codes/TableIntelligence/.venv/bin/python",
      "args": ["-m", "tabint.mcp_server"],
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
command = "/Users/<you>/codes/TableIntelligence/.venv/bin/python"
args = ["-m", "tabint.mcp_server"]

[mcp_servers.table-intelligence.env]
TABINT_API_KEY = "ti_xxx"
TABINT_CONTROL_PLANE_URL = "https://shubhamrandive.com"
```

Codex also has a `codex mcp add` helper in recent versions that writes the same file.

> Known issue: some Codex builds fail to detect `config.toml` MCP entries on first run
> (see openai/codex#3441). If the server doesn't show up, restart Codex or re-run
> `codex mcp list` to force a re-scan.

## Windsurf

Windsurf (Codeium) reads:

- **macOS / Linux:** `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "table-intelligence": {
      "command": "/Users/<you>/codes/TableIntelligence/.venv/bin/python",
      "args": ["-m", "tabint.mcp_server"],
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
      "command": "/Users/<you>/codes/TableIntelligence/.venv/bin/python",
      "args": ["-m", "tabint.mcp_server"],
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
      "command": "/Users/<you>/codes/TableIntelligence/.venv/bin/python",
      "args": ["-m", "tabint.mcp_server"],
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
      "command": "/Users/<you>/codes/TableIntelligence/.venv/bin/python",
      "args": ["-m", "tabint.mcp_server"],
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

---

## Verify it works

In your agent, ask:

> What's my Table Intelligence account status?

The agent should call the **`account_status`** tool and report your tier (`trial`, `paid`, or
`free`). If it reports `free` even though you set `TABINT_API_KEY`, double-check the key and that
the venv path is absolute and correct.

## Troubleshooting

- **"command not found" / process exits immediately.** The `command` path must be absolute and
  must point at the venv's `python` binary *after* you've run `uv sync --extra mcp` (or
  `pip install -e ".[mcp]"`). Re-check the path; do not rely on `PATH`.
- **`account_status` says `free` with a key set.** Verify `TABINT_API_KEY` is spelled correctly
  and starts with `ti_`. The key is validated against
  `TABINT_CONTROL_PLANE_URL` — leave it at `https://shubhamrandive.com` unless you've been told
  otherwise.
- **"not entitled" / `paid_feature` on a trial account.** Trials last 3 days from signup. After
  that, subscribe on the [pricing page](/pricing), or recheck `account_status`.
- **Cowork can't see the server.** Cowork is remote-only — see the note in the Claude Desktop
  section. Use Claude Code or Claude Desktop for local installs.
- **Server shows as failed in the agent.** Run the command manually in a terminal to see the
  startup error:
  ```bash
  /Users/<you>/codes/TableIntelligence/.venv/bin/python -m tabint.mcp_server
  ```
  It should start and wait silently for stdio input. If it crashes, the traceback will tell you
  why (most often a missing dependency or wrong Python version).

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `TABINT_API_KEY` | yes | Your `ti_...` account key from [Account → API keys](/dashboard/account). Entitles you to paid tools and identifies your saved reports/campaigns. |
| `TABINT_CONTROL_PLANE_URL` | no (defaults to `https://shubhamrandive.com`) | The website base URL the server calls for entitlement + storage. |
| `TABULAR_BASE` | no | Where on-disk analysis sessions are stored (defaults to the current working directory). |
