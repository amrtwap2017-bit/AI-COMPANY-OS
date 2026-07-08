# 02 — Product Governance

> Product governance framework for the evolving platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Architecture-Governance.md | Architecture governance |

## Governance Principles

1. **Customer-driven** — Every feature must solve a real customer problem
2. **Data-informed** — Decisions based on metrics, not opinions
3. **Architecture-first** — Changes must respect architecture invariants
4. **Phased rollout** — Gradual rollout with monitoring
5. **Documented decisions** — Every product decision documented
6. **Cross-functional review** — Engineering, product, operations
7. **Versioned releases** — Clear versioning and changelogs

## Product Council

| Role | Member | Decisions |
|------|--------|-----------|
| Product Lead | CTO | Feature priority, scope |
| Operations Lead | COO | Business alignment |
| Engineering Lead | DevOps Lead | Feasibility, effort |
| CS Lead | COO | Customer impact |

## Governance Gates

| Gate | Entry Criteria | Approval | Output |
|------|---------------|----------|--------|
| Feature proposal | Problem statement, customer validation | Product council | Prioritized |
| Design review | Wireframes, tech spec, acceptance criteria | CTO + Engineering | Approved spec |
| Pre-launch | QA pass, docs ready, rollout plan | Product council | Launch approval |
| Post-launch review | Metrics for 30 days | Product council | Go/No-go |
| Deprecation | Migration plan, customer comms | CTO + COO | Deprecation notice |

## Feature Request Decision Tree

```
Is this aligned with product vision?
├── NO → Decline with explanation
└── YES
    ├── Is it a critical fix? → P1, sprint
    ├── Is it valuable for multiple customers?
    │   ├── YES → Backlog, prioritize against roadmap
    │   └── NO → Consider as custom, upsell
    └── Is it technically feasible?
        ├── YES → Estimate, prioritize
        └── NO → Research, prototype
```

## Release Governance

| Release Type | Approval | Notice Period | Downtime |
|-------------|----------|---------------|----------|
| Patch | Engineering lead | None | None |
| Minor | Product council | 24 hours | Optional |
| Major | CTO + COO | 2 weeks | Planned |
| Emergency | Engineering lead | Immediate | Minimal |
