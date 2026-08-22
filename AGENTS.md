# AGENTS.md — SymbioteOS Development Guide

## Project Overview
SymbioteOS — Local-first portable agentic OS built on Venom (Debian 13 SSD) + Tendril (Tor) + Toxin (Android + microG).

## Architecture (Metaphor Map)
| Component | Role | Local Path |
|---|---|---|
| **Venom** | SSD brain (Debian 13 + Hyprland) | `/` (portable SSD) |
| **Hive** | Vault (3 cages) | `~/.symbiote-brain/` |
| **Carnage** | ACL + PII redaction | `~/.carnage_acl.py` |
| **Phage** | LLM layer (Hermes + Codex + Copilot) | `~/.hermes/`, `~/.npm-global/bin/copilot` |
| **Tendril** | Tor integration | `orchestrator/tendril/` |
| **Toxin** | Android prototype (microG) | `toxi/` |
| **Soul** | Persistent agent identity | `~/.symbiote-brain/Claude-Brain/BRAIN.md` |

## Development Rules
1. Never commit `cmdline-tools.zip`, `gradle-wrapper.jar`, `local.properties`, `.env`
2. Carnage ACL enforces `Business-Private/` cage is inaccessible to hermes user (uid 996)
3. All commits should reference the relevant Symbiote component (Venom/Tendril/Toxin/etc.)

## Tooling
- **Primary agent:** Hermes v0.20.4 (`~/.hermes/config.yaml`)
- **Code execution:** Codex CLI (`codex`)
- **Code review:** Copilot CLI (`copilot`) — ACP server on port 3456
- **Models:** Ollama (hermes3:8b, qwen2.5-coder:1.5b, phi4-mini, llama3.2:3b)
- **Orchestrator:** http://localhost:3030
- **Frontend:** http://localhost:5173 (Vite + React + Tailwind)

## Quick Commands
```bash
# Start all services
cd ~/projects/symbiote-os && ./start.sh

# Run the Toxin AVD
cd toxin && ./launch-toxin-avd.sh

# Daily paper review (runs at 9 AM via cron)
bash ~/.hermes/scripts/morning-paper-review.py

# Copilot interactive session (4th brain)
copilot --add-dir ~/projects/symbiote-os/
```

## Daily Review Questions
1. What identity elements changed today and why?
2. Did any preferences drift from previous sessions?
3. Are pending actions still aligned with long-term goals?
4. Did any new relationships (AgentMail threads, Substack mentions) need tracking?
