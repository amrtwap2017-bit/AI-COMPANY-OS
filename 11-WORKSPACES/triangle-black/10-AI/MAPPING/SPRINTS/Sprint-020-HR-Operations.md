# Sprint 020 — HR Operations — Leave, Timesheets, Attendance

## Goal
Build HR operations with leave management, timesheet tracking, attendance monitoring, and absence reporting to manage workforce productivity.

## Capabilities
- HR-006 — Leave Management — from HR
- HR-007 — Timesheet Management — from HR
- HR-008 — Attendance Tracking — from HR
- HR-009 — Absence Reporting — from HR
- HR-010 — Leave Policy — from HR

## Context Pack Required
**Pack ID:** CP-HR-Timesheets
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/09-HR/Leave-Management.md` — Leave Management
- `../02-DOMAIN-DOCS/09-HR/Timesheet-Management.md` — Timesheet Management
- `../02-DOMAIN-DOCS/09-HR/Attendance-Tracking.md` — Attendance Tracking
- `../02-DOMAIN-DOCS/09-HR/Leave-Policies.md` — Leave Policies

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Data-Modeling.md` — Data Modeling

## Entities to Build
- LeaveRequest — HR
- LeaveType — HR
- LeaveBalance — HR
- LeavePolicy — HR
- Timesheet — HR
- TimesheetEntry — HR
- TimesheetApproval — HR
- AttendanceRecord — HR
- AttendanceLog — HR
- AbsenceReport — HR

## APIs to Build
- `/api/hr/leave/requests` — GET/POST — Leave requests
- `/api/hr/leave/requests/{id}` — GET/PUT — Request detail
- `/api/hr/leave/requests/{id}/submit` — POST — Submit for approval
- `/api/hr/leave/requests/{id}/approve` — POST — Approve/reject
- `/api/hr/leave/requests/{id}/cancel` — POST — Cancel leave
- `/api/hr/leave/types` — GET/POST — Leave type configuration
- `/api/hr/leave/balances` — GET — Employee leave balances
- `/api/hr/leave/balances/{id}` — GET/PUT — Balance adjustment
- `/api/hr/leave/policies` — GET/POST — Leave policy rules
- `/api/hr/timesheets` — GET/POST — Timesheets
- `/api/hr/timesheets/{id}` — GET/PUT — Timesheet detail
- `/api/hr/timesheets/{id}/entries` — GET/POST/PUT — Time entries
- `/api/hr/timesheets/{id}/submit` — POST — Submit timesheet
- `/api/hr/timesheets/{id}/approve` — POST — Approve/reject
- `/api/hr/timesheets/current` — GET — Current period timesheet
- `/api/hr/attendance` — GET/POST — Attendance records
- `/api/hr/attendance/clock-in` — POST — Clock in
- `/api/hr/attendance/clock-out` — POST — Clock out
- `/api/hr/attendance/today` — GET — Today's attendance
- `/api/hr/reports/absence` — GET — Absence report
- `/api/hr/reports/leave-utilization` — GET — Leave utilization

## Screens to Build
- `/hr/leave` — Leave request list
- `/hr/leave/new` — Create leave request
- `/hr/leave/{id}` — Leave request detail
- `/hr/leave/types` — Leave type configuration (admin)
- `/hr/leave/balances` — Leave balances view
- `/hr/leave/policies` — Leave policy rules (admin)
- `/hr/timesheets` — Timesheet list
- `/hr/timesheets/new` — Create timesheet
- `/hr/timesheets/{id}` — Timesheet with time entries
- `/hr/timesheets/{id}/approvals` — Approval view (manager)
- `/hr/timesheets/current` — Current week timesheet
- `/hr/attendance` — Attendance dashboard
- `/hr/attendance/clock` — Clock in/out interface
- `/hr/reports/absence` — Absence analysis
- `/hr/reports/leave-utilization` — Leave utilization report

## AI Agents Assigned
- Backend Lead AI — Leave, timesheet, attendance APIs
- Frontend Lead AI — Leave, timesheet, attendance screens
- Database Architect AI — HR operations schema
- Business Analyst AI — Leave policy rule engine

## Dependencies
- Sprint 019 — HR Basics (employee records, departments)

## Quality Gates
- Leave requests enforce policy rules (balance, accrual, approval chain)
- Timesheet hours validate against project assignments
- Attendance clock-in/out prevents duplicate open sessions
- Leave balance calculations are accurate and auditable
- Timesheet approvals cascade to payroll data

## Estimated Deliverables
- 3 backend modules (leave, timesheet, attendance)
- 15 frontend pages
- 65 unit tests
- 8 integration tests
- 4 documents
