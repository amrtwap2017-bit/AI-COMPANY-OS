# 12 — Audit

> Internal and external audit framework.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Compliance.md | Compliance requirements |

## Audit Types

| Type | Scope | Frequency | Performer |
|------|-------|-----------|-----------|
| Financial audit | Financial records | Annual | External auditor |
| Security audit | Security controls | Annual | External pentest |
| Compliance audit | Regulatory compliance | Annual | Internal + external |
| Data audit | Data quality, privacy | Quarterly | Internal |
| Code audit | Code quality, security | Monthly | Internal (tooling) |
| Vendor audit | Third-party vendors | Per vendor | Internal |
| Operational audit | Processes, runbooks | Quarterly | Internal |

## Internal Audit Process

```
Plan ──► Execute ──► Report ──► Remediate ──► Verify
  │        │          │          │             │
Scope   Collect    Findings  Action items   Close
+ criteria evidence + rating + owners       follow-up
```

## Audit Trails

| System | Audit Data | Retention | Access |
|--------|-----------|-----------|--------|
| Database | pg_audit (all DML + DDL) | 1 year | Security + CTO |
| Application | API request logs | 90 days | Engineering |
| Infrastructure | Server access, commands | 1 year | DevOps |
| Authentication | Login attempts, changes | 1 year | Security |
| Financial | Invoices, payments, changes | 7 years | Finance |
| HR | Employee records, changes | Employment + 5 years | HR |

## Audit Schedule (H1)

| Month | Audit | Owner | Status |
|-------|-------|-------|--------|
| Q1 | Infrastructure security review | CTO | Planning |
| Q1 | Code quality baseline | Engineering | Planning |
| Q2 | Data privacy review | COO | Planning |
| Q2 | Financial controls review | CEO | Planning |
| Q3 | Penetration test | External | Planning |
| Q3 | Vendor security review | CTO | Planning |
| Q4 | Full compliance audit | Internal | Planning |

## Audit Metrics

| Metric | Target |
|--------|--------|
| Audits completed on schedule | 100% |
| Critical findings | 0 |
| High findings | < 3 |
| Remediation time (critical) | < 7 days |
| Remediation time (high) | < 30 days |
| Audit cost (% of revenue) | < 2% |
