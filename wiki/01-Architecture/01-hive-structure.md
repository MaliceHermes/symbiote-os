# Hive — Three-Cage Vault Structure

## Location
- **Local:** `~/.symbiote-brain/`
- **MEGA Sync:** `~/MEGA/The Hive/`
- **Orchestrator env:** `SYMBIOTE_HIVE_ROOT=${HOME}/.symbiote-brain`

## Structure

```
~/.symbiote-brain/
├── Life-OS/                    [755]  Open — publishable content
│   └── BRAIN.md                [664]  Living notes
├── Business-Private/           [700]  LOCKED — personal/sensitive data
│   └── BRAIN.md                [664]  (hermes user BLOCKED)
├── Claude-Brain/               [755]  Infrastructure & handoffs
│   ├── BRAIN.md                [664]
│   ├── 00-Handoff/
│   │   ├── incoming-briefs/    [755]
│   │   └── outgoing-results/   [755]
│   ├── 01-Knowledge/           [755]
│   └── 02-Tools/               [755]
├── chats.jsonl                 [600]  Conversation log (JSONL)
├── .carnage_audit.log          [600]  PII redaction audit (JSONL)
└── brain-state.json            [600]  { } — JSON state snapshot
```

## Cage Descriptions

### Life-OS (`~/symbiote-brain/Life-OS/`)
- **Mode:** 755 (world-readable within user context)
- **Purpose:** Content intended for public sharing, blog posts, publishable knowledge
- **Sync:** Included in MEGA sync to `~/MEGA/The Hive/Life-OS/`

### Business-Private (`~/symbiote-brain/Business-Private/`)
- **Mode:** 700 (owner-only)
- **Purpose:** Personal documents, financial data, private notes
- **ACL:** hermes system user (uid 996) is BLOCKED — cannot read
- **Warning:** Do not sync to MEGA — keep private keys local

### Claude-Brain (`~/symbiote-brain/Claude-Brain/`)
- **Mode:** 755
- **Purpose:** Infrastructure, handoffs between Hermes/Codex, tool definitions
- **Subdirectories:**
  - `00-Handoff/` — incoming briefs, outgoing results
  - `01-Knowledge/` — learned facts, skills
  - `02-Tools/` — tool configs, scripts

## Notes
- **grok-Brain discrepancy:** The MEGA sync folder contains `grok-Brain` instead of `Claude-Brain` — this appears to be a naming difference from an earlier configuration. The canonical local Hive uses `Claude-Brain`.
- **chats.jsonl:** Format is one JSON object per line: `{"id":"uuid","timestamp":"ISO","prompt":"...","response":"...","source":"..."}`
- **brain-state.json:** Currently `{ }` — placeholder for future state management