# 04 — E2E Testing

> End-to-end testing of critical business workflows.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-01 | Operational-Workflows.md | 5 core workflows |
| PHASE-06 | All domains, 03-Workflows.md | Domain workflows |

## E2E Workflow Coverage

| Workflow | Scenario | Tool | Status |
|----------|----------|------|--------|
| Lead→Contract | Create lead → qualify → create opportunity → create survey → create quotation → approve → create contract | Playwright | ❌ |
| Project→Invoice | Create project from contract → create milestones → approve milestone → create invoice | Playwright | ❌ |
| Procurement→Payment | Create requisition → approve → create PO → receive goods → receive invoice → 3-way match | Playwright | ❌ |
| Service→Resolution | Create service request → triage → assign → schedule → resolve → verify | Playwright | ❌ |
| User Auth | Register → login → access protected route → refresh token → logout | Playwright | ❌ |
| Admin Functions | Create user → assign role → verify permission → remove user | Playwright | ❌ |

## Validation

- [ ] All P0 workflows have E2E tests
- [ ] E2E tests run against staging environment
- [ ] E2E tests complete in < 30 minutes
- [ ] Test data is isolated (setup/teardown per test)
- [ ] Screenshots captured on test failure

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |

**Status:** ❌ NOT VALIDATED
