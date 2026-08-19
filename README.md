# Symbiote-OS

> Local-first, portable agentic operating system. Venom (Debian 13 SSD) + Tendril (Tor) + Toxin (Android prototype). Hermes + Codex + Ollama + OpenAI + Grok.

**Status: Phase 1–5 in progress. Venom portable SSD ready. Tendril (Tor onion service) integrated. Toxin prototype scaffolded.**

---

## The Concept

**Symbiote OS** is a privacy-first, portable brain you can carry on a USB SSD and boot on any UEFI laptop. It consists of:

- **Venom** (SSD brain) — Debian 13 + Hyprland, portable across machines
- **Eddie** (host body) — Surface Pro 4 or any UEFI laptop
- **The Hive** — 3-cage vault (Life-OS / Business-Private / Claude-Brain), synced via Proton Drive
- **Carnage** — ACL enforcement + PII redaction + audit logging
- **Phage** — LLM layer (Ollama local, OpenAI/Grok cloud)
- **Tendril** — Tor onion service + OTG amnesic jump-box (Tails/LiveOS)
- **Toxin** — Mobile spawn (Android, Syncthing sync, deferred phone; prototype in Android Studio)

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
- ✅ Initialize The Hive (.symbiote-brain/)
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
┌─────────────────────────────┐
│   Surface Pro 4 (Eddie)     │  Temporary host
│  ┌───────────────────────┐  │
│  │ Venom (SSD)           │  │  Debian 13 + Hyprland
│  │ • Orchestrator (:3030)│  │  Hermes, Codex, Ollama
│  │ • The Hive (3 cages)  │  │  Carnage, Tendril
│  │ • Carnage ACL         │  │
│  └───────────────────────┘  │
│        ↓                     │
│   Tor onion :3030           │
└─────────────┬───────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼──────────┐   ┌─────▼──────────┐
│ OTG Tails    │   │  Toxin Phone   │
│ (jump-box)   │   │  (Android)     │
│ USB-C OTG    │   │  Prototype NOW │
│ Amnesic      │   │  Real device   │
│ Tendril      │   │  when acquired │
└──────────────┘   └────────────────┘
```

---

## CLIs (No Claude Code)

| CLI | Role | Status |
|---|---|---|
| **Hermes** | Chief-of-staff reasoning brain | ✅ Ready |
| **Codex** | Code execution (implements Hermes designs) | ✅ Ready |
| **Ollama** | Local inference (Mistral 7B) | ✅ Ready |
| **OpenAI** | Cloud reasoning (GPT-4o) | ✅ Ready (API key needed) |
| **Grok** | xAI reasoning (parallel to Hermes) | ✅ Ready (API key needed) |

---

## Workflow: Design → Implement

1. **Type prompt in frontend**
2. **Hermes (reasoning)** — designs solution, outputs architecture doc
3. **Codex (execution)** — receives design, implements in code
4. **Both → Hive** — saved to `chats.jsonl`, searchable, re-usable

Example: "Build Python script to sync vault to S3"
→ Hermes designs (config, error handling, logging)
→ Codex implements (working script, tests)
→ Both saved + indexed

---

## Phases

### ✅ Phase 1: Venom (Complete)
Portable Debian 13 SSD + Hyprland desktop + all CLIs

### ✅ Phase 2: Hive (In Progress)
3-cage vault structure + local sync + Proton Drive (later)

### ✅ Phase 3: Carnage (Ready)
OS-level ACL + PII redaction + audit logging

### ⏳ Phase 4: Phage-Local
Ollama models + air-gap inference validation

### ✅ Phase 5: Tendril (Now)
Tor onion service + OTG amnesic jump-box + sync protocol

### ⏳ Phase 6: Toxin
Real Android phone + LineageOS + Shelter + Syncthing

---

## Guides

- **[SYMBIOTE_BUILD_VENOM_SURFACE_PRO4.md](SYMBIOTE_BUILD_VENOM_SURFACE_PRO4.md)** — Complete Debian 13 install on Surface Pro 4 SSD
- **[SYMBIOTE_ORCHESTRATOR_BOOTSTRAP_REVISED.md](SYMBIOTE_ORCHESTRATOR_BOOTSTRAP_REVISED.md)** — Node.js orchestrator (Hermes + Codex workflow)
- **[SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md](SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md)** — Tor setup + OTG jump-box + Android prototype

---

## Environment

```bash
# .env (NOT committed to git)
ORCHESTRATOR_PORT=3030
OPENAI_API_KEY=sk-...
XAI_API_KEY=xai-...
SYMBIOTE_HIVE_ROOT=~/.symbiote-brain
JARVIS_PROJECTS_ROOT=~/projects
```

---

## Security

- **Carnage ACL:** Business-Private locked at OS level (Hermes user cannot read)
- **PII Redaction:** SSN, phone, email, address auto-stripped before handoff
- **Audit Logging:** Every redaction stamped with SHA256, logged to `.carnage_audit.log`
- **Tor Encryption:** Venom ↔ Tendril ↔ Toxin all via Tor onion service
- **Amnesic Jump-Box:** Tails/LiveOS leaves no trace on Surface Pro 4
- **No Secrets in Git:** API keys, .onion addresses, Tor keys never committed

---

## Next Steps

1. ✅ Clone this repo (you're here)
2. ⏳ Run `bash install.sh` to set up locally
3. ⏳ Follow `SYMBIOTE_BUILD_VENOM_SURFACE_PRO4.md` to build portable SSD
4. ⏳ Follow `SYMBIOTE_ORCHESTRATOR_BOOTSTRAP_REVISED.md` to run orchestrator
5. ⏳ Follow `SYMBIOTE_TENDRIL_TOXIN_INTEGRATION.md` to set up Tor + OTG + Android
6. ⏳ Build React frontend (Hive | Chats | Carnage | Roadmap tabs)
7. ⏳ Test end-to-end: Venom → Tendril → Toxin via Tor

---

## Author

**Malice** — learning in public, building Symbiote-OS as a year-long infrastructure journey.

Read the build log: https://mallic3.substack.com

---

## License

MIT
