# 02-PROJECT-DELIVERY — Testing

## Unit Tests

| Module | Tests |
|--------|-------|
| Project creation | Auto-create from contract, status defaults, milestone generation |
| NCR lifecycle | Create→assign→resolve→verify→close state transitions |
| Milestone approval | Gateway conditions (NCRs closed, prev milestone approved) |
| Resource scheduling | Double-booking prevention, availability check |

## Integration Tests

| Test | Scenario |
|------|----------|
| Contract→Project | Verify project created on contract.activated |
| NCR→Milestone | Verify milestone blocked if critical NCR open |
| Handover→Closeout | Verify all NCRs closed before handover |

## E2E

| Scenario | Actions |
|----------|---------|
| PM creates project from contract | View milestones, assign team, verify |
| Site engineer completes daily report | Fill form, upload photos, submit |
| Quality inspector closes NCR | Create → assign → resolve → verify → close |
