# 13-HUMAN-RESOURCES — API Endpoints

## Departments
```
POST   /api/v1/hr/departments                     — Create department
GET    /api/v1/hr/departments                     — List (tree structure)
GET    /api/v1/hr/departments/:id                 — Get with employees
PATCH  /api/v1/hr/departments/:id                 — Update
DELETE /api/v1/hr/departments/:id                 — Soft delete
GET    /api/v1/hr/departments/tree                — Org chart tree
```

## Employees
```
POST   /api/v1/hr/employees                       — Create employee
GET    /api/v1/hr/employees                       — List (paginated, filterable)
GET    /api/v1/hr/employees/:id                   — Get with relations
PATCH  /api/v1/hr/employees/:id                   — Update
DELETE /api/v1/hr/employees/:id                   — Soft delete
POST   /api/v1/hr/employees/:id/terminate         — Terminate employment
GET    /api/v1/hr/employees/:id/timesheets        — Employee timesheet history
GET    /api/v1/hr/employees/:id/leave-history     — Employee leave history
```

## Leave
```
POST   /api/v1/hr/leave                           — Submit leave request
GET    /api/v1/hr/leave                           — List (filterable by status, employee)
GET    /api/v1/hr/leave/:id                       — Get leave details
PATCH  /api/v1/hr/leave/:id                       — Update (pending only)
DELETE /api/v1/hr/leave/:id                       — Cancel (pending only)
POST   /api/v1/hr/leave/:id/approve               — Approve leave
POST   /api/v1/hr/leave/:id/reject                — Reject leave
GET    /api/v1/hr/leave/calendar                  — Team leave calendar
GET    /api/v1/hr/leave/balance                   — Current user leave balance
GET    /api/v1/hr/leave/balance/:employeeId       — Employee leave balance (HR)
```

## Timesheets
```
POST   /api/v1/hr/timesheets                      — Create/submit timesheet
GET    /api/v1/hr/timesheets                      — List (filterable)
GET    /api/v1/hr/timesheets/:id                  — Get with details
PATCH  /api/v1/hr/timesheets/:id                  — Update (draft only)
DELETE /api/v1/hr/timesheets/:id                  — Delete (draft only)
POST   /api/v1/hr/timesheets/:id/submit           — Submit for approval
POST   /api/v1/hr/timesheets/:id/approve          — Approve timesheet
POST   /api/v1/hr/timesheets/:id/reject           — Reject timesheet
GET    /api/v1/hr/timesheets/report               — Timesheet report (hours by project/employee)
```

## Attendance
```
POST   /api/v1/hr/attendance/check-in             — Check in
POST   /api/v1/hr/attendance/check-out            — Check out
GET    /api/v1/hr/attendance                      — List (filterable)
GET    /api/v1/hr/attendance/today                — Today's attendance status
GET    /api/v1/hr/attendance/report               — Attendance report
GET    /api/v1/hr/attendance/anomalies            — Flagged anomalies
PATCH  /api/v1/hr/attendance/:id                  — Correct attendance record (HR)
```

## Payroll (V2)
```
POST   /api/v1/hr/payroll/periods                 — Create payroll period
GET    /api/v1/hr/payroll/periods                 — List periods
POST   /api/v1/hr/payroll/periods/:id/compute     — Compute payroll
GET    /api/v1/hr/payroll/periods/:id             — Period summary
POST   /api/v1/hr/payroll/periods/:id/approve     — Approve payroll
GET    /api/v1/hr/payslips/:id                    — Get payslip
GET    /api/v1/hr/payslips/my                     — Current user payslips
```
