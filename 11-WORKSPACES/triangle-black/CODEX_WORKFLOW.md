# CODEX_WORKFLOW.md — Triangle Black

Every AI coding session follows this pipeline. No step skipped.

## Pipeline
START → READ → PLAN → CODE → REVIEW → TEST → DOCS → COMMIT → HANDOFF

## Step 1: START — Read before touching anything
1. AI_MEMORY/PROJECT_MEMORY.md
2. AI_MEMORY/KNOWN_PROBLEMS.md
3. TASKS/CURRENT_SPRINT.md
4. AI-GOVERNANCE.md

## Step 2: READ — Understand the task
1. 06-DOMAINS/{DOMAIN}/APIs.md
2. 06-DOMAINS/{DOMAIN}/Database.md
3. Existing similar module in src/commercial/

## Step 3: PLAN — Write a plan first
Write to AI_MEMORY/DECISIONS.md:
- Files to create
- Domain events to publish
- Database changes needed
- Risks

## Step 4: ADR Check
New pattern, library, or architecture change?
YES → Create ADR in 00-ARCHITECT/DECISIONS/ BEFORE coding
NO  → Proceed to Step 5

## Step 5: CODE — Implementation order
1. schemas.py  (contracts first)
2. models.py   (data structure)
3. service.py  (business logic)
4. router.py   (API last)

Every router endpoint MUST have:
  tenant_id: str = Depends(get_current_tenant_id)

Every service function MUST have:
  .filter(Model.tenant_id == tenant_id)

## Step 6: REVIEW — Self check before saving
- tenant_id in every query?
- No logic in router.py?
- Type hints on all functions?
- No hardcoded values?

## Step 7: TEST
pytest tests/commercial/{module}/ -v
pytest tests/commercial/{module}/ --cov=src/commercial/{module}

Minimum 80% coverage required.
MANDATORY: test that tenant A cannot see tenant B data.

## Step 8: DOCS — Update after every change
New module      → 06-DOMAINS/{DOMAIN}/
New endpoint    → 04-DESIGN/API/
Schema changed  → alembic revision + 04-DESIGN/DATABASE/
Any change      → AGENT_HANDOFF.md

## Step 9: COMMIT
git add src/commercial/{module}/
git commit -m "feat(domain): description"

Never push to main directly.

## Step 10: HANDOFF
Update AGENT_HANDOFF.md:
- What was done
- What is next
- Blockers
