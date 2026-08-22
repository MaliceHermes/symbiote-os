# Phage — LLM Layer Configuration

> Phase 4 — Model layer: local (Ollama) + cloud (OpenAI, Grok, Copilot)

## Status: ✅ Active

### Local Models (Ollama)

| Model | Size | Purpose | Port |
|---|---|---|---|
| `hermes3:8b` | 4.3 GB | Main reasoning model | 11434 |
| `qwen2.5-coder:1.5b` | 0.9 GB | Quick coding tasks | 11434 |
| `phi4-mini:latest` | 2.3 GB | Fast Q&A | 11434 |
| `llama3.2:3b` | 1.9 GB | General purpose | 11434 |
| `minimax-m3:cloud` | 0 GB | Cloud proxy | 11434 |

### Cloud Models (API)

| Provider | Model | API Key Source |
|---|---|---|
| OpenAI | GPT-4o | `.env` → `OPENAI_API_KEY` |
| xAI | Grok (via API) | `.env` → `XAI_API_KEY` |
| GitHub | Copilot | `.env` → `GITHUB_TOKEN` |

### CLI Tools

| CLI | Version | Role |
|---|---|---|
| Hermes Agent | v0.20.4 | Chief-of-staff reasoning |
| Codex CLI | v0.148.0 | Code execution |
| Ollama CLI | v0.32.14 | Local inference |
| GitHub CLI | system | Copilot auth + repo ops |

### Endpoints
- **Local:** http://localhost:11434 (Ollama API)
- **Proxied:** http://localhost:3030/api/ollama/tags (orchestrator proxy)
- **Cloud:** Direct API calls from CLIs

### Test Results
- `qwen2.5-coder:1.5b`: ✅ Responded correctly to "what is 2+2?" → "4"
- `hermes3:8b`: ✅ Loaded and responding on :11434
- Cloud models: ✅ API keys configured in `.env` (user must fill in real values)

### Model Selection
Default fallback chain (configured in `~/.hermes/config.yaml`):
1. Nous (primary) → `poolside/laguna-s-2.1:free`
2. OpenRouter (secondary) → `anthropic/claude-sonnet-4`
3. Z.ai → `glm-4.5`
