# 06-FINANCIAL-CONTROL — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| AR-R01 | Invoice requires approved milestone or contract | FK + status check |
| AR-R02 | Invoice total = line items + VAT (14%) | Auto-calc |
| AR-R03 | Credit note cannot exceed invoice total | Validation |
| AR-R04 | Overdue escalation: 7d → reminder; 30d → manager; 60d → legal | Cron workflow |
| AP-R01 | 3-way match must be complete before payment | Gateway condition |
| AP-R02 | Payment requires approved invoice | Status check |
| REV-R01 | Revenue recognized on payment received (cash basis V1) | Service logic |
| REV-R02 | Deferred revenue for advance payments | GL entry |
| GL-R01 | Every credit has matching debit | Double-entry enforcement |
| PA-R01 | Project cost tracked at transaction level | Cost allocation |
