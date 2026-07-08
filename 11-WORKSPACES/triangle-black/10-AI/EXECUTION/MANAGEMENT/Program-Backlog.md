# Program Backlog Management

## Overview

The Program Backlog is the single, prioritized list of all work items required to deliver the program outcomes. It serves as the authoritative source of truth for what needs to be done, in what order, and with what dependencies. The backlog translates the program charter into actionable work units that drive execution.

## Backlog Structure

The program backlog is organized hierarchically to support planning at different levels of granularity:

```
Strategic Objective
    └── Program
        ├── Epic (Large body of work, multiple sprints/iterations)
        │   ├── Feature (Functional capability delivered incrementally)
        │   │   ├── Story (Small, valuable unit of work)
        │   │   └── Task (Technical work item, part of a story)
        │   └── Feature
        └── Epic
```

### Backlog Item Types

| Type | Description | Typical Size | Lifecycle |
|------|-------------|--------------|-----------|
| **Epic** | Large, cross-functional body of work spanning multiple iterations. Delivers a significant business outcome. | 2-4 months | Program-level planning and tracking |
| **Feature** | Functional capability that provides value to stakeholders. Implemented within a single iteration or across contiguous iterations. | 1-4 weeks | Iteration planning |
| **Story** | Small, valuable increment of functionality. Follows INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable). | 1-3 days | Sprint/iteration execution |
| **Task** | Technical work item decomposing a story. Not visible outside the delivery team. | Hours to 2 days | Daily execution |
| **Spike** | Time-boxed investigation or research activity. Reduces uncertainty or validates approach. | 1-5 days | As needed |
| **Technical Debt** | Work to improve code quality, architecture, or system health without adding new functionality. | Variable | As prioritized |

## Prioritization Framework

Backlog items are prioritized using a multi-factor scoring model that balances value, effort, dependency, and risk:

### Prioritization Factors

| Factor | Description | Weight | Scoring |
|--------|-------------|--------|---------|
| **Business Value** | The value delivered to the business and stakeholders | 35% | 1-10 (low-high) |
| **Strategic Alignment** | How well the item aligns with program and portfolio objectives | 20% | 1-10 (low-high) |
| **Effort/Cost** | The estimated effort required to deliver the item | 15% | 1-10 (inverted: low effort = high score) |
| **Dependency** | Whether the item unblocks other work or is dependent on others | 15% | 1-10 (high score for unblocking) |
| **Risk Reduction** | How much the item reduces uncertainty or technical risk | 10% | 1-10 (high reduction = high score) |
| **Urgency** | Time sensitivity, market windows, regulatory deadlines | 5% | 1-10 (high urgency = high score) |

### Priority Score Formula

```
Priority Score = (BV × 0.35) + (SA × 0.20) + (EFF × 0.15) + (DEP × 0.15) + (RR × 0.10) + (URG × 0.05)
```

Items are ranked by priority score. The program manager and product manager collaborate to validate the ranking and make final ordering decisions based on qualitative factors not captured in the model.

### Priority Tiers

| Tier | Score Range | Label | Description |
|------|-------------|-------|-------------|
| P1   | 8.0-10.0 | Critical | Must be delivered in current/next iteration. Blocking progress. |
| P2   | 6.0-7.9 | Important | Should be delivered in current planning horizon. High value. |
| P3   | 4.0-5.9 | Valuable | Worth doing when capacity permits. Medium value. |
| P4   | 0.0-3.9 | Nice-to-Have | Low priority. Only done if all higher-priority work is complete. |

## Backlog Refinement Process

Backlog refinement ensures items are well-defined, estimated, and ready for execution:

### Refinement Cadence

| Activity | Frequency | Participants | Duration |
|----------|-----------|--------------|----------|
| Epic Refinement | Monthly | Program Manager, Product Manager, Technical Lead | 2 hours |
| Feature Refinement | Bi-weekly | Product Manager, Tech Lead, Business Analyst | 1 hour |
| Story Refinement | Weekly | Full delivery team | 1-2 hours |

### Definition of Ready (DoR)

An item is considered "ready" for execution when it meets these criteria:

- [ ] Clear description of what needs to be done
- [ ] Acceptance criteria defined and testable
- [ ] Dependencies identified and resolved or accepted
- [ ] Estimated (story points or t-shirt size)
- [ ] Value clearly articulated
- [ ] No external blockers
- [ ] Team understands how to implement
- [ ] UX/design complete (if applicable)

### Backlog Refinement Steps

1. **Review top items:** Examine the highest-priority items not yet in active execution
2. **Clarify requirements:** Ensure the team understands what is needed and why
3. **Refine acceptance criteria:** Make acceptance criteria specific and testable
4. **Estimate effort:** Apply story points or sizing
5. **Identify dependencies:** Flag dependencies requiring external coordination
6. **Validate priority:** Confirm the item's position in the backlog is correct
7. **Split large items:** Break epics and large features into smaller deliverable items
8. **Update backlog:** Record all changes and communicate to stakeholders

## Backlog Template

```
==========================================================================
PROGRAM BACKLOG ITEM
==========================================================================

ITEM ID:            BL-{NNN}
ITEM TYPE:          {Epic | Feature | Story | Task | Spike | Tech Debt}
ITEM NAME:          {Descriptive name}
PROGRAM:            {PROG-NNN} — {Program Name}
EPIC (if applicable): {EPIC-NNN} — {Epic Name}

DESCRIPTION:
{Clear description of the work item, what it delivers, and why it matters.}

ACCEPTANCE CRITERIA:
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

PRIORITIZATION:
- Priority Score:  {X.X}
- Priority Tier:   {P1 | P2 | P3 | P4}
- Business Value:  {X}/10
- Strategic Align: {X}/10
- Effort Score:    {X}/10 (inverted)
- Dependency:      {X}/10
- Risk Reduction:  {X}/10
- Urgency:         {X}/10

ESTIMATE:
- Story Points:    {Number}
- T-Shirt Size:    {XS | S | M | L | XL}
- Effort (hours):  {Hours}

DEPENDENCIES:
- {BL-NNN} — {Dependency description}
- {External dependency}

STATUS:             {Draft | Refining | Ready | In Progress | Done}
ASSIGNED TO:        {Name}
TARGET ITERATION:   {Iteration/Sprint name or number}
ACTUAL ITERATION:   {Iteration/Sprint where completed}

NOTES:
{Additional context, decisions, or comments}
==========================================================================
```

## Backlog Health Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Ready Items** | Count of items in Ready state | > 2 iterations worth |
| **Refinement Frequency** | How often backlog is refined | Weekly |
| **Item Age** | Time since item was added to backlog | < 90 days for P1/P2 |
| **Acceptance Rate** | % of items accepted as delivered | > 90% |
| **Scope Change Rate** | % of items changed after refinement | < 15% |
| **Estimation Accuracy** | Variance between estimated and actual effort | +/- 20% |

## Backlog Governance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Prioritization review | Weekly | Program Manager, Product Manager |
| Refinement session | Weekly | Delivery team |
| Epic progress review | Monthly | Program Manager, Sponsor |
| Backlog health check | Monthly | Program Manager |
| New item intake | Continuous | Product Manager |
