# 13-HUMAN-RESOURCES — Events

## Domain Events

| Event | Trigger | Handler |
|-------|---------|---------|
| employee.created | POST /hr/employees | AuditService, NotificationService (welcome email) |
| employee.terminated | POST /hr/employees/:id/terminate | ProjectService (reassign projects), AccessService (revoke access), NotificationService |
| employee.department_changed | PATCH /hr/employees/:id | NotificationService (notify old/new manager) |
| leave.submitted | POST /hr/leave | NotificationService (notify manager for approval) |
| leave.approved | POST /hr/leave/:id/approve | NotificationService (notify employee), CalendarService (add to calendar) |
| leave.rejected | POST /hr/leave/:id/reject | NotificationService (notify employee) |
| leave.cancelled | PATCH /hr/leave/:id (status=cancelled) | NotificationService (notify manager), CalendarService (remove from calendar) |
| timesheet.submitted | POST /hr/timesheets/:id/submit | NotificationService (notify manager for approval) |
| timesheet.approved | POST /hr/timesheets/:id/approve | CostAllocationService (update project costs), NotificationService (notify employee) |
| timesheet.rejected | POST /hr/timesheets/:id/reject | NotificationService (notify employee) |
| attendance.anomaly_detected | Daily cron | NotificationService (notify employee + HR) |
| payroll.computed | POST /hr/payroll/periods/:id/compute | NotificationService (notify HR for review) |
| payroll.approved | POST /hr/payroll/periods/:id/approve | FinancialService (create journal entries), NotificationService (notify employees) |
