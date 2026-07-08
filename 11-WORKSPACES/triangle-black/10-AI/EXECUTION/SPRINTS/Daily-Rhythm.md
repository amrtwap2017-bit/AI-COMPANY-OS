# Daily Rhythm

## Overview

The daily rhythm defines the structured cadence that AI agents follow during a sprint. Unlike human teams, AI agents do not require standup meetings — progress is tracked automatically through task system updates and quality gate results. The daily rhythm optimizes for consistent output, predictable reporting, and rapid issue detection.

**AI agents operate asynchronously within this rhythm.** There is no required synchronization point; agents execute their cycles independently and report results at defined checkpoints.

## Daily Cadence

```
Morning (Start)
    |
    v
Task Execution Block 1 (~2 hours)
    |
    v
Midday Checkpoint (automated)
    |
    v
Task Execution Block 2 (~2 hours)
    |
    v
End-of-Day Deliverable Submission
    |
    v
Progress Reporting (automated)
    |
    v
End
```

### 1. Morning Context Refresh (15 minutes equivalent)

Each agent begins its day by loading the latest execution context:

- Pull the latest context pack from version control.
- Read any new stakeholder communications or specification clarifications.
- Review dependency status updates from other agents.
- Check for changes to the sprint backlog (descoping, re-prioritization).
- Load the next task from the agent's queue.

### 2. Task Execution Block 1 (2 hours)

- Focused execution of the first task block.
- Follow the execution flow: context → execute → quality gates → submission.
- Commit intermediate work to feature branches.
- If blocked within 30 minutes, raise a blocker signal immediately.

### 3. Midday Checkpoint (automated, 5 minutes equivalent)

An automated checkpoint occurs mid-day. Each agent:

- Reports current task status (Backlog, In Progress, Quality Gate, Deliverable, Done).
- Logs any blockers or risks identified during execution.
- Provides a brief (1-2 sentence) summary of progress.
- The Program Manager AI reviews all checkpoint reports, identifies cross-agent risks, and takes action on escalations.

This replaces the traditional human standup meeting. No synchronous meeting is required.

### 4. Task Execution Block 2 (2 hours)

- Second focused execution block.
- Continue or start the next task.
- Address any feedback from the midday checkpoint.

### 5. End-of-Day Deliverable Submission

By the end of the day, each agent:

- Submits all completed deliverables (commits, artifacts, documents).
- Passes all applicable quality gates.
- Updates the task tracking system to reflect end-of-day status.
- Commits any in-progress work to a feature branch with a descriptive status comment.
- Branches must compile and pass lint — no broken branches at end of day.

### 6. Progress Reporting (automated)

An end-of-day report is generated automatically for each agent:

```
Agent: [Agent Name]
Date: [YYYY-MM-DD]
Tasks Completed: [N]
Tasks In Progress: [N]
Tasks Blocked: [N]
Blockers: [List or "None"]
Summary: [2-3 sentence summary of today's accomplishments and tomorrow's plan]
```

The Program Manager AI reviews all end-of-day reports and compiles a sprint progress dashboard.

## Human Intervention Triggers

Although the daily rhythm is automated, human stakeholders may be notified or involved in the following situations:

| Trigger | Action | Response Time |
|---|---|---|
| **Blocker raised** and Program Manager AI cannot resolve | Human stakeholder notified for decision | Within 1 hour of escalation |
| **Quality gate failure repeated** (3+ failures on same task) | Human code review requested | Next business day |
| **Sprint goal at risk** (task delays cascade to goal) | Stakeholder brief with options | Immediate notification |
| **Security vulnerability discovered** | Human security team notified per incident response plan | Per severity SLA |
| **New or changed requirement** during sprint | Human stakeholder must confirm before sprint backlog is modified | Within 4 hours |

## Non-Working Periods

AI agents can operate continuously (24/7) within execution environment constraints. However, the following periods are observed:

- **Environment maintenance windows** — Scheduled downtime for CI/CD platform, cloud infrastructure, or tooling updates. Communicated at least 24 hours in advance.
- **Sprint boundary** — The period between sprint end and next sprint planning (typically 2-4 hours) is reserved for metrics finalization, retrospective, and planning. No execution work occurs during this boundary.

## Coordination Across Time Zones

If human stakeholders span multiple time zones:

- All automated reports are timestamped in UTC.
- Human intervention triggers respect stakeholder working hours unless severity SLAs require immediate escalation.
- The midday checkpoint report serves as the primary asynchronous handoff between stakeholders in different regions.
