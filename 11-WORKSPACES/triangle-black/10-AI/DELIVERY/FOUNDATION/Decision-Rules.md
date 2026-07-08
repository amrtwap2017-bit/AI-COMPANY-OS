# Decision Rules

> Rules governing decisions made by AI agents within the framework.

## Decision Hierarchy

```
Level 0: Immutable — AI Constitution, Architecture Baseline
    Cannot be changed without constitutional amendment

Level 1: Strategic — Enterprise Principles, Business Capabilities
    Requires ADR + human approval

Level 2: Architectural — Technology choices, Design patterns
    Requires ADR

Level 3: Tactical — Implementation approach, Module design
    Agent authority within defined scope

Level 4: Operational — Daily execution, Sprint tasks
    Full agent authority
```

## When to Create an ADR

An ADR is required when:
- Introducing a new technology, library, or framework
- Changing the architecture baseline
- Modifying a domain boundary or bounded context
- Changing the database schema in a breaking way
- Adding a new integration or external system
- Changing the deployment model
- Modifying security policies
- Making any decision at Level 2 or above

## When to Escalate

An agent escalates when:
- A decision exceeds its defined authority level
- A conflict exists between two rules or standards
- The blueprint is ambiguous or contradictory
- A quality gate failure cannot be resolved within the agent's authority
- A dependency is blocked by an external factor
- A security concern is identified outside the agent's scope

## Escalation Format

```markdown
## Escalation: [Title]

**From:** [Agent Role]
**To:** [Supervisor Role]
**Severity:** Low / Medium / High / Critical

**Issue:**
Clear description of what is being escalated.

**Context:**
Relevant background, decisions made so far, options considered.

**Recommendation:**
What the agent believes should be done.

**Impact if not resolved:**
What happens if this decision is delayed.
```

## Decision Logging

Every decision, whether made autonomously or escalated, must be logged:
- Agent role
- Decision
- Rationale
- Options considered
- Authority level
- References (ADRs, standards, business rules)
- Timestamp
