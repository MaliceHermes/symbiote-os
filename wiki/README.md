# Symbiote-OS — Living Knowledge Base

> A privacy-first, portable agentic operating system.  
> Venom (Debian 13 SSD) + Tendril (Tor) + Toxin (Android + microG).  
> CLIs: Hermes + Codex + Copilot + Ollama + OpenAI + Docker. (Grok retired, ProtonVPN → Twingate.)

## Quick Links
- [Architecture Overview](01-Architecture/00-overview.md)
- [Hive Structure](01-Architecture/01-hive-structure.md)
- [Carnage ACL](01-Architecture/02-carnage-acl.md)
- [Phage (LLM Layer)](01-Architecture/03-phage-llm-layer.md)
- [Soul — Agent Identity](01-Architecture/04-soul-identity.md)
- [Tendril (Tor Setup)](02-Components/01-tendril-tor.md)
- [Toxin (Android + microG)](02-Components/02-toxin-android.md)
- [AgentMail](02-Components/03-agentmail.md)
- [Proton Drive](02-Components/04-proton-drive.md)
- [Open Notebook](02-Components/05-open-notebook.md)
- [Copilot CLI](02-Components/07-copilot.md)
- [Installation Guide](03-Guides/00-install-symbiote-os.md)
- [Session Logs](03-Guides/01-session-logs.md)
- [CLI Reference](05-Reference/00-cli-reference.md)

## Status

| Phase | Component | Status |
|---|---|---|
| Phase 1 | Venom (SSD) | ✅ Running |
| Phase 2 | Hive | ✅ Active |
| Phase 3 | Carnage ACL | ✅ Active |
| Phase 4 | Phage (LLM Layer) | ✅ Ollama 5 models + Nous Research + OpenAI |
| Phase 5 | Tendril | ✅ Tor + Tails OTG prepared |
| Phase 6 | Toxin | ✅ Android Studio + microG AVD + Open Notebook |
| Phase 7 | Soul (Identity) | ✅ Design complete + active |
| Phase 7b | Copilot CLI | ✅ Active + Logged In as MaliceHermes |

## Triple-Brain CLIs

| CLI | Version | Role |
|---|---|---|
| Hermes | v0.20.4 | Chief-of-staff reasoning (primary) |
| Codex | v0.148.0 | Code execution + PR workflows |
| Copilot | v1.0.80 | Standalone CLI agent + inline suggestions |
| Ollama | v0.32.14 | Local inference (5 models) |
| OpenAI | API | Cloud reasoning |
| AgentMail | MCP 1.0.2 | Agent-owned email |

## Live Services
- Orchestrator: http://localhost:3030
- Frontend: http://localhost:5173
- Ollama: http://localhost:11434
- Open Notebook: http://localhost:8502
- Open Notebook API: http://localhost:5055
- SurrealDB: http://localhost:8000
- Tor Onion: `7oshsadnhldnwmtlw2xyelie4tl2apngpr45rd53ms5xa4kclnof24id.onion:3030`

## Installed CLIs
| CLI | Version | Purpose |
|---|---|---|
| Hermes | v0.20.4 | Chief-of-staff reasoning |
| Codex | v0.148.0 | Code execution |
| Copilot | v1.0.80 | Standalone CLI agent + inline suggestions |
| Ollama | v0.32.14 | Local inference (5 models) |
| OpenAI | API | Cloud reasoning |
| Grok | — | Deprecated (retired) |
| AgentMail | MCP 1.0.2 | Agent-owned email |
| Tails | 5.10.1 | OTG jump-box (USB) |
| Docker | 26.1.5 | Container runtime (Open Notebook) |

## Vault Sync Locations
- Local: `~/.symbiote-brain/` (3 cages: Life-OS, Business-Private, Claude-Brain)
- MEGA Sync: `~/MEGA/The Hive/`
- Proton Drive: pending manual setup (Business-Private backups)
- Substack: `~/Downloads/UncannyOS/Projects/Active/GeekzNThingz/Drafts/`
