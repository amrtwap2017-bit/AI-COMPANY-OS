# 09-EXECUTIVE-INTELLIGENCE — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BI-R01 | Dashboard data refreshed every 5 minutes | Materialized view refresh |
| BI-R02 | Pipeline forecast = sum(opportunity.value × probability) | Service logic |
| BI-R03 | Revenue = sum of paid invoices (cash basis) | Service logic |
| BI-R04 | Project margin = (revenue - costs) / revenue × 100 | Service logic |
| BI-R05 | Scheduled reports sent at configured frequency | Cron job |
| BI-R06 | Data exports limited to 10,000 rows | Query limit |
