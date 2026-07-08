# Sprint Template

## Purpose

This template provides the standard structure for generating new sprint directories within an EADF project. Each sprint directory follows the same layout and contains the artifacts needed to plan, execute, and review the sprint.

---

## Directory Structure

```
sprint-<N>/
├── README.md                   # Sprint overview (this file)
├── plan/
│   ├── sprint-goal.md          # Single sprint objective
│   ├── backlog.md              # Selected backlog items
│   ├── capacity.md             # Team capacity and allocation
│   └── risks.md                # Identified risks and mitigations
├── execution/
│   ├── daily-logs/
│   │   ├── day-01.md
│   │   ├── day-02.md
│   │   └── ...
│   └── task-board.md           # Current task board state
├── review/
│   ├── demo-script.md          # Review demonstration script
│   ├── completed-items.md      # Items meeting Definition of Done
│   └── feedback.md             # Stakeholder feedback captured
├── retrospective/
│   ├── retro-notes.md          # Retrospective discussion notes
│   ├── action-items.md         # Actionable improvements
│   └── lessons.md              # Lessons learned this sprint
└── metrics/
    ├── burndown.md             # Burndown chart data
    └── velocity.md             # Velocity tracking
```

---

## README.md Template (per sprint)

```markdown
# Sprint <N>

**Dates**: YYYY-MM-DD to YYYY-MM-DD
**Duration**: <N> days
**Sprint Goal**: <single, measurable objective>

## Team

- AI Delivery Lead: @name
- Technical Agent Lead: @name
- Domain Expert(s): @name
- Quality Steward: @name
- Agents: <agent-role-1>, <agent-role-2>, ...

## Sprint Backlog Summary

| Item | Type | Owner | Estimate | Status |
|------|------|-------|----------|--------|
| ...  | feat | ...   | 5 SP     | ✅ Done |

## Key Results

- Items completed: X / Y
- Velocity: Z story points
- Quality: <pass/fail> (all gates passed)
- New lessons: <count>

## Risks & Blockers

- <risk or blocker description> — <status>

## Notes

<Any additional context or announcements>
```

---

## Backlog Item Template

Each item in `plan/backlog.md` follows this structure:

```markdown
### EADF-<NNN>: <Title>

**Type**: Feature | Bug | Technical Debt | Improvement
**Estimate**: <SP or T-shirt size>
**Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)

**Description**:
<Clear description of what needs to be done>

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Notes**:
<Architecture guidance, constraints, references>

**Context References**:
- [Doc Title](./path/to/doc.md)
- [Example Code](./path/to/example)

**Definition of Ready Checklist**:
- [ ] Acceptance criteria defined
- [ ] Dependencies identified
- [ ] Context materials attached
- [ ] Value to sprint goal articulated

**Definition of Done Checklist**:
- [ ] All acceptance criteria met
- [ ] Code merged to target branch
- [ ] Tests passing (≥90% coverage)
- [ ] Documentation updated
- [ ] Peer review completed
- [ ] Quality gate signed off
```

---

## Daily Log Template

Each `execution/daily-logs/day-<N>.md`:

```markdown
# Day <N> — YYYY-MM-DD

## Progress by Agent

| Agent | Tasks (In Progress) | Tasks (Done Today) | Blockers |
|-------|---------------------|--------------------|----------|
| ...   | ...                 | ...                | ...      |

## Coordination Points

- <Cross-agent coordination decisions>
- <Clarifications from Domain Expert>

## Escalations

- <Items raised to ADL for resolution>

## Metrics Snapshot

- Tasks remaining: <count>
- Tasks completed: <count>
- Blocker count: <count>
```

---

## Sprint Planning Checklist

- [ ] Sprint goal drafted and agreed by team
- [ ] Backlog items selected from program backlog
- [ ] Capacity calculated (team days available)
- [ ] Each item meets Definition of Ready
- [ ] Dependencies identified and documented
- [ ] Risks assessed and mitigations noted
- [ ] Task board initialized with all items
- [ ] Sprint README.md created

---

## Sprint Review Checklist

- [ ] All completed items demonstrated
- [ ] Stakeholder feedback captured in `review/feedback.md`
- [ ] Items not completed returned to program backlog
- [ ] Demo script prepared and rehearsed
- [ ] Metrics presented (velocity, quality, burndown)

---

## Sprint Retrospective Checklist

- [ ] Retrospective held (max 1 hour)
- [ ] Three categories discussed: What went well, What to improve, What to try
- [ ] Action items documented in `retrospective/action-items.md`
- [ ] Lessons learned recorded in `retrospective/lessons.md`
- [ ] Top 1–2 improvements selected for next sprint
- [ ] Action items assigned owners and due dates

---

## Usage

To create a new sprint:

1. Copy this template directory as `sprint-<N+1>/`
2. Update `README.md` with sprint-specific information
3. Populate `plan/` during sprint planning
4. Fill `execution/` daily throughout the sprint
5. Complete `review/` and `retrospective/` at sprint end
6. Archive sprint directory upon sign-off
