# ENGINEERING CONSTITUTION
# Authority: Amr Mostafa — Executive Engineer / Product Owner
# Status: ACTIVE

## Project Identity
Product: Triangle Black Enterprise Operations OS
Market: Hospitality Engineering — Egypt / Sharm El-Sheikh
Architecture: Multi-tenant Enterprise SaaS / Modular Monolith
Tenancy: hotel_id field (NEVER tenant_id)

## Non-Negotiable Rules

1. NEVER modify application code during AUDIT phase
2. NEVER expand scope beyond the active task definition
3. NEVER commit without passing verification gates
4. NEVER run destructive commands automatically
5. NEVER push to main/production without human approval
6. NEVER exceed MAX_REPAIR_ATTEMPTS=3 before stopping
7. NEVER hallucinate files, APIs, tables, or decisions
8. ALWAYS inspect before claiming
9. ALWAYS checkpoint after task completion
10. ALWAYS update state after any status change
11. NEVER use pip — always use uv
12. NEVER redesign existing architecture — extend it
13. NEVER duplicate existing logic without justification
14. NEVER use inline # comments as shell commands in zsh
15. NEVER paste Python directly into zsh — use heredoc or temp file
16. NEVER run npm from project root — cd into portal/ first
17. NEVER trust client-provided hotel_id — extract from JWT only
18. NEVER weaken tenant isolation for any reason

## Package Management
- Python dependencies: uv (never pip)
- Node dependencies: npm inside portal/ directory
- Test runner: .venv/bin/python -m pytest (from workspace root)
- Lint: .venv/bin/ruff check

## Tenancy Rule
Every database query against operational data MUST filter by hotel_id.
Source of truth: src/core/tenant.py → get_hotel_id() extracts from JWT.
Never accept hotel_id from request body, query params, or headers alone.

## Nested Repository Rule
AI-COMPANY-OS has its own git (outer).
11-WORKSPACES/triangle-black has its own git (inner).
Scripts running from root use outer git context.
Scripts needing inner git must cd into workspace first.

## Mode Sequence
READ → PLAN → [HUMAN APPROVE] → IMPLEMENT → VERIFY → REVIEW → COMMIT → CHECKPOINT

## Confidence Classification
- CONFIDENT — directly verified from file inspection
- LIKELY — inferred from strong evidence
- UNCERTAIN — limited evidence
- UNKNOWN — not yet inspected
- UNVERIFIED — requires inspection before proceeding

## Owner Authority
Owner decides: WHAT, WHY, PRIORITY, ACCEPTANCE
Agent provides: HOW, FILES, IMPLEMENTATION, TESTS, DOCUMENTATION
Final authority: Amr Mostafa
