# 13-HUMAN-RESOURCES — Acceptance Criteria

## Sprint 1 — Employee & Department Foundation

- [ ] HR admin can create departments with parent hierarchy
- [ ] HR admin can create employee record with full profile
- [ ] Employee status progresses: pending → active → terminated
- [ ] National ID and email uniqueness enforced
- [ ] Org chart renders correctly from department hierarchy
- [ ] Employee list is searchable and filterable by department/status

## Sprint 2 — Leave Management

- [ ] Employee can submit leave request with type, dates, reason
- [ ] Leave balance shows correctly (total, used, remaining)
- [ ] Manager receives notification of pending leave request
- [ ] Manager can approve or reject with reason
- [ ] Leave balance updates on approval
- [ ] Team calendar shows approved leave
- [ ] Insufficient balance blocks submission with message

## Sprint 3 — Timesheets

- [ ] Employee can log hours per project per day for the week
- [ ] Weekly hour limit (48h) enforced
- [ ] Timesheet can be submitted for manager approval
- [ ] Manager can approve/reject with comments
- [ ] Approved timesheet is locked (no editing)
- [ ] Project cost is calculated from approved timesheet hours
- [ ] Timesheet report shows hours by employee, project, period

## Sprint 4 — Attendance

- [ ] Employee can check in with timestamp
- [ ] Employee can check out with timestamp
- [ ] Daily hours calculated automatically
- [ ] Late arrival, early departure, and missing check-in flagged
- [ ] HR can correct attendance records
- [ ] Attendance report renders correctly

## Sprint 5 — Polish & Integration

- [ ] All events captured in audit log
- [ ] All permissions enforced by RBAC
- [ ] Employee self-service works (profile, leave, timesheets)
- [ ] Timesheet data available for Financial Control cost allocation
- [ ] Payroll data export format defined
