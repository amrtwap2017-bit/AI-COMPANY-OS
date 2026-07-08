# 06 — Risk Register

> Project and architecture risks with mitigation strategies.

## Risk Scoring

- **Likelihood**: 1 (Rare) → 5 (Almost Certain)
- **Impact**: 1 (Negligible) → 5 (Catastrophic)
- **Score**: Likelihood × Impact (1-25)

## Active Risks

| ID | Risk | Phase | L | I | Score | Mitigation | Owner | Status |
|----|------|-------|---|---|-------|------------|-------|--------|
| R-001 | Single VPS hits resource ceiling during peak | 04 | 3 | 4 | 12 | Vertical scaling (up to $40/mo), horizontal V2 | Infra | Monitor |
| R-002 | Schema-per-tenant migration complexity | 02 | 2 | 3 | 6 | Automated migration pipeline, CI/CD validation | Backend | Mitigated |
| R-003 | External integration failure (ETA API downtime) | 07 | 3 | 3 | 9 | Retry with exponential backoff, manual fallback, DLQ | Integration | Active |
| R-004 | JWT token security breach | 04 | 1 | 5 | 5 | Short-lived tokens, refresh rotation, bcrypt, rate limiting | Security | Mitigated |
| R-005 | PostgreSQL connection pool exhaustion | 05 | 2 | 4 | 8 | Connection pooling (PgBouncer V2), query optimization | Backend | Active |
| R-006 | Scope creep during Phase 6 implementation | 06 | 3 | 3 | 9 | Design freeze on phases 0-4, ADR required for changes | Product | Monitor |
| R-007 | Data migration from legacy systems | 07 | 3 | 4 | 12 | CSV import templates, validation pipeline, dry-run mode | Integration | Active |
| R-008 | Single developer bus factor | 04 | 4 | 4 | 16 | Comprehensive documentation, AI agent code generation | Engineering | Active |
| R-009 | Egypt ETA regulation changes | 07 | 2 | 4 | 8 | Configurable invoice schema, monitoring updates | Compliance | Monitor |
| R-010 | Mobile offline sync conflicts | 06 | 2 | 3 | 6 | Last-write-wins with audit trail, conflict UI | Mobile | Active |

## Risk Trend

```
Period 1: 15 risks (initiation)
Period 2: 12 risks (post-mitigation)  
Period 3: 10 risks (current — mitigations reducing likelihood)
```

## Mitigation Action Items

| Risk | Action | Target Date | Status |
|------|--------|------------|--------|
| R-001 | Benchmark VPS at target load, identify vertical scaling ceiling | Phase 6 completion | Pending |
| R-005 | Implement query profiling, add PgBouncer to Docker Compose | Phase 5 | Done |
| R-003 | Build ETA sandbox test environment | Phase 7 Sprint 1 | Pending |
| R-008 | Record architecture walkthrough videos, pair on complex modules | Ongoing | Active |

## Escalation Path

- **Risk score 15+**: Escalate to CTO. Immediate mitigation plan required.
- **Risk score 10-14**: Escalate to Tech Lead. Mitigation plan within 2 sprints.
- **Risk score <10**: Track in risk register. Review monthly.

## Deferred Risks (V2)

| ID | Risk | Reason for Deferral |
|----|------|---------------------|
| R-011 | Multi-region data residency | No current business need |
| R-012 | OWASP top 10 penetration testing | Budget constraint, basic security applied V1 |
| R-013 | SOC2 / ISO 27001 certification | Not required by V1 client profile |
