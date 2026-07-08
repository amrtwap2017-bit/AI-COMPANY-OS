# 04-SUPPLIER-MANAGEMENT — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| SUP-R01 | Supplier code: SPL-{YYYY}-{XXXXX} | Auto-generate |
| SUP-R02 | Duplicate by tax ID not allowed | Unique constraint |
| SUP-R03 | Supplier must be 'active' to receive POs | Status check in PO creation |
| SUP-R04 | Blacklisted supplier cannot be selected | Blocked in PO module |
| SUP-R05 | Rate card has effective dates | Date range validation |
| SUP-R06 | Evaluation score 0-100 | Check constraint |
| SUP-R07 | Evaluation requires at least 1 PO in period | Validation |
