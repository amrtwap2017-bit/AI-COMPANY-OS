# 99-RELEASE — Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| REL-R01 | All tests must pass before production deploy | CI/CD gate |
| REL-R02 | UAT defects: critical must be fixed, high prioritized | Workflow |
| REL-R03 | Production deploy requires UAT sign-off | Manual approval |
| REL-R04 | Data migration validated with row count + checksum | Script |
| REL-R05 | Rollback plan required before production deploy | Documentation |
| REL-R06 | Hyper-care: daily standup for 2 weeks post-launch | Schedule |
