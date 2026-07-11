# TRIANGLE BLACK — AI AGENT CONTEXT

## MANDATORY FIRST READ
Before doing anything, read these files in order:
1. /home/amr/AI-COMPANY-OS/brains/triangle-black/AGENT-BOOTSTRAP.md
2. /home/amr/AI-COMPANY-OS/brains/triangle-black/00-BRAIN-BOOTSTRAP.md
3. /home/amr/AI-COMPANY-OS/brains/triangle-black/01-PROJECT-IDENTITY.md
4. /home/amr/AI-COMPANY-OS/brains/triangle-black/02-ARCHITECTURE-SUMMARY.md
5. /home/amr/AI-COMPANY-OS/brains/triangle-black/03-BUSINESS-SUMMARY.md
6. /home/amr/AI-COMPANY-OS/brains/triangle-black/04-CURRENT-IMPLEMENTATION.md
7. /home/amr/AI-COMPANY-OS/brains/triangle-black/05-ENGINEERING-RULES.md
8. /home/amr/AI-COMPANY-OS/brains/triangle-black/06-DEPENDENCY-GRAPH.md
9. /home/amr/AI-COMPANY-OS/brains/triangle-black/07-KNOWLEDGE-GRAPH.md
10. /home/amr/AI-COMPANY-OS/brains/triangle-black/08-CURRENT-BACKLOG.md
11. /home/amr/AI-COMPANY-OS/brains/triangle-black/09-CURRENT-BLOCKERS.md
12. /home/amr/AI-COMPANY-OS/brains/triangle-black/10-LOADING-SEQUENCE.md

## Project Location
/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/

## Health Check (run this first every session)
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
export TRIANGLE_BLACK_DB_URL="postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
export PYTHONPATH="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
curl -s http://127.0.0.1:8020/health | python3 -m json.tool

## Current Version: v4.3.0
## Tests: 111 passing
## Stack: FastAPI + PostgreSQL + Next.js + Tailwind + React Query

## NEVER
- Never use pip (use uv)
- Never redesign existing architecture
- Never inject JSX into JS arrays
- Never paste Python directly into zsh
- Never use inline # comments in zsh
- Always single-quote bracket paths in zsh
