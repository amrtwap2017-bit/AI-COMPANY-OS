# Sprint Goal

## Purpose

The sprint goal is a concise, single-sentence statement of the unifying objective for the sprint. It serves two critical purposes:

1. **Unifying objective** — It aligns all AI agents and stakeholders around what matters most during the sprint. Every task in the sprint backlog must contribute to achieving this goal.
2. **Decision filter** — When ambiguity arises (scope questions, trade-offs, prioritization decisions mid-task), the sprint goal provides a clear criterion: "Does this action move us closer to the goal? If not, defer it."

A well-defined sprint goal transforms a list of tasks into a shared mission.

## How to Write a Good Sprint Goal

### Criteria (INVEST-style for goals)

| Criterion | Description | Example |
|---|---|---|
| **Valuable** | States the business outcome, not just the feature name | "Reduce checkout abandonment by 15% through a simplified payment flow" |
| **Coherent** | All selected backlog items clearly support it | Avoid goals that combine unrelated features under a vague umbrella |
| **Measurable** | Success can be evaluated at sprint end | "Enable 50 concurrent users to complete the reporting workflow without errors" |
| **Achievable** | Realistic within the sprint time-box and team capacity | Goals should stretch but not break the team |
| **Atomic** | One goal per sprint. If you need multiple goals, you need multiple sprints | Exception: very small items that genuinely do not relate (max 1-2 items outside goal) |

### Common Pitfalls

| Pitfall | Example | Better |
|---|---|---|
| Feature list masquerading as a goal | "Implement login, dashboard, and export" | "Enable users to access their personalized dashboard with exportable reports" |
| Too vague | "Improve system quality" | "Reduce critical and high-severity bugs to zero across the payment module" |
| Too narrow | "Add a blue button on the settings page" | "Deliver a usable settings page that allows users to control notification preferences" |
| Multiple goals | "Migrate database and add dark mode" | Split into two sprints or select one primary goal with a minor secondary item |
| Process goal | "Complete all sprint backlog items" | That is the default expectation, not a goal. A goal is the _outcome_ the items deliver |

### Process

1. During Sprint Planning, the Program Manager AI drafts the goal based on the top-priority backlog items.
2. AI agents review the goal and confirm that their assigned tasks align with it.
3. Stakeholders provide a final confirmation.
4. The goal is committed to the sprint tracking system and displayed in all daily reports.

## Sprint Goal Template

```
Sprint [N]: [Goal Statement]
```

One sentence. Examples:

- "Sprint 5: Enable end-to-end user registration with email verification and profile creation."
- "Sprint 6: Achieve sub-100ms p99 latency for the search API under baseline load."
- "Sprint 7: Complete SOC 2 Type II evidence collection for all five trust service criteria."
- "Sprint 8: Deliver the MVP reporting dashboard with three core report types and CSV export."

## Sprint Goal Commitment

The sprint goal represents a commitment by the AI execution team:

- The team commits to organizing its work around the goal.
- The team commits to transparent communication if the goal is at risk.
- Stakeholders commit to not changing the goal mid-sprint.
- The goal is achieved, partially achieved, or not achieved — there is no partial credit. The Sprint Review evaluates success against the goal, not against individual task completion.

### What Happens When the Goal Cannot Be Met

1. **Detection** — As soon as a task or dependency reveals that the sprint goal is at risk, the affected AI agent raises the signal automatically via the escalation protocol.
2. **Assessment** — The Program Manager AI evaluates: can the goal be saved by descoping lower-value items? Are there workarounds? Is there a simpler path to the same outcome?
3. **Decision** — Options in priority order:
   - Repurpose remaining capacity toward achieving the goal (descope non-goal items).
   - Accept partial goal achievement and document the gap.
   - Terminate the sprint early (rare, only if the goal is the sole purpose of the sprint and is unreachable).
4. **Transparency** — Stakeholders are informed immediately with a clear explanation and revised plan.

### Goal Achievement Scoring

| Score | Definition |
|---|---|
| **Achieved (100%)** | The sprint goal outcome is fully delivered and demonstrable |
| **Partially Achieved (50-99%)** | Core outcome is delivered but with gaps or limitations |
| **Not Achieved (0-49%)** | Sprint goal was not met; valuable work may still have been completed |
| **Obsolete** | Business context changed; the goal is no longer relevant (sprint may continue on other work) |

Goal achievement percentage is tracked in Sprint Metrics to identify trends in planning accuracy and execution reliability.
