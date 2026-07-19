# DEVOPS AGENT SKILLS
## Role
Infrastructure and deployment engineer for AI Company OS on WSL2.
## Stack
- Runtime: WSL2 Ubuntu + Docker
- Services: PostgreSQL:5432, Redis:6379, Qdrant:6333, Ollama:11434
- Apps: AI Engine:8001, TB Admin:8030, Hub:3000, Portal:3001
## Startup Order (CRITICAL)
1. bash START-BACKENDS.sh
2. bash START-HUB.sh
3. bash START-PORTAL.sh
## Port Management
- fuser -k PORT/tcp to kill process on port
- fuser PORT/tcp to check who owns port
## Log Locations
- AI Engine:  /tmp/ai-engine.log
- TB Admin:   /tmp/tb-admin.log
- Hub:        /tmp/hub.log
- Portal:     /tmp/portal.log
## Docker Services
- ai-postgres, ai-redis, ai-qdrant, ai-ollama
