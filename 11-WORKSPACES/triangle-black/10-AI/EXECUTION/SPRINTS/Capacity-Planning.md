# Capacity Planning

## Overview

Capacity planning determines how much work AI agents can reliably complete within a sprint. Unlike velocity (which measures historical output in story points), capacity planning focuses on available agent-hours and allocation across task types. Capacity planning ensures that sprint commitments are realistic given the number of agents, their domain specializations, and the unavoidable overhead of execution.

## How to Calculate Available AI Agent Capacity

### Step 1: Determine Gross Agent Capacity

```
Gross Agent Capacity = Number of Available Agents × Sprint Working Hours per Agent
```

**Sprint Working Hours** for a standard 2-week sprint (10 working days):

| Parameter | Value |
|---|---|
| Sprint duration | 10 working days |
| Working hours per day | 6 hours (standard) |
| **Gross hours per agent per sprint** | **60 hours** |

**Why 6 hours per day?** AI agents require time for context loading, environment interactions, quality gate execution, and coordination. The 6-hour working day accounts for realistic productive execution time, not wall-clock time.

### Step 2: Subtract Overhead

```
Net Agent Capacity = Gross Agent Capacity - Overhead Hours
```

**Overhead categories:**

| Overhead Type | Hours per Sprint | Description |
|---|---|---|
| Context Loading | 3 | Daily context refresh, sprint backlog review, environment status checks |
| Review & Quality Gates | 4 | Automated and manual review cycles, waiting for gate results |
| Documentation | 3 | Writing inline docs, updating API specs, maintaining context pack |
| Communication | 2 | Progress reports, dependency coordination, blocker documentation |
| Sprint Events | 3 | Sprint Planning (2h), Sprint Review (1h), Retrospective (minimum — scales with sprint length) |
| **Total Overhead** | **15 hours** | **25% of gross capacity** |

```
60 hours (gross) - 15 hours (overhead) = 45 hours (net)
```

### Step 3: Apply to Team

| Number of Agents | Gross Capacity | Overhead (total) | Net Capacity |
|---|---|---|---|
| 1 | 60h | 15h | 45h |
| 2 | 120h | 30h | 90h |
| 3 | 180h | 45h | 135h |
| 4 | 240h | 60h | 180h |
| 5 | 300h | 75h | 225h |

Note: Overhead does not scale perfectly linearly. Some overhead (sprint events, context pack maintenance) is shared. For teams of 3+ agents, an efficiency factor of 0.95 is applied to account for coordination overhead:

```
Net Capacity (adjusted) = Net Capacity × 0.95 (for 3+ agents)
```

### Example: 4-Agent Team

```
Gross: 4 agents × 60h = 240h
Overhead: 4 agents × 15h = 60h
Net: 240h - 60h = 180h
Adjustment (3+ agents): 180h × 0.95 = 171h
```

**Available capacity: 171 hours for task execution.**

## Agent Capacity Allocation per Task Type

Not all agents can work on all task types. Agents have domain specializations that affect both eligibility and efficiency.

| Task Type | Eligible Agents | Efficiency Factor | Notes |
|---|---|---|---|
| Feature Development | All agents | 1.0 | Standard work; all agents are capable |
| Bug Fixing | All agents (triage by domain) | 0.9 | Investigation overhead reduces efficiency |
| Infrastructure & DevOps | Infrastructure-specialized agents | 1.0 | Specialist domain; non-specialized agents have 0.5 efficiency |
| Documentation | All agents | 1.2 | Generally faster to produce than code |
| Code Review | All agents | 1.0 | Included in overhead; tracked separately if extensive |
| Architecture & Design | Senior/specialist agents | 0.7 | Design work requires more research and deliberation |
| Testing (manual/exploratory) | QA-specialized agents, or all | 0.8 | Exploratory testing is less predictable |

**Efficiency Factor**: Multiply net capacity by this factor when allocating to a specific task type. For example, a feature development task estimated at 8 hours uses 8 hours of capacity. An infrastructure task estimated at 8 hours uses `8 / 1.0 = 8h` for a specialist but `8 / 0.5 = 16h` of capacity for a non-specialist.

## Parallel vs. Sequential Agent Execution

### Parallel Execution

Multiple agents work on different tasks simultaneously. This is the default mode.

**Maximum parallelism** occurs when agents work on independent tasks with no shared dependencies. In practice, parallelism is limited by:

1. **Dependency chain depth** — Tasks that must be done sequentially constrain parallel execution.
2. **Shared resources** — Single shared resource (e.g., a database schema, an API endpoint) can only be modified by one agent at a time.
3. **Coordination overhead** — As more agents work in parallel, communication and conflict resolution overhead increases.

**Rule of thumb**: Effective parallel agent count is `min(available agents, independent work streams × 2)`.

### Sequential Execution

Some tasks must be executed sequentially due to hard dependencies:

```
Task A (Agent 1) → Task B (Agent 2) → Task C (Agent 3)
                    ↑
              Agent 2 cannot start until Task A is done.
```

Sequential execution significantly impacts sprint capacity because downstream agents may idle while waiting for upstream tasks.

### Hybrid Execution

Most sprints use a hybrid model: agents work in parallel on independent work streams, with carefully managed sequential handoffs for dependent tasks.

```
Work Stream 1: Agent 1 (Task A) → Agent 1 (Task B) → Agent 1 (Task C)
Work Stream 2: Agent 2 (Task D) → Agent 2 (Task E) → Agent 2 (Task F)
Work Stream 3: Agent 3 (Task G, depends on A) → Agent 3 (Task H)
Work Stream 4: Agent 4 (Task I, depends on D) → Agent 4 (Task J)
```

## Capacity Allocation Template

```
Sprint [N] — Capacity Plan

Team Size: [N] agents
Gross Capacity: [N] hours
Net Capacity: [N] hours (after overhead)
Adjusted Capacity: [N] hours (after efficiency/coordination factor)

Agent Assignments:
| Agent | Specialization | Allocated Hours | Tasks | Notes |
|-------|----------------|----------------|-------|-------|
| Agent 1 | Full-stack | 40h | T-001, T-002, T-003 | Includes buffer |
| Agent 2 | Backend/API | 35h | T-004, T-005 | Dependent on Agent 1's T-001 |
| Agent 3 | Infrastructure | 20h | T-006 | Part-time this sprint |
| Agent 4 | QA | 25h | T-007, T-008 | Testing across streams |

Dependency Chain:
  Agent 1 (T-001) → Agent 2 (T-004)
  Agent 2 (T-005) → Agent 4 (T-008)

Risk Assessment:
  - Agent 2 has 5h of idle risk if Agent 1's T-001 is delayed.
  - Mitigation: Agent 2 has low-priority fill-in tasks.
```

## Bottleneck Identification

Bottlenecks reduce effective sprint capacity even when total capacity appears adequate. Common bottlenecks in AI agent execution:

| Bottleneck | Symptom | Resolution |
|---|---|---|
| **Single-agent dependency hub** | One agent is the dependency provider for multiple downstream tasks | Decompose the hub agent's work; assign simpler dependencies to other agents; redesign the dependency graph |
| **Specialist overload** | A specialized agent (e.g., infrastructure) has more tasks than available capacity | Cross-train another agent; reduce specialist work this sprint; pre-invest in infrastructure before the sprint |
| **Shared resource contention** | Multiple agents waiting for the same environment, database, or service | Provision parallel environments; stagger agent work on shared resources; use feature flags and branch isolation |
| **Quality gate queue** | Agents waiting for pipeline runners or gate results | Scale CI/CD infrastructure; parallelize gate execution; reduce gate trigger frequency |
| **Context switching** | Agent frequently interrupted by unplanned work, escalations, or context pack updates | Protect agent execution blocks; minimize mid-sprint priority changes; batch context pack updates |

### Bottleneck Analysis Sprint Template

After each sprint, review:

1. Did any agent have idle time waiting for dependencies?
2. Did any agent have more work than could be completed?
3. Were there pipeline or environment queue delays?
4. How much unplanned work consumed agent capacity?
5. What was the actual vs. planned allocation by task type?

Answers inform adjustments to the next sprint's capacity plan.

## Capacity Planning Rules

1. **Never allocate 100% of net capacity.** Always leave 10-15% unallocated for unexpected work and mid-sprint adjustments.
2. **Overhead is not negotiable.** Context loading, review, documentation, and communication are mandatory activities. Do not reduce overhead to fit more tasks.
3. **Use efficiency factors for specialist tasks.** Allocating a non-specialist agent to a specialist task consumes more capacity than estimated (lower efficiency).
4. **Account for dependency idle time.** Downstream agents will have idle time if their dependency providers are delayed. Build this into the plan.
5. **Revisit capacity every sprint.** Agent availability, specialization, and environmental factors change. Do not carry the same capacity plan across multiple sprints.
