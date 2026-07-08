# 13-HUMAN-RESOURCES — Screens

## Employee Module

| Screen | Route | Description |
|--------|-------|-------------|
| Employee List | /hr/employees | Searchable, filterable table with status badge, department filter |
| Employee Detail | /hr/employees/:id | Full profile + documents + leave history + timesheet history |
| Employee Create | /hr/employees/new | Form: personal info, job details, department, salary, documents |
| Employee Edit | /hr/employees/:id/edit | Edit employee fields |
| Org Chart | /hr/org-chart | Visual department hierarchy with employee cards |

## Department Module

| Screen | Route | Description |
|--------|-------|-------------|
| Department List | /hr/departments | Tree view of departments with headcount |
| Department Detail | /hr/departments/:id | Department info + budget + employee list |
| Department Create | /hr/departments/new | Form with parent selection |

## Leave Module

| Screen | Route | Description |
|--------|-------|-------------|
| Leave Requests | /hr/leave | Calendar and list views of leave requests |
| Leave Submit | /hr/leave/new | Form: type, dates, reason, balance display |
| Leave Approve | /hr/leave/approve | Queue of pending approvals |
| Leave Balance | /hr/leave/balance | Employee leave balance overview |
| Team Calendar | /hr/leave/calendar | Team leave view with filters |

## Timesheet Module

| Screen | Route | Description |
|--------|-------|-------------|
| Timesheet Entry | /hr/timesheet | Weekly timesheet grid: projects × days |
| Timesheet Approve | /hr/timesheet/approve | Pending timesheets queue |
| Timesheet Report | /hr/timesheet/reports | Hours by employee, project, period |

## Attendance Module

| Screen | Route | Description |
|--------|-------|-------------|
| Today's Attendance | /hr/attendance | Live view of today's check-in/out status |
| Attendance Report | /hr/attendance/reports | Daily, weekly, monthly summaries |
| Anomaly Flag | /hr/attendance/anomalies | Flagged attendance issues |

## Payroll Module

| Screen | Route | Description |
|--------|-------|-------------|
| Payroll List | /hr/payroll | Payroll periods, processing status |
| Payroll Detail | /hr/payroll/:id | Period summary, employee breakdown |
| Payslip View | /hr/payroll/payslips/:id | Employee payslip (self-service) |
