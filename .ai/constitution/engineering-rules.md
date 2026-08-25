# ENGINEERING CONSTITUTION

Status: ACTIVE
Authority: HUMAN ARCHITECT

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

## Confidence Classification

- CONFIDENT — directly verified from file inspection
- LIKELY — inferred from strong evidence
- UNCERTAIN — limited evidence
- UNKNOWN — not yet inspected
- UNVERIFIED — requires inspection before proceeding

## Mode Sequence

READ → PLAN → [HUMAN APPROVE] → IMPLEMENT → VERIFY → REVIEW → COMMIT → CHECKPOINT
