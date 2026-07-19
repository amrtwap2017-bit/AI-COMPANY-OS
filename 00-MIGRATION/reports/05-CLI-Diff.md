# 05 — CLI Diff

## Legacy CLI
Location: /home/amr/AI/projects/ai-company-os/apps/api/scripts/
Type: Script-based testing CLI (not a proper hub CLI)
Available scripts:
- test_agents.py — agent testing
- test_analytics.py — analytics testing
- test_chat.py — chat testing
- test_collaboration.py — collaboration testing
- test_dag.py — DAG testing
- test_decision.py — decision testing
- test_documents.py — document testing
- test_evaluator.py — evaluator testing
- test_learning.py — learning testing
- test_memory.py — memory testing
- test_models.py — model testing
- test_prompts.py — prompt testing
- test_qdrant.py — Qdrant testing
- test_rag.py — RAG testing
- test_reflection.py — reflection testing
- test_tools.py — tools testing
- test_workflow.py — workflow testing
- create_admin.py — admin creation
- init_db.py — DB initialization
- migrate_memories.py — memory migration

## Archive CLI
Location: /home/amr/AI-COMPANY-OS/90-ARCHIVE/AI-ENGINEERING-HUB-archived/
Type: hub CLI with start-hub.sh
Available: start-hub.sh → uvicorn hub.api.app:app

## Enterprise CLI
Location: /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/
Available scripts:
- start.sh
- start-api.sh
- start-production.sh
- start-ai-services.sh (src/)
- audit.sh
- tb-agent (binary/script)
- tb-manager.py

## Hub CLI (Palette)
Location: /home/amr/AI-COMPANY-OS/hub/cli/palette.py
Status: EXISTS but needs inventory

## CLI Gap Analysis
| Command | Legacy | Archive | Enterprise | Status |
|---------|--------|---------|------------|--------|
| hub serve | ❌ | ✅ start-hub.sh | ✅ start-api.sh | ARCHIVE → ENTERPRISE |
| hub dashboard | ❌ | ❌ | ❌ | MISSING ENTIRELY |
| hub agent | ✅ scripts | ❌ | ❌ | MIGRATE from Legacy |
| hub memory | ✅ scripts | ❌ | ❌ | MIGRATE from Legacy |
| hub knowledge | ✅ scripts | ❌ | ❌ | MIGRATE from Legacy |
| hub analytics | ✅ scripts | ❌ | ❌ | MIGRATE from Legacy |
| hub workflow | ✅ scripts | ❌ | ❌ | MIGRATE from Legacy |
| hub palette | ❌ | ❌ | ✅ palette.py | KEEP |
| hub audit | ❌ | ❌ | ✅ audit.sh | KEEP |
| hub db-init | ✅ init_db.py | ❌ | ❌ | MIGRATE from Legacy |
| hub migrate | ✅ | ✅ alembic | ✅ alembic | ALL HAVE — UNIFY |

## Recommendation
Build a unified `hub` CLI that wraps all operations.
