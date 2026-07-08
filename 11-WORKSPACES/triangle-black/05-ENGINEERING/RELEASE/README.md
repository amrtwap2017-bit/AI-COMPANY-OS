# 20 — Sprint Foundation

## Sprint Cadence

| Parameter | Value |
|-----------|-------|
| Duration | 2 weeks |
| Start day | Monday |
| End day | Friday (Week 2) |
| Ceremonies | Planning (Mon), Review (Fri), Retro (Fri) |

## Sprint Roles

| Role | Person | Responsibilities |
|------|--------|------------------|
| Product Owner | Business stakeholder | Requirements, priorities, acceptance |
| Engineering Lead | Technical lead | Architecture, standards, quality |
| Developers | Engineering team | Implementation, testing, documentation |

## Sprint Events

### Planning (Monday, Week 1 — 1 hour)
- Review sprint goal
- Estimate backlog items
- Commit to sprint scope
- Assign work items

### Daily Standup (15 min)
- What did I do yesterday?
- What will I do today?
- Any blockers?

### Review (Friday, Week 2 — 30 min)
- Demo completed work
- PO accepts or rejects
- Update backlog

### Retrospective (Friday, Week 2 — 30 min)
- What went well?
- What could improve?
- Action items for next sprint

## Backlog Management

```
Backlog
├── Epics (Phase 3 modules)
│   ├── Features (user stories)
│   │   ├── Tasks (technical work items)
│   │   └── Bugs (defects)
```

## Estimation (Story Points)

| Size | Points | Example |
|------|--------|---------|
| XS | 1 | Bug fix, small refactor |
| S | 2 | Simple endpoint + service |
| M | 3 | Feature with CRUD + list view |
| L | 5 | Module with multiple endpoints |
| XL | 8 | Complex feature with events + background jobs |

## Definition of Ready

A backlog item is ready for sprint when:
- [ ] Linked to a requirement ID
- [ ] Acceptance criteria defined
- [ ] API contract defined (if backend)
- [ ] Screen spec referenced (if frontend)
- [ ] Dependencies identified
- [ ] Estimated (points)
- [ ] Smaller than 8 points (otherwise split)

## Sprint Retrospective Actions

```
Date: 2026-07-11
Sprint: 1

What went well:
- No production incidents
- All quality gates passing

What could improve:
- PR review turnaround time
- More test coverage on edge cases

Action Items:
- Implement PR review SLA tracking
- Add test template for edge cases
```
