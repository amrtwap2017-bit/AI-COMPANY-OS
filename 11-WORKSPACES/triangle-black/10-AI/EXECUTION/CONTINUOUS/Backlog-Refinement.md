# Backlog Refinement

## Purpose

Backlog refinement ensures that the team always has a well-prioritized, well-defined, and accurately estimated set of work items ready for execution. Continuous refinement eliminates the need for batch refinement sessions and ensures the backlog is always in a usable state.

## Continuous Backlog Grooming

Backlog refinement is not a once-per-sprint meeting — it is an ongoing activity performed continuously by the Program Manager AI and Product Owner AI agents, with human validation at regular intervals.

### Ongoing Activities

| Activity | Frequency | Who | Description |
|----------|-----------|-----|-------------|
| Prioritization | Continuous | Program Manager AI | Rank items by business value, dependencies, and cost of delay |
| Splitting large items | Continuous | All | Break items exceeding 8 story points into smaller pieces |
| Adding details | As needed | Product Owner AI | Add acceptance criteria, context, technical notes |
| Re-estimation | On change | Team | Re-estimate when new information changes scope or complexity |
| Dependency identification | Continuous | Program Manager AI | Flag cross-team or cross-system dependencies |
| Stale item review | Weekly | Program Manager AI | Review items untouched for 30+ days: reprioritize or deprecate |

## Refinement Cadence

### Continuous Refinement (Daily - Automated)

- **Program Manager AI** continuously scans the backlog for:
  - Items that need re-prioritization based on new information
  - Items that have become stale (no updates in 30 days)
  - Items that may be impacted by completed work or changed dependencies
  - Items that can be split or merged
- Actions are proposed automatically as PRs against the backlog.
- Human team members review and approve changes during their normal workflow.

### Mid-Sprint Refinement Session (Weekly - Human)

- A dedicated 1-hour session per week (typically mid-sprint).
- Purpose: Review the top of the backlog for the upcoming sprint.
- Activities:
  1. Review and validate AI agent prioritization.
  2. Review acceptance criteria for top-priority items.
  3. Clarify ambiguous requirements.
  4. Identify technical approach decisions needed.
  5. Estimate unestimated items (using planning poker or equivalent).
  6. Validate dependency mappings.
- Output: The top 20% of the backlog is ready for sprint planning.

### Backlog Health Review (Monthly - Human)

- A 30-minute review of overall backlog health.
- Metrics reviewed:
  - Backlog size (total items) — is it growing or shrinking?
  - Percentage of estimated items — is the team keeping up with estimation?
  - Percentage of items with acceptance criteria — is refinement keeping pace?
  - Stale item count — how many items are older than 90 days?
  - Average item age — is the backlog getting older?

## Refinement Roles

### Program Manager AI

The AI agent responsible for continuous backlog management:

- **Scheduling**: Continuously prioritizes the backlog using cost of delay and dependencies.
- **Analysis**: Identifies patterns (e.g., recurring delays, dependency bottlenecks).
- **Validation**: Flags items with missing information, conflicting priorities, or unrealistic scope.
- **Reporting**: Generates backlog health metrics and alerts.

### Product Owner AI

The AI agent responsible for defining and detailing work items:

- **Acceptance criteria**: Generates initial acceptance criteria from feature descriptions.
- **User stories**: Drafts user stories from epics using the standard format ("As a... I want... So that...").
- **Context gathering**: Collects relevant context from previous work, documentation, and system behavior.
- **Validation**: Ensures items have a clear business value statement and measurable success criteria.

### Human Refinement Roles

| Role | Responsibility |
|------|---------------|
| Product Manager | Validates business value and priority. Clarifies requirements. |
| Engineering Lead | Validates technical approach, feasibility, and estimates. |
| Team Members | Provide estimates. Identify technical dependencies and risks. |
| QA Lead | Validates testability of acceptance criteria. Identifies test scenarios. |

## Backlog States

Items in the backlog flow through these states:

```
Backlog (unrefined)
  → Refined (has acceptance criteria, estimated)
  → Ready (top priority, ready for sprint planning)
  → Committed (in current sprint)
  → In Progress
  → Done
  → Deprecated (removed, with reason logged)
```

## Definition of Ready

An item is considered "Ready" for sprint planning when:

- [ ] Has a clear, descriptive title.
- [ ] Has acceptance criteria (specific, testable, unambiguous).
- [ ] Is estimated (story points or effort).
- [ ] Has a defined business value.
- [ ] Dependencies are identified and documented.
- [ ] Technical approach is validated (spike done if needed).
- [ ] All questions from refinement are resolved.
- [ ] Item fits within a sprint (≤ 8 story points; larger items are split).

## Backlog Hygiene Rules

| Rule | Description |
|------|-------------|
| **No item > 8 points** | Items exceeding 8 story points must be split |
| **90-day expiry** | Items untouched for 90 days are flagged for deprecation |
| **Keep top 20% refined** | At least 20% of backlog items by priority must be in "Ready" state |
| **Dependencies mapped** | Every item must have its dependencies (or "none") documented |
| **Value required** | Every item must have a business value statement |
| **Single item, single team** | Items spanning multiple teams must be split by team boundary |
