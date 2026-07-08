# 02-PROJECT-DELIVERY — Permissions

| Permission | Action | Resource | Roles |
|------------|--------|----------|-------|
| project:create | Create | Project | PROJECT_MANAGER |
| project:read | View | Project | All project roles, CLIENT_REP |
| project:update | Update | Project | PROJECT_MANAGER |
| project:delete | Delete | Project | PROJECT_MANAGER (draft only) |
| milestone:approve | Approve | Milestone | PROJECT_MANAGER, CLIENT_REP |
| report:create | Create | Daily Report | SITE_ENGINEER, SITE_SUPERVISOR |
| ncr:create | Create | NCR | SITE_ENGINEER, QUALITY_INSPECTOR |
| ncr:approve | Close | NCR | QUALITY_INSPECTOR, PROJECT_MANAGER |
| timesheet:approve | Approve | Timesheet | SITE_SUPERVISOR, PROJECT_MANAGER |
| risk:manage | CRUD | Risk | SAFETY_OFFICER, PROJECT_MANAGER |
| handover:approve | Approve | Handover | PROJECT_MANAGER, CLIENT_REP |
