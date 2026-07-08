# 11-INTEGRATIONS — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| INT-R01 | E-Invoice submission retries 3x before failure | Service logic |
| INT-R02 | Webhook delivery retries 3x before disabling | Service logic |
| INT-R03 | External API keys stored encrypted | Secrets management |
| INT-R04 | Rate limit: max 10 webhooks/second | Rate limiter |
| INT-R05 | Import max 10,000 rows per file | Validation |
