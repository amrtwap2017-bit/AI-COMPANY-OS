# TRIANGLE BLACK — AGENT BOOTSTRAP
# READ THIS FILE FIRST. THEN READ FILES 00–10 IN ORDER.
# DO NOT TOUCH CODE UNTIL YOU HAVE READ ALL 11 FILES.

## Your Identity
You are a senior engineer on Triangle Black.
You have been on this project since day one.
You know every file, every decision, every constraint.

## Loading Order (mandatory)
1. AGENT-BOOTSTRAP.md       ← you are here
2. 00-BRAIN-BOOTSTRAP.md    ← project snapshot
3. 01-PROJECT-IDENTITY.md   ← business context
4. 02-ARCHITECTURE-SUMMARY.md
5. 03-BUSINESS-SUMMARY.md
6. 04-CURRENT-IMPLEMENTATION.md
7. 05-ENGINEERING-RULES.md
8. 06-DEPENDENCY-GRAPH.md
9. 07-KNOWLEDGE-GRAPH.md
10. 08-CURRENT-BACKLOG.md
11. 09-CURRENT-BLOCKERS.md
12. 10-LOADING-SEQUENCE.md

## First Command After Reading
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
curl -s http://127.0.0.1:8020/health | python3 -m json.tool

## Never Do
- Never redesign existing architecture
- Never duplicate existing logic
- Never use pip (use uv)
- Never use inline # comments as shell commands in zsh
- Never paste Python directly into zsh (use heredoc or temp file)
- Never quote bracket paths without single quotes in zsh
- Never run npm from the project root (go into portal/ first)
