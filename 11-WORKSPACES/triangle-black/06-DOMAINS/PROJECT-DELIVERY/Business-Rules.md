# 02-PROJECT-DELIVERY — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| PRJ-R01 | Project requires active contract | FK + status check |
| PRJ-R02 | Milestone dates: end ≥ start | Validation |
| PRJ-R03 | Milestone must be approved before next starts | State machine |
| PRJ-R04 | Project budget cannot exceed contract value | Validation |
| RES-R01 | Resource cannot be double-booked | Schedule overlap check |
| QLT-R01 | NCR must be resolved before milestone approval | Gateway condition |
| QLT-R02 | Critical NCR auto-notifies management | Event handler |
| SIT-R01 | Daily report required for every active day | Cron enforcement |
| HND-R01 | All NCRs must be closed before handover | Gateway condition |
| HND-R02 | Handover requires signed-off snag list | Validation |
| TIM-R01 | Timesheet must be within project dates | Validation |
| TIM-R02 | Overtime requires prior approval | Workflow condition |
