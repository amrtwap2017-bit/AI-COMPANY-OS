# 06 — Multi-Tenant Enhancements

> Multi-tenant architecture enhancements for scaling.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 3 — Physical-Database.md | Schema-per-tenant |
| Phase 5 — Platform-Foundation.md | Multi-tenant foundation |

## Multi-Tenant Model

```
┌──────────────────────────────────────────────┐
│              ROUTER / GATEWAY                  │
│  ● Subdomain-based tenant resolution           │
│  ● Request tenant context injection            │
│  ● Rate limiting per tenant                    │
└──────────────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐      ┌────────┐
│Hotel A │ │Hotel B │ ...  │Hotel N │
│Postgres│ │Postgres│      │Postgres│
│Schema  │ │Schema  │      │Schema  │
└────────┘ └────────┘      └────────┘
```

## Tenant Isolation

| Aspect | Strategy | Rationale |
|--------|----------|-----------|
| Data isolation | Schema-per-tenant | Strong isolation, easy backup/restore |
| Compute isolation | Same app instances | Cost-efficient at small scale |
| Resource limits | Per-tenant rate limiting | Fair usage |
| Customization | Per-tenant config | Hotel-specific settings |
| White-labeling | Per-tenant branding | Hotel-specific UX |
| Backup | Per-schema backup | Individual tenant restore |

## Tenant Onboarding

| Step | Automation | SLA |
|------|-----------|-----|
| Create tenant record | Automated | Real-time |
| Provision schema | Automated via migration | < 1 min |
| Apply tenant seed data | Automated | < 1 min |
| Configure DNS | Automated | < 5 min |
| Setup initial data | Manual (CSV import) | < 1 hour |
| Verify tenant | Automated health check | < 1 min |

## Tenant Management Operations

| Operation | Self-Service | Automation | Approval |
|-----------|-------------|-----------|----------|
| Tenant creation | No | Yes | Sales/CS |
| Tenant upgrade | No | Yes | Billing |
| Tenant downgrade | No | Yes | Billing |
| Tenant suspension | No | Yes | CS/Finance |
| Tenant deletion | No | Manual | Exec |
| Data export | Yes | Yes (GDPR) | Automated |

## Multi-Tenant Challenges

| Challenge | Mitigation |
|-----------|-----------|
| Schema management across tenants | Automated migration system |
| Cross-tenant performance isolation | Per-tenant resource limits |
| Tenant-specific feature flags | Feature toggle per tenant |
| Data privacy across tenants | Schema isolation prevents leakage |
| Backup/restore per tenant | Per-schema pg_dump/restore |
