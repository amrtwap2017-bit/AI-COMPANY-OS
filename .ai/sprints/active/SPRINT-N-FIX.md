# SPRINT-N-FIX — N-FIX: Pre-pilot blockers

## Metadata
| Field | Value |
|-------|-------|
| ID | SPRINT-N-FIX |
| Status | PLANNED |
| Started | |
| Target End | |
| Phase | COMMERCIAL_VALIDATION |
| Created | 2026-08-25 |

## Objective
[One sentence: what does this sprint accomplish?]

## Business Outcome
[What does the user/product gain?]

## Technical Outcome
[What does the codebase gain?]

## Dependencies
- [ ] Previous sprint gates passed
- [ ] Architecture review complete

## Preconditions
- [ ] Working tree clean
- [ ] Tests passing at sprint start
- [ ] Security check passed at sprint start
- [ ] `bash scripts/ai/ai-security-check` passes

## Scope
[List what IS included]

## Out of Scope
[List what is NOT included — be explicit]

## Tasks
| ID | Title | Status | Risk | Files |
|----|-------|--------|------|-------|
| SPRINT-N-FIX-T001 | | READY | LOW | |
| SPRINT-N-FIX-T002 | | READY | MEDIUM | |

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
- [ ] `bash scripts/ai/ai-checkpoint SPRINT-N-FIX-CLOSE COMPLETE` run
- [ ] Git state clean
- [ ] Sprint report generated
