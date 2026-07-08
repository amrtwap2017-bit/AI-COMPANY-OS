# 13-HUMAN-RESOURCES — Notifications

## Notification Triggers

| Event | Recipient | Channel | Template |
|-------|-----------|---------|----------|
| Employee created | New employee | Email | "Welcome to Triangle Black! Your account is ready" |
| Employee created | HR Admin | In-app | "New employee {name} ({code}) has been onboarded" |
| Employee terminated | Manager | In-app | "{name} has been terminated effective {date}" |
| Leave submitted | Manager | In-app, Email | "{name} requests {type} leave: {start} to {end}" |
| Leave approved | Employee | In-app, Email | "Your {type} leave ({start}-{end}) has been approved" |
| Leave rejected | Employee | In-app | "Your {type} leave request was rejected: {reason}" |
| Leave balance low (≤ 3d) | Employee | In-app | "Annual leave balance low: {days} remaining" |
| Timesheet reminder (Thu) | Employee | In-app, Email | "Timesheet period closes tomorrow — please submit" |
| Timesheet overdue | Employee, Manager | In-app | "Timesheet for {period} overdue — please submit" |
| Timesheet submitted | Manager | In-app | "{name} submitted timesheet for {period} — {hours}h" |
| Timesheet approved | Employee | In-app | "Timesheet for {period} approved" |
| Timesheet rejected | Employee | In-app | "Timesheet for {period} rejected: {reason}" |
| Attendance anomaly | Employee | In-app | "Missing check-in for {date} — please update" |
| Attendance anomaly | HR | In-app | "Anomaly detected: {name} — {details}" |
| Payroll ready | Employee | In-app, Email | "Payslip for {month}/{year} is ready" |
