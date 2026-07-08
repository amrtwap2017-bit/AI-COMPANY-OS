# 04 — Data Security

> Data security framework for the intelligence platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 8 — 05-Security-Readiness.md | Security baseline |
| Phase 3 — Security-Architecture.md | Security architecture |

## Data Protection Principles

1. **Encryption at rest** — All data encrypted using AES-256
2. **Encryption in transit** — TLS 1.3 for all connections
3. **Access control** — Least privilege, need-to-know basis
4. **Data isolation** — Schema-per-tenant for customer data
5. **Anonymization** — PII anonymized in analytics datasets
6. **Audit logging** — All data access logged and monitored
7. **Retention** — Data retained per legal/compliance requirements

## Data Classification Controls

| Classification | Encryption | Access | Audit | Retention |
|---------------|-----------|--------|-------|-----------|
| Public | Optional | No auth | None | Indefinite |
| Internal | AES-256 | SSO auth | 90 days | 2 years |
| Confidential | AES-256 | RBAC + MFA | 1 year | 7 years |
| Restricted | AES-256 + field-level | Strict RBAC + MFA | 5 years | 10 years |

## Security Controls

| Control | Implementation | Coverage |
|---------|---------------|----------|
| Database encryption | PostgreSQL TDE | All production DBs |
| Backup encryption | AES-256 | All backups |
| Network isolation | VPC + private subnets | Data tier |
| Access logging | pg_audit + application audit | All queries |
| PII detection | Regex + ML-based | All ingested data |
| Row-level security | PostgreSQL RLS | Multi-tenant data |

## Data Security Monitoring

| Monitor | Alert | Response |
|---------|-------|----------|
| Unauthorized access attempt | Immediate | Block + investigate |
| Large data export | > 100K rows | Verify + audit |
| Login from unknown location | Flag | MFA challenge |
| Schema change out of hours | Alert | Verify with engineering |
| PII exposed in log | Immediate | Rotate + notify |
