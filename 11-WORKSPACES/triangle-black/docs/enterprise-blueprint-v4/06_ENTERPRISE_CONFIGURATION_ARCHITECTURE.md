# Enterprise Configuration Architecture v4

## Objective

New customers, brands, industries, workflows, permissions, dashboards and AI policies must be provisioned as governed configuration—not source-code forks. Existing `portal/lib/platform-config.ts` is a useful design reference but is static and must not remain the authority.

## Configuration hierarchy

```text
Platform defaults → industry package → subscription plan → organization → site/business unit → role → user preference
```

Lower layers may narrow, but not weaken, security, data-retention, approval or AI safety policies.

| Configuration domain | Configuration objects | Governance |
|---|---|---|
| Brand/theme/assets | logo, palette tokens, typography, favicon, document templates | versioned, validated, previewed; tenant-scoped storage. |
| Industry/terminology | capability package, labels, units, forms, asset taxonomy | curated packages with compatibility versions. |
| Modules/navigation | modules, pages, navigation nodes, role visibility | entitlement plus permission, never UI-only hiding. |
| Locale/finance | locale, time zone, currency, tax, fiscal periods | organization defaults with allowed site/user overrides. |
| Access | roles, permission sets, segregation-of-duty rules, data scopes | policy-as-data with audit and approval. |
| Workflow | definitions, states, transitions, SLA, approval matrix, notifications | versioned activation; in-flight instances remain on their version. |
| Dashboard | KPI catalog, cards, thresholds, saved views | governed metric definitions and role scope. |
| AI | agent availability, model/provider routing, retrieval sources, budgets, action policy | central AI governance approval and audit. |
| Feature flags | rollout, experiment, entitlement, kill switch | tenant/module/user targeting with expiry and audit. |

## Implementation constraints

- Configuration is schema-validated, API-managed, cacheable, auditable and versioned.
- Secrets never live in tenant configuration; configuration references secret-manager entries by opaque ID.
- Existing hard-coded defaults become initial seed values, retaining current behavior until a tenant explicitly changes configuration.
- UI receives a signed/effective configuration snapshot; server-side authorization remains authoritative.

