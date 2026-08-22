# Copilot — GitHub Copilot CLI

> Phase 7b — Standalone CLI agent for code execution, repo operations, and inline suggestions

## Status: ✅ Active + Logged In

### Setup

- **Package:** `@github/copilot-linux-x64` v1.0.80
- **Install:** `npm install -g @github/copilot-linux-x64`
- **Auth:** `copilot login` → browser OAuth to GitHub
- **Authenticated as:** `MaliceHermes`

### Global Install Location
- **Path:** `~/.npm-global/bin/copilot` (v1.0.80)
- **Node:** v26.7.0 at `~/.local/bin/node`
- **npx:** `npx -y @github/copilot-linux-x64`

## Modes

### Interactive Mode
```bash
copilot
# Full TUI agent session with MCP support, skills, plugins
# Supports --model, --add-dir, --remote for session sharing
```

### Prompt Mode (non-interactive)
```bash
copilot -p "Fix the bug in src/main.py" --allow-all
# Executes prompt and exits
# Use --silent for just the response, --yolo for all permissions
```

### Autopilot Mode
```bash
copilot -p "Implement auth in the API layer" --autopilot
# Runs with minimal human intervention
# Use --max-autopilot-continues to limit iterations (default: 5)
```

## Permissions

| Flag | Scope | Use Case |
|---|---|---|
| `--allow-all` | All tools + all paths + all URLs | Full autonomous operation |
| `--allow-all-tools` | All tools, prompts for paths | Automated coding without path scoping |
| `--allow-all-paths` | All file paths | Work across arbitrary directories |
| `--allow-all-urls` | All URLs/domains | Fetch remote resources freely |
| `--add-dir <path>` | Specific directory | Restrict to project workspace |
| `--deny-tool <tool>` | Exclude specific tool | Block git push, for example |

## Integration with SymbioteOS

### Triple-Brain Configuration
| Brain | CLI | Role |
|---|---|---|
| **Hermes** | `hermes` | Chief-of-staff reasoning (primary) |
| **Codex** | `codex` | Code execution + PR workflows |
| **Copilot** | `copilot` | Inline suggestions + standalone CLI agent |

All three share the same `~/.symbiote-brain/` workspace. Use Copilot for:
- **Code reviews** — `copilot -p "Review src/auth.py"` with `--allow-dir` to project root
- **Repo operations** — PR creation, branch management via GitHub MCP
- **Inline editing** — Interactive mode with `--add-dir ~/projects/symbiote-os/toxin/`
- **MCP-powered tasks** — GitHub MCP server for API access, search, issues

### MCP Servers

Copilot has built-in GitHub MCP server support:

```bash
# Enable all GitHub MCP tools
copilot --enable-all-github-mcp-tools

# Add specific MCP tools
copilot --add-github-mcp-tool "list_issues" --add-github-mcp-tool "create_pull_request"

# Add custom MCP servers
copilot --additional-mcp-config '{"mcpServers": {...}}'
```

### Model Options
```bash
# Force a specific model
copilot --model gpt-5.4 -p "Write a Python function to parse markdown"

# Let Copilot pick automatically (default)
copilot -p "Review this PR" --model auto
```

## Data Flow

```
cron: 0 9 * * *  →  morning-paper-review.sh
                        ├── Byte2byte/TDLR paper review
                        ├── brain-state.json update
                        └── Copilot: code review of any pending changes
                              via MCP or direct CLI invocation
```

## Commands

| Command | Description |
|---|---|
| `copilot` | Start interactive session |
| `copilot login` | Authenticate via browser OAuth |
| `copilot logout` | Remove auth token |
| `copilot version` | Show version |
| `copilot update` | Check for CLI updates |
| `copilot init` | Initialize Copilot instructions in a repo |
| `copilot help <topic>` | Topics: config, permissions, environment, limits, etc. |

## Usage Examples

```bash
# Review the Soul identity doc changes
copilot -p "Summarize recent changes to 01-Architecture/04-soul-identity.md" \
  --add-dir ~/MEGA/Symbiote\ OS\ Wiki \
  --silent

# Interactive coding session scoped to Toxin project
copilot --add-dir ~/projects/symbiote-os/toxin/

# Non-interactive PR creation via GitHub MCP
copilot -p "Create a PR to add Soul wiki doc with the changes in 04-soul-identity.md" \
  --enable-all-github-mcp-tools \
  --allow-all
```

## Notes

- Copilot auth tokens are stored in `~/.copilot/` (gitignored)
- The `-p` (prompt) flag requires `--allow-all` or `--yolo` for autonomous operation
- Session sharing via `--remote` and `--remote-export` enables GitHub web/mobile review
- Custom instructions from `AGENTS.md` are automatically loaded from the working directory
