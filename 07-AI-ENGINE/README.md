# 07-AI-ENGINE

AI Company OS — AI Engine Layer

## What This Is
The recovered AI brain from Generation 1 (legacy) and Generation 2 (archive).
Runs independently on port 8001.
Business API (triangle-black) runs on port 8000.

## Modules
| Module | Source | Status |
|--------|--------|--------|
| agents | Legacy Gen 1 | Installed |
| tools (30+) | Legacy Gen 1 | Installed |
| dag | Legacy Gen 1 | Installed |
| decision | Legacy Gen 1 | Installed |
| evaluation | Legacy Gen 1 | Installed |
| reflection | Legacy Gen 1 | Installed |
| learning | Legacy Gen 1 | Installed |
| collaboration | Legacy Gen 1 | Installed |
| workflows | Legacy Gen 1 | Installed |
| templates | Legacy Gen 1 | Installed |
| integrations | Legacy Gen 1 | Installed |
| analytics | Legacy Gen 1 | Installed |
| orchestrator | Legacy Gen 1 | Installed |
| context | Legacy Gen 1 | Installed |
| memory | Legacy Gen 1 | Installed |
| knowledge | Legacy Gen 1 | Installed |
| prompts | Legacy Gen 1 | Installed |
| mcp | Archive Gen 2 | Installed |
| builder | Archive Gen 2 | Installed |
| planning | Archive Gen 2 | Installed |
| benchmarks | Archive Gen 2 | Installed |
| observability | Archive Gen 2 | Installed |
| model_router | Archive Gen 2 | Installed |

## API Prefix
All routes: /api/v1/ai/

## Start
cd 07-AI-ENGINE && ./start.sh

## Next Steps
- Resolve import paths (modules reference app.* — update to direct imports)
- Connect to shared Qdrant vector store
- Connect Enterprise portal /ai and /recommendations pages to this engine
- Restore hub dashboard pages
