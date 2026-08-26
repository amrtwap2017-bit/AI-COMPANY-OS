# AGENT INSTRUCTION FILES AUDIT
## Generated: Wed Aug 26 15:40:59 UTC 2026

## AGENTS.md
# AGENTS.md — LOCAL AI ENGINEERING PROTOCOL

## Model
Local: Qwen Coder (via Ollama / OpenCode)

## Operating Rules

You are the Local AI Engineering Agent.

Before every session:
1. Read .ai/constitution/engineering-rules.md
2. Read .ai/state/project-state.json
3. Read .ai/reports/checkpoints/LATEST.md
4. Run: bash scripts/ai/ai-status

Before every task:
1. Load .ai/tasks/active/TASK-XXX.md
2. Inspect relevant source files (READ MODE only)
3. Confirm understanding before implementing

During implementation:
1. Modify only approved scope
2. Never touch forbidden files
3. Stop at MAX_REPAIR_ATTEMPTS=3

After every task:
1. Run: bash scripts/ai/ai-verify
2. Run: bash scripts/ai/ai-security-check
3. Run: bash scripts/ai/ai-checkpoint TASK-XXX COMPLETE
4. Update .ai/state/project-state.json
5. Run: bash scripts/ai/ai-handoff

## Confidence Language

Use exactly:
- CONFIDENT — directly verified
- LIKELY — inferred from evidence
- UNCERTAIN — limited evidence
- UNKNOWN — not inspected
- UNVERIFIED — requires inspection

## Forbidden Actions

- Inventing files, APIs, tables, tests, or decisions
- Committing without passing verification gates
- Expanding scope beyond the active task
- Running destructive commands automatically
- Pushing to main without human approval
- Continuing after MAX_REPAIR_ATTEMPTS=3

## Mode Sequence

READ → PLAN → IMPLEMENT → VERIFY → REVIEW → COMMIT → CHECKPOINT

## CLAUDE.md
NOT FOUND

## .cursorrules
NOT FOUND

## .github/copilot-instructions.md
NOT FOUND

## .aider.conf.yml
NOT FOUND

## System Prompt Files (any *.md in root)
./AGENTS.md
./ARCHITECTURE.md
./S11-SESSION-BRIEF.md
./S14-SESSION-BRIEF.md
./HANDOFF.md
./reports/d5_gap_report.md
./reports/p1_priority_plan.md
./reports/triangle-black-portal-review-20260719.md
./reports/d3_page_audit.md
./reports/project-review-2026-07-19.md
./reports/ai-portal-review-20260720.md
./reports/d2_api_audit.md
./reports/d1_entity_scan.md
./reports/standards-audit-2026-07-20.md
./reports/api-integration-plan-2026-07-20.md
./reports/triangle-black-review-2026-07-19.md
./reports/program_b_safe_plan.md
./reports/portal-review-task15-2026-07-19.md
./S10-SESSION-BRIEF.md
./S13-SESSION-BRIEF.md
./SYSTEM-STATE.md
./.ai/README.md
./.pytest_cache/README.md
./SAFE_AI_RULES.md
./HANDOFF_FINAL.md
./S12-SESSION-BRIEF.md
./07-AI-ENGINE/README.md

## .ai directory (if exists)
.rw-r--r--  285 amr 25 Aug 09:42 .gitignore
drwxr-xr-x    - amr 25 Aug 09:19 constitution
drwxr-xr-x    - amr 25 Aug 14:25 context
drwxr-xr-x    - amr 25 Aug 09:44 intelligence
drwxr-xr-x    - amr 25 Aug 09:44 knowledge
drwxr-xr-x    - amr 25 Aug 09:18 memory
.rw-r--r-- 1.2k amr 25 Aug 09:18 README.md
drwxr-xr-x    - amr 25 Aug 09:18 reports
drwxr-xr-x    - amr 25 Aug 09:18 roadmap
drwxr-xr-x    - amr 25 Aug 14:05 sessions
drwxr-xr-x    - amr 25 Aug 09:29 sprints
drwxr-xr-x    - amr 25 Aug 09:18 state
drwxr-xr-x    - amr 25 Aug 09:29 tasks
drwxr-xr-x    - amr 25 Aug 09:18 verification
