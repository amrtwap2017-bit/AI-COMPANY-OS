# Gap Register

| ID | Category | Severity | Evidence / affected files | Impact and recommended action | Complexity / priority |
|---|---|---|---|---|---|
| GAP-001 | Runtime routing | P0 | `src/main.py:~430`; undefined `attention_sla_router`; 11 missing routes | V15 workflows 404. Separate registrations, fail startup, assert routes | S / P0 |
| GAP-002 | Tenant firewall | P0 | `src/core/customer_scope.py` has zero production callers; `tenant.py` fallback | Cross-tenant/untrusted data risk. Enforce JWT tenant and scope all customer reads | L / P0 |
| GAP-003 | API contract | P0 | `app.openapi()` Pydantic `AddNoteIn` error | Cannot reliably document/test client contract. Resolve model definitions and certify | M / P0 |
| GAP-004 | Secrets | P0 | dev credentials/defaults tracked in source/scripts/CI/docs | Rotate/remove defaults, secret manager, CI scanning that fails | M / P0 |
| GAP-005 | Customer activation | P1 | onboarding/import/invite/adoption routes absent | First-hotel onboarding blocked. Repair and run real tenant rehearsal | M / P1 |
| GAP-006 | Evidence/ROI | P1 | dynamic DDL; no DB/customer evidence | ROI not defensible. Migrate schema, roles, immutable verification evidence | L / P1 |
| GAP-007 | Baseline | P1 | `pilot_control` recomputes baseline | Before/after unreliable. Persist immutable versioned snapshots | M / P1 |
| GAP-008 | Adoption | P1 | approval only updates rec; no adoption event | Adoption metric incomplete. Emit durable approval event | S / P1 |
| GAP-009 | Frontend quality | P1 | TS1381, `ignoreBuildErrors` | Portal build/UX unsafe. Fix syntax and enforce zero error gate | S / P1 |
| GAP-010 | DR/observability | P1 | scripts/config only, no proof | Operations unsafe. Execute/record restore, monitoring, alert tests | L / P1 |
| GAP-011 | Docs | P2 | NestJS/Prisma and FastAPI/SQLAlchemy claims conflict | Operators/builders misled. classify/archive/supersede docs | M / P2 |
| GAP-012 | Architecture hygiene | P2 | duplicate entrypoints, silent catches, generated artifacts | regressions hidden. establish single entrypoint/registry | L / P2 |
