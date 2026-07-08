# Sprint Execution

## Overview

Sprint Execution is the core working phase of the sprint. AI agents execute tasks from the sprint backlog, progressing through defined pipeline stages while maintaining quality gates and coordinating on dependencies. Execution is disciplined, automated, and transparent.

**Duration: Remainder of sprint after planning, typically 9 working days for a 2-week sprint.**

## Daily Execution Flow

Each AI agent follows a standardized daily execution cycle:

```
┌─────────────────────────────────────────────────────────┐
│                    Start of Day                          │
│  ┌──────────────┐                                       │
│  │ Context      │ Load latest context pack, sprint       │
│  │ Loading      │ backlog, task details, dependencies    │
│  └──────┬───────┘                                       │
│         v                                                │
│  ┌──────────────┐                                       │
│  │ Task         │ Execute assigned task: research,       │
│  │ Execution    │ code, write tests, create docs         │
│  └──────┬───────┘                                       │
│         v                                                │
│  ┌──────────────┐                                       │
│  │ Quality      │ Run automated gates: lint, type-check, │
│  │ Gates        │ unit test, integration test, security  │
│  └──────┬───────┘                                       │
│         v                                                │
│  ┌──────────────┐                                       │
│  │ Deliverable  │ Commit, push, submit artifact, mark    │
│  │ Submission   │ task complete in tracking system       │
│  └──────┬───────┘                                       │
│         v                                                │
│  ┌──────────────┐                                       │
│  │ Next Task    │ Pull next task from backlog, signal    │
│  │ Selection    │ readiness, begin cycle again           │
│  └──────────────┘                                       │
│                    End of Day                             │
└─────────────────────────────────────────────────────────┘
```

### Step 1: Context Loading
- Load the current context pack (architecture, dependencies, environment status).
- Load the sprint backlog filtered to the agent's assigned tasks.
- Load the specific task's details: description, acceptance criteria, quality gates, dependencies.
- Check dependency status: are upstream tasks complete? Are any blockers active?
- Check for any mid-sprint communications, specification clarifications, or stakeholder feedback.

### Step 2: Task Execution
- Execute the assigned task according to its acceptance criteria and technical approach.
- Follow coding standards, documentation conventions, and testing requirements defined in the team operating agreement.
- Commit intermediate work to feature branches. Use small, focused commits with descriptive messages.
- If the task scope expands beyond the estimated effort, pause and notify the Program Manager AI. Do not continue beyond the estimated effort without approval.

### Step 3: Quality Gates
Each task must pass the following quality gates before its deliverable is considered complete:

| Gate | Tool/Method | Required |
|---|---|---|
| **Lint** | Automated linter configured per language | 0 errors, 0 warnings (or documented exceptions) |
| **Type Check** | Static type checker | Strict mode, no errors |
| **Unit Test** | Test framework per language | 100% of new code covered; existing coverage must not decrease |
| **Integration Test** | Integration test suite | All integration tests passing |
| **Security Scan** | SAST/SCA tools | 0 critical/high findings; medium findings documented |
| **Documentation Check** | Doc generator or manual review | All public APIs, configurations, and changes documented |

A task that fails a quality gate returns to Task Execution for remediation. The agent fixes the issue and re-runs the gate. There is no limit on iterations, but excessive iterations (3+) trigger a review.

### Step 4: Deliverable Submission
- Commit the final code and push to the remote repository.
- Submit the deliverable artifact (build artifact, configuration change, document, etc.) to the designated location.
- Mark the task as complete in the sprint tracking system, linking to the commit, artifact, and quality gate results.
- If the task produces a deployable change, trigger the CI/CD pipeline for the affected environment.

### Step 5: Next Task Selection
- Update the agent's personal task queue.
- Signal readiness to the Program Manager AI.
- Pull the next assigned task from the sprint backlog.
- If no tasks remain, report idle capacity.

## Task Progression by Pipeline Stage

Tasks flow through the sprint backlog pipeline:

```
Backlog → In Progress → Quality Gate → Deliverable → Done
                                       → Failed → In Progress (rework)
```

- **Backlog**: Task is planned but not started.
- **In Progress**: Agent is actively working on the task.
- **Quality Gate**: Agent has submitted the work for automated quality checks.
- **Deliverable**: Quality gates passed; deliverable is being submitted.
- **Done**: Deliverable submitted and accepted.
- **Failed**: Quality gate failure; task returns to In Progress.

## Coordination Between Parallel AI Agents

When multiple AI agents execute tasks in parallel, coordination is managed through:

1. **Dependency Graph** — Defined during Sprint Planning. Agents check dependency status before starting each task.
2. **Shared Artifacts** — Agents publish shared artifacts (interfaces, data models, service endpoints) to a known location. Any agent consuming these artifacts pulls the latest version.
3. **Communication Protocol** — Agents communicate through structured channels (issue tracker, shared document, or messaging). Communication is asynchronous by default; synchronous coordination is used only for blocker resolution.
4. **Conflict Prevention** — Agents do not modify the same file simultaneously. File ownership is assigned during planning. If a file must be modified by multiple agents, it is split or sequentially scheduled.

## Dependency Resolution

| Dependency Type | Resolution Strategy |
|---|---|
| **Hard dependency** — task B requires task A's output | Task B does not start until Task A is in Deliverable or Done status |
| **Soft dependency** — task B would benefit from task A's output but can start with a placeholder | Task B starts with a placeholder; Task A's output replaces it when available |
| **External dependency** — requires human approval, third-party service, or outside team | Program Manager AI escalates and tracks; task may be postponed or worked around |
| **Circular dependency** — tasks A and B each require the other | Re-plan: merge tasks, split differently, or break the cycle by introducing a shared interface |

## Blocked Task Handling

1. **Automatic Detection** — An agent that has been in In Progress status for 4+ hours without progressing to Quality Gate is flagged as potentially blocked.
2. **Blocker Signal** — The agent raises a blocker ticket with: task ID, description of block, attempted resolutions, suggested unblock path.
3. **Program Manager AI Response** — The Program Manager AI triages within 30 minutes of the blocker signal.
4. **Resolution Options**:
   - Provide additional context or clarification.
   - Reassign the task to a different agent.
   - Split the task to bypass the blocked portion.
   - Escalate to human stakeholders for decisions.
   - Descope the task (if the blocker is unresolvable within the sprint).
5. **Documentation** — All blockers and their resolutions are logged in the sprint retrospective input.

## Execution Rules

1. **No work outside the sprint backlog.** Agents execute only tasks in the sprint backlog. Unplanned work is deferred or, if critical, escalated to the Program Manager AI for a descoping decision.
2. **Estimate deviations must be escalated.** If a task exceeds 125% of its estimated effort, the agent pauses, notifies the Program Manager AI, and awaits direction.
3. **Quality gates are mandatory.** No task is considered complete until all applicable quality gates pass.
4. **End-of-day submission.** By the end of each day, all completed tasks must have deliverables submitted and tracking updated. Partial work is committed to a feature branch with a clear status comment.
