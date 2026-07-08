# Sprint Lifecycle

## Overview

The sprint lifecycle is a five-phase closed-loop cycle. Each phase has defined inputs, activities, outputs, participants, and duration. The cycle repeats back-to-back with improvement actions carried forward between sprints.

---

## Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    SPRINT LIFECYCLE                      │
│                                                          │
│  ┌──────────┐    ┌───────────┐    ┌────────┐           │
│  │ PLANNING │───▶│ EXECUTION │───▶│ REVIEW │           │
│  └──────────┘    └───────────┘    └────────┘           │
│       │                              │                  │
│       │                              ▼                  │
│       │                      ┌──────────────┐          │
│       │                      │ RETROSPECTIVE│          │
│       │                      └──────────────┘          │
│       │                              │                  │
│       │                              ▼                  │
│       │                      ┌──────────────┐          │
│       └──────────────────────│ IMPROVEMENT  │──────────│
│                              └──────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Planning

### Purpose
Define what the team will deliver in the sprint and how it will be achieved.

### Inputs
- Program backlog (prioritized and refined)
- Sprint capacity (team availability)
- Previous sprint velocity
- Definition of Ready checklist
- Stakeholder priorities and constraints

### Activities

| Activity | Description | Facilitator |
|----------|-------------|-------------|
| Goal setting | Define single measurable sprint goal | ADL |
| Capacity calculation | Calculate available person-days | ADL |
| Backlog selection | Select items matching capacity | Team |
| Task breakdown | Break items into tasks (≤1 day each) | TAL + Agents |
| Assignment | Assign tasks to agents and humans | ADL + TAL |
| Dependency check | Identify cross-task dependencies | TAL |
| Risk assessment | Document risks and mitigations | Team |
| Commitment | Team commits to the sprint goal | ADL |

### Outputs
- Sprint goal (documented in `plan/sprint-goal.md`)
- Sprint backlog (`plan/backlog.md`)
- Capacity plan (`plan/capacity.md`)
- Risk register (`plan/risks.md`)
- Sprint README initialized

### Participants
- AI Delivery Lead (facilitator)
- Technical Agent Lead
- Domain Expert
- Quality Steward
- Agents (as needed for estimation)

### Duration
- 2-week sprint: 4 hours
- 1-week sprint: 2 hours
- Does not exceed 4 hours regardless of sprint length

---

## Phase 2: Execution

### Purpose
Complete the backlog items agreed in planning, producing a done increment by sprint end.

### Inputs
- Sprint backlog with tasks
- Reference materials and context
- Tooling and automation pipelines
- Definition of Done criteria

### Activities

| Activity | Frequency | Description |
|----------|-----------|-------------|
| Daily sync | Daily | Status update, blocker identification |
| Task execution | Continuous | Agent/human work on backlog items |
| Task board update | Ongoing | Progress reflection in real time |
| Coordination point | Daily | Cross-agent alignment, problem solving |
| Quality checks | Per item | Tests, linting, reviews before merge |
| Escalation handling | As needed | Blocker resolution via escalation levels |
| Backlog refinement | Mid-sprint | Refine upcoming items for next sprint |

### Outputs
- Completed backlog items (meeting DoD)
- Updated task board
- Daily logs (`execution/daily-logs/`)
- Burndown chart (`metrics/burndown.md`)
- Quality reports
- Refined program backlog

### Participants
- All team members (daily)
- ADL (facilitator, blocker removal)
- TAL (technical coordination)
- Agents (primary execution)
- Domain Expert (clarification, review)
- Quality Steward (gate enforcement)

### Duration
- Remaining sprint days after planning and before review/retro

---

## Phase 3: Review

### Purpose
Inspect the increment, gather feedback from stakeholders, and update the program backlog.

### Inputs
- Completed items (meeting DoD)
- Demo environment or artifacts
- Sprint metrics (velocity, quality, burndown)
- Stakeholder availability

### Activities

| Activity | Description | Duration |
|----------|-------------|----------|
| Goal review | Restate sprint goal and whether it was met | 5 min |
| Demo walkthrough | Demonstrate completed items one by one | 30–60 min |
| Stakeholder feedback | Collect structured feedback on each demo | 15–30 min |
| Metrics review | Present velocity, quality, burndown data | 10 min |
| Backlog update | Add new items, reprioritize based on feedback | 10 min |
| Planning preview | Brief look ahead to next sprint | 5 min |

### Outputs
- Stakeholder feedback (documented in `review/feedback.md`)
- Updated program backlog with new priorities
- Completed items summary (`review/completed-items.md`)
- Demo recording or script (`review/demo-script.md`)

### Participants
- AI Delivery Lead (facilitator)
- Technical Agent Lead
- Domain Expert
- Quality Steward
- Stakeholders (required)
- Agents (as needed for demo)

### Duration
- 1 hour per week of sprint length (e.g., 2-hour review for 2-week sprint)
- Max 2 hours

---

## Phase 4: Retrospective

### Purpose
Inspect the team's process and identify improvements for the next sprint.

### Inputs
- Sprint metrics
- Daily logs and task board history
- Escalation records
- Lessons learned log
- Previous sprint's action items

### Activities

| Activity | Description | Duration |
|----------|-------------|----------|
| Set the stage | Review agenda, establish safe environment | 5 min |
| Gather data | Collect observations: what went well, what to improve | 15 min |
| Generate insights | Analyze root causes of notable events | 15 min |
| Decide actions | Select 1–2 actionable improvements | 15 min |
| Close | Summarize, assign owners, document | 10 min |

### Formats (rotating)

The team rotates through retrospective formats each sprint:

1. **Start/Stop/Continue**: What to start doing, stop doing, continue doing
2. **Glad/Sad/Mad**: Emotional response categorization
3. **Sailboat**: What propels us forward (wind), what holds us back (anchor), risks (rocks)
4. **4Ls**: Liked, Learned, Lacked, Longed For
5. **Mad/Sad/Glad**: Focused on emotional reactions to events

### Outputs
- Action items (`retrospective/action-items.md`)
- Lessons learned (`retrospective/lessons.md`)
- Retrospective notes (`retrospective/retro-notes.md`)

### Participants
- AI Delivery Lead (facilitator)
- Technical Agent Lead
- Domain Expert
- Quality Steward
- Agents (as applicable)
- Stakeholders (optional, by invitation)

### Duration
- 1 hour (fixed; not prorated by sprint length)

---

## Phase 5: Improvement

### Purpose
Implement the process improvements identified in the retrospective before the next sprint begins.

### Inputs
- Retrospective action items (assigned, with due dates)

### Activities

| Activity | Description | Owner |
|----------|-------------|-------|
| Action implementation | Complete agreed process changes | Assigned owner |
| Tooling updates | Modify configurations, templates, automations | TAL |
| Documentation updates | Update EADF docs, prompts, patterns | ADL |
| Validation | Verify improvement achieves intended effect | ADL + QS |
| Communication | Announce changes to team and stakeholders | ADL |

### Outputs
- Implemented process changes
- Updated documentation and tooling
- Improvement validation report

### Participants
- AI Delivery Lead (tracker)
- Technical Agent Lead
- Quality Steward
- All team members (as assigned)

### Duration
- Continuous through the next sprint's planning phase
- Majority of work completed within 2 days of retrospective

---

## Phase Transitions

| Transition | Trigger | Key Artifact | Approval |
|------------|---------|-------------|----------|
| Planning → Execution | Sprint goal committed, backlog selected | Sprint backlog | Team commitment |
| Execution → Review | End of sprint (timebox) | Completed items list | ADL |
| Review → Retrospective | Review completed, feedback collected | Feedback log | ADL |
| Retrospective → Improvement | Retro completed, actions identified | Action items | Team agreement |
| Improvement → Next Planning | Improvement actions in progress | Updated process | ADL |

---

## Escalations During Lifecycle

| Phase | Typical Escalations | Response |
|-------|---------------------|----------|
| Planning | Scope disagreement, capacity constraint | ADL mediates, stakeholder input if needed |
| Execution | Technical blockers, dependency delays | TAL triages, ADL escalates externally |
| Review | Stakeholder dissatisfaction, missed goals | Document feedback, adjust backlog |
| Retrospective | Team conflict, process friction | ADL facilitates, escalate to management if needed |
| Improvement | Resistance to change, tooling limitations | ADL advocates, adjusts approach |

---

## Continuous Improvement Loop

Each sprint's improvement actions feed into the next sprint's planning phase, creating a continuous improvement loop:

1. Sprint N Improvement Actions → Sprint N+1 Planning
2. Sprint N+1 Execution applies improvements
3. Sprint N+1 Retrospective identifies next improvements
4. Repeat

This ensures the team's process evolves every sprint based on empirical evidence.
