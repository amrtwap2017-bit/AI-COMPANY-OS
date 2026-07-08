# Architecture Principles

## Hierarchy

```
Engineering Constitution (frozen)
└── Architecture Principles (frozen)
    ├── Phase 3 Digital Twin Design (frozen)
    ├── Phase 4 Engineering Standards (frozen after approval)
    │   ├── 01-09 Construction Standards
    │   ├── 10-12 Infrastructure & DevOps
    │   ├── 13-16 Quality & Observability
    │   └── 17-25 Process & Governance
    └── Phase 5+ Implementation (build-time decisions)
```

## Decision Framework

Every architecture decision must answer:

1. **What business requirement does this serve?** (Trace to Phase 3 requirement ID)
2. **What is the simplest implementation?** (No unnecessary complexity)
3. **What does this cost per month?** (Must fit $25-40/mo MVP budget)
4. **What is the extraction path?** (How would we scale this when needed?)
5. **What is the rollback plan?** (How do we undo this?)

## When to Write an ADR

Write an Architecture Decision Record when:

- Adding a new external dependency
- Changing database schema design
- Changing module boundaries
- Adding infrastructure components
- Changing authentication or authorization approach
- Deviating from any standard in Phase 4

## ADR Template

```markdown
# ADR-{NNN}: {Title}

Status: {Proposed | Accepted | Deprecated | Superseded}
Date: {YYYY-MM-DD}
Author: {Name}

## Context
{What is the issue?}

## Decision
{What did we decide?}

## Consequences
{What tradeoffs did we accept?}

## Alternatives Considered
{What else did we evaluate and why did we reject it?}
```
