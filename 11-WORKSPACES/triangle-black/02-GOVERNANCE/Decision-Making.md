# Decision-Making Framework

## Decision Hierarchy

| Level | Who Decides | Examples |
|---|---|---|
| Strategic | Founder / CEO | Business model, market entry, partnerships |
| Architectural | CTO / Enterprise Architect | Technology stack, system design, security |
| Product | Product Director | Feature prioritization, roadmap, UX |
| Operational | Operations Director | Workflows, SOPs, client delivery |
| Technical | Engineering Lead | Implementation details, code reviews |

## When to Write an ADR

An Architecture Decision Record is required when:
- Choosing a technology, framework, or library
- Defining a system boundary or integration pattern
- Making a trade-off between competing approaches
- Changing a previously documented decision

ADR format: Context → Decision → Consequences → Alternatives

## Escalation Path

1. Team-level agreement
2. Technical lead review
3. Architecture review (for cross-cutting decisions)
4. Executive decision (for strategic or costly decisions)

## Traceability Rule

No feature, API, database table, or screen may exist unless it can be traced back to a documented business capability and a measurable business objective.
