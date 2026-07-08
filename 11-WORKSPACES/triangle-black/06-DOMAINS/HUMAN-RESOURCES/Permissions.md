# 13-HUMAN-RESOURCES — Permissions

| Permission | Action | Resource | Roles |
|------------|--------|----------|-------|
| employee:create | Create | Employee | HR_ADMIN, HR_MANAGER |
| employee:read | View | Employee | EMPLOYEE*, MANAGER†, HR_ADMIN, HR_MANAGER *Own only †Team only |
| employee:update | Update | Employee | EMPLOYEE*, HR_ADMIN, HR_MANAGER *Limited fields |
| employee:delete | Delete | Employee | HR_MANAGER |
| employee:terminate | Terminate | Employee | HR_MANAGER |
| department:create | Create | Department | HR_ADMIN, HR_MANAGER |
| department:read | View | Department | EMPLOYEE, MANAGER, HR_ADMIN, HR_MANAGER |
| department:update | Update | Department | HR_ADMIN, HR_MANAGER |
| department:delete | Delete | Department | HR_MANAGER |
| leave:create | Create | LeaveRequest | EMPLOYEE, MANAGER |
| leave:read | View | LeaveRequest | EMPLOYEE*, MANAGER†, HR_ADMIN, HR_MANAGER |
| leave:approve | Approve | LeaveRequest | MANAGER, HR_ADMIN, HR_MANAGER |
| timesheet:create | Create | Timesheet | EMPLOYEE |
| timesheet:read | View | Timesheet | EMPLOYEE*, MANAGER†, HR_ADMIN, HR_MANAGER, FINANCE_HR |
| timesheet:approve | Approve | Timesheet | MANAGER, HR_ADMIN |
| timesheet:export | Export | Timesheet | FINANCE_HR, HR_ADMIN, HR_MANAGER |
| attendance:read | View | Attendance | EMPLOYEE*, MANAGER†, HR_ADMIN |
| payroll:read | View | Payroll | EMPLOYEE*, HR_ADMIN, HR_MANAGER, FINANCE_HR |
| payroll:export | Export | Payroll | HR_MANAGER, FINANCE_HR |
