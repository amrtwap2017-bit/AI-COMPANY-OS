# AI Company OS — Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│              NGINX HTTPS :443                   │
│  Hub :3000  │  Portal :3001  │  Engine :8001   │
└─────────────────────────────────────────────────┘
         │           │              │
    Next.js 16   Next.js 16     FastAPI
    16 agents    137 pages      283 modules
         │           │              │
┌─────────────────────────────────────────────────┐
│  PostgreSQL :5432  │  Qdrant :6333  │  Redis   │
│  TB Admin :8030    │  Ollama :11434            │
└─────────────────────────────────────────────────┘
```

## Services
| Service | Port | Purpose |
|---------|------|---------|
| AI Engine | :8001 | FastAPI + AI agents |
| TB Admin | :8030 | Triangle Black business API |
| Hub Dashboard | :3000 | AI OS control center |
| TB Portal | :3001 | Hotel SaaS portal (137 pages) |
| Nginx | :443 | HTTPS reverse proxy |
| PostgreSQL | :5432 | Main database |
| Qdrant | :6333 | Vector search |
| Redis | :6379 | Cache |
| Ollama | :11434 | Local LLM inference |
| OpenWebUI | :3400 | Direct Ollama chat |

## AI Models
| Model | Size | Use |
|-------|------|-----|
| qwen2.5-coder:7b | 4.7GB | Code + analysis (primary) |
| llama3.2:3b | 2.0GB | Fast tasks |
| nomic-embed-text | 274MB | Embeddings |
| deepseek-r1:8b | 5.2GB | Complex reasoning |

## Daily Operations
```bash
bash START-SAFE.sh      # start all services
bash HEALTH-MONITOR.sh  # live dashboard
bash STOP-ALL.sh        # stop cleanly
```

*Updated: 2026-07-20*
