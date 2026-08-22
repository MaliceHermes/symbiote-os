# CLI Reference

> Installed tools and their roles in Symbiote-OS.

## Core CLIs

| CLI | Path | Version | Role |
|---|---|---|---|
| **Hermes** | `~/.local/bin/hermes` | v0.20.4 | Chief-of-staff reasoning brain |
| **Codex** | `~/.local/bin/codex` | 0.148.0 | Code execution (implements Hermes designs) |
| **Copilot** | `gh auth login` / VS Code extension | — | Inline suggestions + context-aware code edits |
| **Ollama** | `/usr/local/bin/ollama` | 0.32.14 | Local inference |
| **OpenAI** | N/A (API only) | — | Cloud reasoning (GPT-4o) |
| **Nous Research** | N/A (OAuth) | — | Nous inference API (poolside/laguna-s-2.1:free) |
| **Grok** | N/A | Deprecated | Retired — superseded by Codex + Copilot dual-brain |
| **GitHub CLI** | `/usr/bin/gh` | — | Copilot auth + repo operations |
| **AgentMail** | `npx -y agentmail-mcp` | 1.0.2 | Agent-owned email (MCP) |
| **Tor** | `tor` | 0.4.9.11 | Tor relay + hidden services |
| **Tails** | (USB) | 5.10.1 | OTG jump-box (amnesic Linux) |
| **Docker** | `docker` | 26.1.5 | Container runtime (Open Notebook, SurrealDB) |

## Installed Models (Ollama)

| Model | Size | Purpose |
|---|---|---|
| `hermes3:8b` | 4.3 GB | Main reasoning model |
| `qwen2.5-coder:1.5b` | 0.9 GB | Quick coding tasks |
| `phi4-mini:latest` | 2.3 GB | Fast Q&A |
| `llama3.2:3b` | 1.9 GB | General purpose |
| `minimax-m3:cloud` | 0 GB | Cloud proxy (via Minimax API) |

## Useful Commands

### Hermes Agent
```bash
hermes                         # Launch interactive CLI
hermes chat -q "..."           # Single query
hermes setup                    # Setup wizard
hermes doctor                   # Health check
hermes model                    # List/change model
hermes --tui                    # TUI interface
```

### Codex CLI
```bash
codex                           # Interactive mode
codex -q "your question"        # Single query
codex --help                    # Full options
```

### Ollama
```bash
ollama list                     # List models
ollama run <model>              # Run a model
ollama pull <model>             # Download new model
curl localhost:11434/api/tags   # API tags endpoint
```

### Tor
```bash
sudo systemctl start tor        # Start Tor service
sudo systemctl status tor       # Check status
curl --socks5 localhost:9050 http://check.torproject.org  # Test Tor
```

### Open Notebook (Docker)
```bash
~/bin/open-notebook              # Start (with auto-SurrealDB)
~/bin/open-notebook status       # Show running containers + endpoints
~/bin/open-notebook logs         # View container logs
~/bin/open-notebook restart      # Restart Open Notebook
~/bin/open-notebook stop         # Stop container

# Manual docker commands
sg docker -c "docker start open-notebook"   # Resume
sg docker -c "docker stop open-notebook"    # Pause
```

### SurrealDB
```bash
# Start standalone
sg docker -c "docker start surrealdb"

# Connect manually
surreal sql --endpoint ws://localhost:8000 --namespace main --database main \
  --user root --pass symbioteos --insecure
```

### Orchestrator API
```bash
curl http://localhost:3030/api/health      # Health check
curl http://localhost:3030/api/info        # Orchestrator info
curl http://localhost:3030/api/hive        # Hive structure
curl http://localhost:3030/api/chats       # Chat history
curl http://localhost:3030/api/carnage     # Audit log
curl http://localhost:3030/api/ollama/tags # Ollama models
```
