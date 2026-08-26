# SPRINT-HUB-001 — Hub Enhancement — AI Engineering OS upgrade

## Metadata
| Field | Value |
|-------|-------|
| ID | SPRINT-HUB-001 |
| Status | PLANNED |
| Started | |
| Target End | |
| Phase | COMMERCIAL_VALIDATION |
| Created | 2026-08-26 |

## Objective
Upgrade the AI Engineering OS so one command gives full project intelligence and sprint proposals.

## Business Outcome
Amr can say 'what next?' and the system reads all state, proposes the highest-value sprint, and starts executing with zero context loss between sessions.

## Technical Outcome
Auto-server-start in verify, semantic document retrieval, session bootstrap command, sprint proposal engine, and upgraded OpenCode integration.

## Dependencies
- [ ] Previous sprint gates passed
- [ ] Architecture review complete

## Preconditions
- [ ] Working tree clean
- [ ] Tests passing at sprint start
- [ ] Security check passed at sprint start
- [ ] `bash scripts/ai/ai-security-check` passes

## Scope
- HUB-T001: ai-verify auto server detection
- HUB-T002: ai-status live test count  
- HUB-T003: ai-next-sprint proposal engine
- HUB-T004: semantic search via nomic-embed-text
- HUB-T005: ai-session-start bootstrap command
- HUB-T006: AGENTS.md OpenCode auto-context

## Out of Scope
- Triangle Black feature work (T004 and similar)
- N-014 Commercial Pilot execution
- Multi-agent parallelism
- Vector database infrastructure changes
- hub/ Python module rewrite

## Tasks
| ID | Title | Status | Risk | Files |
|----|-------|--------|------|-------|
| SPRINT-HUB-001-T001 | | READY | LOW | |
| SPRINT-HUB-001-T002 | | READY | MEDIUM | |

## Acceptance Criteria
- [ ] AC-001
- [ ] AC-002
- [ ] AC-003

## Test Plan
- [ ] Unit tests: all passing (158+ baseline maintained)
- [ ] Integration tests: all passing
- [ ] E2E: affected flows passing
- [ ] Regression: no regressions from baseline

## Security Checks
- [ ] `bash scripts/ai/ai-security-check` PASSES
- [ ] hotel_id tenant isolation preserved on all new queries
- [ ] No new secrets committed
- [ ] Authorization unchanged or reviewed

## Architecture Checks
- [ ] No domain leakage
- [ ] No raw SQL bypassing repository layer
- [ ] ADR created if architectural decision made
- [ ] No uv→pip regression

## Documentation Requirements
- [ ] .ai/context/project.md updated if needed
- [ ] brains/triangle-black/ updated if needed
- [ ] ADR created if needed

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| venv context error | LOW | HIGH | Always use absolute venv path |
| hotel_id missing from new query | MEDIUM | CRITICAL | Run tenant isolation check |
| Context overflow (32K) | MEDIUM | MEDIUM | Use ai-context script per task |

## Rollback Strategy
`git revert` individual task commits.

## Definition of Done
- [ ] All P0 tasks DONE
- [ ] All acceptance criteria satisfied
- [ ] 158+ tests still passing (no regression)
- [ ] `bash scripts/ai/ai-security-check` PASSES
- [ ] `bash scripts/ai/ai-verify` PASSES
- [ ] Architecture review done
- [ ] Documentation updated
- [ ] `bash scripts/ai/ai-checkpoint SPRINT-HUB-001-CLOSE COMPLETE` run
- [ ] Git state clean
- [ ] Sprint report generated
