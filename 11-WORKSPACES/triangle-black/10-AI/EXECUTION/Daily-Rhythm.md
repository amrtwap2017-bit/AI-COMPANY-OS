# Daily Execution Rhythm

## Overview

The daily rhythm defines how an AI-augmented team operates within a sprint. It structures each day into predictable segments with clear checkpoints, coordination points, and escalation paths. This rhythm ensures consistent progress, early detection of issues, and continuous alignment.

---

## Daily Schedule

| Time (Local) | Activity | Duration | Participants |
|-------------|----------|----------|-------------|
| 08:00–08:15 | Daily Sync | 15 min | All team members |
| 08:15–09:00 | Context refresh / planning | 45 min | Individual (async) |
| 09:00–12:00 | Execution block 1 | 3 hours | Individual + agent work |
| 12:00–13:00 | Lunch | 1 hour | — |
| 13:00–15:00 | Execution block 2 | 2 hours | Individual + agent work |
| 15:00–15:30 | Coordination point | 30 min | All team members |
| 15:30–17:00 | Execution block 3 | 1.5 hours | Individual + agent work |
| 17:00–17:15 | End-of-day log | 15 min | Individual |

---

## Task Progression by Pipeline Stage

### Stage 1: Context & Requirements

```
Morning sync → Review context → Confirm requirements → Assign to agents
```

- **Agent activity**: Load reference docs, parse requirements, identify ambiguities
- **Human activity**: Clarify requirements, provide examples, approve approach
- **Checkpoint**: Requirements confirmed before 09:30 (end of context refresh)
- **Exit criteria**: Agent has unambiguous task definition with acceptance criteria

### Stage 2: Design & Planning

```
Receive requirements → Propose design → Human review → Finalize plan
```

- **Agent activity**: Generate design proposal, identify dependencies, estimate effort
- **Human activity**: Review design, suggest alternatives, approve direction
- **Checkpoint**: Design approved before end of execution block 1
- **Exit criteria**: Design document with implementation plan reviewed and approved

### Stage 3: Implementation

```
Design approved → Code generation → Self-review → Peer review → Merge
```

- **Agent activity**: Write code, run linters, execute tests, create documentation
- **Human activity**: Review agent output, provide feedback, approve merge
- **Checkpoint**: Code submitted for review by end of execution block 2
- **Exit criteria**: Code merged with passing tests and documentation

### Stage 4: Testing & Quality

```
Code merged → Automated tests → Integration tests → Quality gate → Signed off
```

- **Agent activity**: Generate test cases, execute test suites, report coverage
- **Human activity**: Review test results, validate edge cases, sign off
- **Checkpoint**: Quality gate passed before end of execution block 3
- **Exit criteria**: All quality gates green, artifact ready for review

### Stage 5: Review & Deploy

```
Quality passed → Demo preparation → Stakeholder review → Deploy → Done
```

- **Agent activity**: Prepare demo artifacts, generate release notes
- **Human activity**: Demonstrate work, collect feedback, approve deployment
- **Checkpoint**: Demo ready for next day's review (if applicable)
- **Exit criteria**: Artifact deployed, feedback documented, item marked Done

---

## Coordination Points

### 08:00 Daily Sync

Structured 15-minute standup. Each participant answers:

1. What did I/we complete yesterday?
2. What will I/we work on today?
3. Are there any blockers or impediments?

Agents report their status through the task board. If an agent cannot attend the sync, its status is provided via log.

### 15:00 Coordination Point

Mid-afternoon check focused on problem-solving:

- Review blockers identified during the day
- Cross-agent coordination decisions
- Impromptu design discussions (timeboxed to 15 min)
- Re-prioritization if scope changes arise
- Escalation of items requiring ADL intervention

---

## Escalation Handling

| Level | Description | Response Time | Escalation Path |
|-------|-------------|---------------|-----------------|
| L1 | Task-level blocker (agent stuck) | < 1 hour | Agent → TAL |
| L2 | Technical blocker (design conflict) | < 2 hours | TAL → ADL |
| L3 | Process blocker (priority conflict) | < 4 hours | ADL → Team |
| L4 | Stakeholder blocker (scope change) | < 1 day | ADL → Stakeholder |

### Escalation Protocol

1. Agent encounters blocker, logs it with description and impact
2. If self-resolvable within 30 min, agent attempts resolution
3. If unresolved, blocker is flagged at next coordination point
4. TAL triages and routes to appropriate resolver
5. If unresolved by EOD, ADL escalates externally
6. All escalations are logged in `execution/daily-logs/` with resolution status

---

## Progress Tracking

### Task Board States

| State | Description | Color |
|-------|-------------|-------|
| Backlog | Not yet started | Gray |
| In Progress | Assigned and being worked | Blue |
| In Review | Awaiting human or peer review | Yellow |
| Blocked | Cannot proceed; blocker logged | Red |
| Done | Meets Definition of Done | Green |

### Daily Metrics

Tracked at each coordination point:

- **Tasks remaining**: Backlog + In Progress + In Review + Blocked
- **Tasks completed**: Done items (cumulative)
- **Blocker count**: Items in Blocked state
- **Velocity trend**: Points completed vs. expected (burndown)

### Burndown Tracking

- X-axis: Sprint days
- Y-axis: Remaining effort (story points)
- Ideal line: Linear decrease from total to zero
- Actual line: Daily remaining effort
- Deviation: Actual above ideal = behind schedule

---

## Agent Communication Guidelines

- Agents report status via structured log entries (not freeform text)
- All agent outputs include confidence score (1–10)
- Agents flag uncertainty immediately rather than proceeding with assumptions
- Agents request clarification using a standardized template
- Cross-agent handoffs include context summary and current state

---

## Human-Agent Interaction Norms

- Humans review agent output before it enters Done state
- Humans provide feedback in clear, actionable language
- Humans do not override agent decisions without documenting rationale
- Agents defer to humans on ambiguous, high-risk, or policy decisions
- Both humans and agents log their decisions with reasoning

---

## End-of-Day Procedure

1. All agents log completed tasks in daily log
2. Task board updated to reflect end-of-day state
3. Blockers summary sent to ADL
4. Burndown chart updated
5. Next day's priorities identified
6. Any urgent escalations communicated before close
