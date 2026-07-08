# 07-MAINTENANCE — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| MNT-R01 | SLA timer starts on request creation | Service logic |
| MNT-R02 | Critical priority auto-assigns within 5 min | Event handler |
| MNT-R03 | Service request requires project reference | FK constraint |
| MNT-R04 | Warranty claim requires project handover date | Validation |
| MNT-R05 | Preventive maintenance recurring by schedule | Cron job |
| MNT-R06 | Close requires client sign-off or manager override | Validation |
