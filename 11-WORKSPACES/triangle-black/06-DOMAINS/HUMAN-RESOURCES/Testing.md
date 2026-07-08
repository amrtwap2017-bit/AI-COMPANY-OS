# 13-HUMAN-RESOURCES — Testing

## Unit Tests

| Module | File | Tests |
|--------|------|-------|
| Employee lifecycle | employee.service.spec.ts | Create, update, terminate state transitions; validation rules |
| Leave management | leave.service.spec.ts | Balance calculation, approval workflow, date validation |
| Timesheet management | timesheet.service.spec.ts | Hour validation, status transitions, cost calculation |
| Attendance tracking | attendance.service.spec.ts | Check-in/out validation, anomaly detection |
| Cost allocation | cost-allocation.service.spec.ts | Labor cost calculation per project |

## Integration Tests

| Test | Endpoints | Scenario |
|------|-----------|----------|
| Employee onboarding | POST employees → verify department count → GET employee | Full creation flow |
| Leave lifecycle | POST leave → approve → verify balance deducted | Full workflow |
| Timesheet workflow | POST timesheet → submit → approve → verify project cost updated | Full workflow |
| Attendance check-in/out | POST check-in → POST check-out → verify hours calculated | Daily flow |
| Permission enforcement | All endpoints by role | 403 for unauthorized |

## E2E Tests

| Scenario | Actions |
|----------|---------|
| Employee creates leave request | Login → submit leave → verify balance updated |
| Manager approves timesheet | Login → view pending → approve → verify status |
| Employee checks in/out | Mobile check-in → perform work → check-out → verify hours |
| HR creates new employee | Fill form → upload docs → verify employee created |
