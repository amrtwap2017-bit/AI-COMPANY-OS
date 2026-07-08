# Architecture Governance

> Governance framework for maintaining architectural integrity during evolution.

## Governance Principles

1. **ADR Inviolability** — Architecture Decision Records from Phases 0-9 are frozen. Changes require new ADR.
2. **Traceability** — Every enhancement must trace back to enterprise vision (Phase 0).
3. **Design Freeze** — Phases 0-4 designs are frozen. Implementation can evolve within design bounds.
4. **Review Before Change** — All architectural changes require peer review.
5. **Documentation First** — Architecture change documented before implementation.

## Architecture Review Board

| Role | Member | Voting |
|------|--------|--------|
| Chief Architect | CTO | ✅ |
| Domain Architect | COO | ✅ |
| Engineering Lead | DevOps Lead | Advisory |
| Product Lead | Senior Dev | Advisory |

## Change Categories

| Category | Definition | Approval | Documentation |
|----------|-----------|----------|--------------|
| Cosmetic | No architecture impact | Self-service | None |
| Minor | Localized change, no ADR impact | DevOps Lead | PR description |
| Major | Cross-component, new ADR | Architecture Review Board | New ADR |
| Strategic | Architecture principle change | CTO + COO | New ADR + exec signoff |

## Architecture Review Process

```
Proposal ──► Review ──► Decision ──► Document ──► Implement ──► Verify
   │          │           │            │             │             │
 RFC       ARB       Approve/    New ADR     Build +      Post-
 filed     reviews    Revise/    or update   test         implementation
                     Reject     existing                  review
                                ADR
```

## ADR Index Extensions

New ADRs for Phase 10 follow the format from SHARED/ADR-Template.md
and are indexed in Root/02-DECISION-RECORDS.md.

## Quarterly Architecture Review

| Quarter | Focus | Output |
|---------|-------|--------|
| Q1 | Architecture health assessment | Scorecard, debt register |
| Q2 | ADR compliance audit | Compliance report |
| Q3 | Technology radar | New tech evaluation |
| Q4 | Annual architecture plan | Next year roadmap |
