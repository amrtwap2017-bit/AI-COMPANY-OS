# 00-SHARED-KERNEL — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| SK-R01 | All entities must have tenant_id | BaseEntity requires it |
| SK-R02 | tenant_id cannot change after creation | Immutable field |
| SK-R03 | Soft deleted records excluded from queries | Global query filter |
| SK-R04 | Audit fields populated automatically | Prisma middleware |
| SK-R05 | EGP is default currency | Master data seed |
| SK-R06 | VAT 14% applied by default (Egypt) | Master data seed |
| SK-R07 | Events must have id, type, timestamp, payload | Type enforcement |
| SK-R08 | Notification templates versioned | Template registry |
