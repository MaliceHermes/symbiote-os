# Carnage — ACL & PII Redaction Layer

> Phase 3 — OS-level access control and PII stripping

## Status: ✅ Active

### hermes System User
- **UID:** 996
- **GID:** 996 (created as system user)
- **Shell:** `/usr/sbin/nologin`
- **Purpose:** Sandboxed agent user for Carnage ACL enforcement

### Permissions Matrix

| Directory/Resource | Owner | Mode | hermes (uid 996) | Notes |
|---|---|---|---|---|
| `~/.symbiote-brain/Life-OS/` | uncannyblacc | 755 | Read/Execute | Open content |
| `~/.symbiote-brain/Business-Private/` | uncannyblacc | 700 | **BLOCKED** | Access logged to audit |
| `~/.symbiote-brain/Claude-Brain/` | uncannyblacc | 755 | Read/Execute | Handoff + knowledge |
| `~/.symbiote-brain/.env` | uncannyblacc | 600 | **BLOCKED** | Contains API keys |
| `~/.symbiote-brain/*.json` | uncannyblacc | 600 | **BLOCKED** | State files |
| `~/projects/symbiote-os/.env` | uncannyblacc | 600 | **BLOCKED** | API keys + secrets |

### Audit Enforcement
- `.carnage_audit.log` logs all permission violations
- Format: `{"timestamp":"...","action":"...","user":"hermes","path":"...","blocked":true}`

## PII Redaction

### Automatic Redaction
- API keys, tokens, passwords are masked in:
  - Chat responses
  - Tool outputs
  - Log files
  - Configuration dumps
- Redacted strings appear as `***` in all outputs

### Redaction Targets
| Pattern | Masked As |
|---|---|
| `sk-...` (OpenAI keys) | `***` |
| `xai-...` (Grok keys) | `***` |
| `ghp_...` (GitHub tokens) | `***` |
| `am_...` (AgentMail keys) | `***` |
| Password fields in JSON | `***` |

### Audit Log
Location: `~/.symbiote-brain/.carnage_audit.log`
- Empty by default (no violations = clean)
- Append-only when violations occur
- Human-readable JSON lines (JSONL)
