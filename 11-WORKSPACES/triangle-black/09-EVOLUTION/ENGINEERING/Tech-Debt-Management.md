# 09 — Tech Debt Management

> Technical debt management program.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Engineering-Roadmap.md | Engineering evolution |

## Tech Debt Categories

| Category | Description | Examples | Risk |
|----------|-------------|----------|------|
| Code debt | Poor code quality | Duplication, complexity, dead code | Medium |
| Architecture debt | Suboptimal design | Missing abstractions, tight coupling | High |
| Test debt | Insufficient coverage | Missing tests, flaky tests | Medium |
| Documentation debt | Missing docs | Undocumented APIs, outdated README | Low |
| Infrastructure debt | Manual operations | Manual deployments, no IaC | High |
| Security debt | Security gaps | Missing authentication, outdated deps | Critical |

## Tech Debt Register

| Debt Item | Category | Impact | Effort | Status | Owner |
|-----------|----------|--------|--------|--------|-------|
| (To be populated from code audit) | | | | | |

## Tech Debt Policy

| Rule | Policy |
|------|--------|
| New code | Zero new debt — all new code meets standards |
| Known debt | Triage, prioritize, schedule reduction |
| Critical debt | Fix immediately (security, data loss) |
| High debt | Schedule within 2 sprints |
| Medium debt | Schedule within 1 quarter |
| Low debt | Depends on effort/impact ratio |

## Tech Debt Reduction Process

```
Identify ──► Document ──► Prioritize ──► Schedule ──► Fix ──► Verify
   │           │            │              │           │        │
 Code      Register     Impact/       Sprint or    Code      Tests
 review    entry        effort        dedicated   change     pass
 + tools   + category   matrix        time
```

## Budget Allocation

| Sprint | Tech Debt % | Feature % | Rationale |
|--------|------------|-----------|-----------|
| Early stage (V1) | 10% | 90% | Move fast |
| Growth (V1.2+) | 20% | 80% | Sustainable pace |
| Scale (V2+) | 30% | 70% | Quality focus |
| Mature (V3+) | 20% | 80% | Balanced |

## Tech Debt Metrics

| Metric | Current | H1 Target |
|--------|---------|-----------|
| Code duplication % | — | < 5% |
| Cyclomatic complexity (avg) | — | < 10 |
| Test coverage | — | > 80% |
| Critical security issues | — | 0 |
| Outdated dependencies | — | < 10 |
| Documentation coverage | — | > 80% |
