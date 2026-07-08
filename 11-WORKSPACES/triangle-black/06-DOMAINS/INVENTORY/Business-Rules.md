# 05-INVENTORY — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| INV-R01 | Stock cannot go negative | Check before issue |
| INV-R02 | Stock issue requires project | FK constraint |
| INV-R03 | Transfer out requires matching transfer in | Dual record creation |
| INV-R04 | Adjustment requires reason and approver | Validation |
| INV-R05 | Physical count can override system with approval | Approval workflow |
| INV-R06 | Reorder point: stock < min_level → notification | Cron check |
| INV-R07 | Valuation method: weighted average | Service logic |
