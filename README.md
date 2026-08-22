# Symbiote-OS

> Local-first, portable agentic operating system.  
> **Venom** (Debian 13 SSD) + **Tendril** (Tor) + **Toxin** (Android + microG).  
> **CLIs:** Hermes + Codex + Copilot + Ollama + OpenAI API. (Grok retired, ProtonVPN → Twingate.)

**Status:** Phase 1–7 active. Venom portable SSD ready. Tendril (Tor onion service) integrated. Toxin prototype scaffolded. Soul identity layer designed. Copilot CLI active as 4th brain.

---

## The Concept

**Symbiote OS** is a privacy-first, portable brain you can carry on a USB SSD and boot on any UEFI laptop. It consists of:

- **Venom** (SSD brain) — Debian 13 + Hyprland, portable across machines
- **Eddie** (host body) — Surface Pro 4 or any UEFI laptop
- **The Hive** — 3-cage vault (Life-OS / Business-Private / Claude-Brain), synced via MEGA
- **Carnage** — ACL enforcement + PII redaction + audit logging
- **Phage** — LLM layer (Ollama local + OpenAI/Nous cloud)
- **Tendril** — Tor onion service + OTG amnesic jump-box (Tails/LiveOS)
- **Toxin** — Mobile spawn (Android + microG, prototype in Android Studio)
- **Soul** — Persistent agent identity layer (cross-surface continuity)
- **Copilot** — GitHub Copilot CLI (4th brain, code review + repo ops)

All three setups (Venom/Eddie, OTG Tendril, Toxin phone) sync securely via Tor without leaving traces.

---

## Quick Start

### Option A: Automatic Install (Recommended)

```bash
cd ~/projects
git clone https://github.com/MaliceHermes/symbiote-os.git
cd symbiote-os
bash install.sh
```

The install script will:
- ✅ Create directory structure
- ✅ Clone/install all dependencies
- ✅ Initialize The Hive (`.symbiote-brain/`)
- ✅ Set up Carnage ACL
- ✅ Configure environment files
- ✅ Start Venom orchestrator + frontend

### Option B: Manual Steps

Follow the three master build guides:
1. [SYMBIOTE_BUILD_VENOM_SURFACE_PRO4.md](SYMBIOTE_BUILD_VENOM_SURFACE_PRO4.md) — Debian 13 SSD setup
2. [SYMBIOTE_ORCHESTRATOR_BOOTSTRAP_REVISED.md](SYMBIOTE_ORCHESTRATOR_BOOTSTRAP_REVISED.md) — Orchestrator + CLIs
3. [SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md](SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md) — Tor + OTG + Android

---

## Architecture

```
┌─────────────────────────────────────┐
│   Surface Pro 4 (Eddie)             │  Temporary host
│  ┌─────────────────────────────┐  │
│  │ Venom (SSD)                 │  │  Debian 13 + Hyprland
│  │ • Orchestrator (:3030)      │  │  Hermes, Codex, Copilot, Ollama
│  │ • The Hive (3 cages)        │  │  Carnage, Tendril, Soul
│  │ • Carnage ACL               │  │
│  │ • Soul (identity)           │  │
│  └─────────────────────────────┘  │
│          ↓                          │
│   Tor onion :3030                 │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼──────────┐   ┌─────▼──────────┐
│ OTG Tails    │   │  Toxin Phone   │
│ (jump-box)   │   │  (Android)     │
│ USB-C OTG    │   │  Prototype NOW │
│ Amnesic      │   │  microG +      │
│ Tendril      │   │  Syncthing     │
└──────────────┘   └────────────────┘
```

---

## Three Brains + Shell

| Brain | CLI | Role | Status |
|---|---|---|---|
| **Hermes** | v0.20.4 | Chief-of-staff reasoning (primary agent) | ✅ Ready |
| **Codex** | v0.148.0 | Code execution (implements Hermes designs) | ✅ Ready |
| **Copilot** | v1.0.80 | Code review + repo ops (4th brain, ACP server) | ✅ Active |
| **Phage** | Ollama v0.32.14 | Local inference (5 models) | ✅ Ready |

### Workflow: Design → Implement → Review

1. **Type prompt in frontend** or chat with Hermes
2. **Hermes** — designs solution, outputs architecture doc
3. **Codex** — receives design, implements in code
4. **Copilot** — code review, PR creation, suggestions (via ACP or CLI)
5. **All → Hive** — saved to `~/.symbiote-brain/`, synced via MEGA

Example: `"Build Python script to sync vault to S3"`
→ Hermes designs (config, error handling, logging)
→ Codex implements (working script, tests)
→ Copilot reviews (lint, security, best practices)

---

## Phage — LLM Layer

| Model | Provider | Purpose |
|---|---|---|
| `poolside/laguna-s-2.1:free` | Nous Research | Primary reasoning (via Hermes) |
| `hermes3:8b` | Ollama (local) | Main local reasoning |
| `qwen2.5-coder:1.5b` | Ollama (local) | Quick coding tasks |
| `phi4-mini:latest` | Ollama (local) | Fast Q&A |
| `llama3.2:3b` | Ollama (local) | General purpose |
| `gpt-4o` | OpenAI (cloud) | Cloud reasoning |

**Fallback chain:** Nous → OpenRouter (Claude Sonnet) → Z.ai (GLM-4.5)

---

## Phases

### ✅ Phase 1: Venom (Complete)
Portable Debian 13 SSD + Hyprland desktop + all CLIs

### ✅ Phase 2: Hive (Active)
3-cage vault structure + MEGA sync

### ✅ Phase 3: Carnage (Active)
OS-level ACL + PII redaction + audit logging

### ✅ Phase 4: Phage (Active)
Ollama 5 local models + Nous Research + OpenAI cloud

### ✅ Phase 5: Tendril (Ready)
Tor onion service + Tails OTG jump-box

### ✅ Phase 6: Toxin (Prototype)
Android Studio + microG AVD + Syncthing sync

### ✅ Phase 7: Soul (Active)
Persistent agent identity layer — `brain-state.json`, `Claude-Brain/BRAIN.md`

### ✅ Phase 7b: Copilot (Active)
GitHub Copilot CLI v1.0.80 — logged in as `MaliceHermes`

---

## Project Structure

```
symbiote-os/
├── install.sh                  # One-click setup script
├── start.sh                    # Start orchestrator + frontend
├── stop.sh                     # Stop all services
├── AGENTS.md                   # Project guide for Copilot/Hermes/Codex
├── frontend/                   # React + Vite + Tailwind UI
│   ├── App.jsx                 # Main app (Hive/Carnage/Phage/Roadmap tabs)
│   └── src/                    # Component source
├── orchestrator/               # Node.js + Express backend (:3030)
│   ├── carnage-acl.js          # ACL enforcement + PII redaction
│   ├── temporal-prompt.js      # Temporal logic prompt engine
│   └── index.js                # Main server
├── toxin/                      # Android app (microG + Syncthing)
│   ├── app/                    # Main Android app source
│   ├── base44-toxin-prompt.md  # Android-specific system prompt
│   └── setup scripts           # microG, F-Droid, Aurora Store
├── tendril/                    # Tor + OTG jump-box
└── wiki/                       # Knowledge base (synced from MEGA)
    ├── 01-Architecture/        # Venom, Hive, Carnage, Phage, Soul
    └── 02-Components/          # Tendril, Toxin, AgentMail, Open Notebook
```

---

## Live Services

| Service | URL / Port |
|---|---|
| Orchestrator | http://localhost:3030 |
| Frontend | http://localhost:5173 |
| Ollama | http://localhost:11434 |
| Open Notebook | http://localhost:8502 |
| Open Notebook API | http://localhost:5055 |
| SurrealDB | http://localhost:8000 |
| Tor Onion | `7oshsadnhldnwmtlw2xyelie4tl2apngpr45rd53ms5xa4kclnof24id.onion:3030` |

---

## Environment

```bash
# .env (NOT committed to git)
ORCHESTRATOR_PORT=3030
OPENAI_API_KEY=sk-...
SYMBIOTE_HIVE_ROOT=~/.symbiote-brain
JARVIS_PROJECTS_ROOT=~/projects
```

---

## Security

- **Carnage ACL:** Business-Private locked at OS level (hermes user uid 996 blocked)
- **PII Redaction:** SSN, phone, email, address auto-stripped before handoff
- **Audit Logging:** Every redaction stamped with SHA256, logged to `.carnage_audit.log`
- **Tor Encryption:** Venom ↔ Tendril ↔ Toxin all via Tor onion service
- **Amnesic Jump-Box:** Tails/LiveOS leaves no trace on Surface Pro 4
- **No Secrets in Git:** API keys, .onion addresses, Tor keys never committed

---

## Next Steps

1. ✅ Clone this repo (you're here)
2. ✅ Run `bash install.sh` to set up locally
3. ✅ Follow `SYMBIOTE_BUILD_VENOM_SURFACE_PRO4.md` to build portable SSD
4. ✅ Follow `SYMBIOTE_ORCHESTRATOR_BOOTSTRAP_REVISED.md` to run orchestrator
5. ✅ Follow `SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md` to set up Tor + OTG + Android
6. ⏳ Build React frontend (Hive | Chats | Carnage | Roadmap tabs)
7. ⏳ Test end-to-end: Venom → Tendril → Toxin via Tor

---

## Author

**Malice** — learning in public, building Symbiote-OS as a year-long infrastructure journey.

Read the build log: https://mallic3.substack.com

---

## License

MIT
