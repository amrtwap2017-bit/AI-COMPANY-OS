# 02 — Feature Lifecycle

> Lifecycle management for platform features.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Product-Backlog.md | Backlog management |
| Phase 3 — Screen-Architecture | Existing screens |

## Feature Stages

```
IDEA ──► VALIDATE ──► DESIGN ──► BUILD ──► LAUNCH ──► GROW ──► MATURE ──► RETIRE
  │         │           │          │         │         │         │          │
New      Market      Wire-      Develop  Ship to   Optimize  Stable    Sunset
idea     research    frames,    + test   customers based on  + low     plan +
                    mocks                       feedback    effort    migration
```

## Stage Gates

| Gate | Entry Criteria | Review | Output |
|------|---------------|--------|--------|
| Idea to Validate | Problem statement, target user | Product team | Validation plan |
| Validate to Design | 3+ customer interviews, market data | CTO + COO | PRD |
| Design to Build | Approved designs, tech spec | Engineering | Implementation plan |
| Build to Launch | Tests pass, doc ready, QA signoff | QA + Product | Release notes |
| Launch to Grow | Usage data, NPS > 40 | Product | Growth plan |
| Grow to Mature | Stable usage, low support tickets | Engineering | Maintenance mode |
| Mature to Retire | Usage declining, new alternative | Exec team | Migration plan |

## Feature Metrics

| Stage | Key Metric | Target |
|-------|-----------|--------|
| Validation | Customer interest score | > 7/10 |
| Launch | Adoption rate (first 30 days) | > 20% |
| Grow | Engagement rate (weekly) | > 50% |
| Mature | Support tickets per feature | < 5/month |
| Retire | Migration completion rate | > 95% |
