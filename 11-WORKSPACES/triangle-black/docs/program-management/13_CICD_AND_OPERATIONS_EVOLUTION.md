# CI/CD and Operations Evolution

## Pipeline

```text
Developer branch
 → format/lint/type/static checks
 → secret/dependency/license/SBOM scan
 → unit tests and API contract tests
 → isolated DB migration + integration tests
 → build signed artifacts
 → preview environment + accessibility/E2E
 → staging + load/security/regression
 → approval gates + canary production
 → smoke/SLO monitoring
 → promote or automated rollback
```

## Environment rules

Development uses seeded isolated data and no production credentials. Preview environments are ephemeral and tenant-scoped. Staging uses production-like topology and anonymized data. Production has immutable artifacts, secret-manager references, least-privileged deploy identity, migrations as a separate controlled job, and approval/audit evidence.

## Rollback and disaster recovery

Every release has application rollback, feature-flag kill switch, database forward-fix/restore decision, queue replay/DLQ handling, and communication plan. Define and test RPO/RTO per capability. A database restore is not accepted until tenant counts, checksums, graph projections, documents and event offsets reconcile.

