# Session Rules

> Rules for every AI agent session: initialization, context loading, execution, output validation, and session logging.

## Session Lifecycle

```
INIT → LOAD → EXECUTE → VALIDATE → DELIVER → LOG
```

## Phase 1: Session Initialization

### Pre-Conditions
- The agent has been assigned a task by Program Manager AI
- A context packet has been prepared
- The agent has the necessary authority level for the task
- Previous dependencies (if any) are complete

### Initialization Steps

```
1. AGENT WAKES: Agent receives activation signal from Program Manager AI
2. IDENTITY LOADED: Agent loads its role definition, authority level, and constraints
3. TASK ASSIGNED: Agent receives task ID and description
4. DEADLINE CONFIRMED: Agent acknowledges task deadline
5. CONFIGURATION: Agent loads operational configuration (model, temperature, output format)
6. READY SIGNAL: Agent signals readiness to begin
```

### Initialization Checks

| Check | Description | Failure Action |
|-------|-------------|----------------|
| Role available | Agent role is defined in MASTER-CONTEXT.md | Cannot proceed; escalate |
| Authority valid | Task is within agent's authority level | Cannot proceed; escalate |
| Dependencies met | All predecessor tasks are complete | Wait; poll every 15 minutes |
| Context available | Context packet exists and is accessible | Wait; request from Program Manager AI |
| Tools accessible | Required tools are available | Cannot proceed; escalate |
| Quality gates known | Agent knows which gates apply | Cannot proceed; escalate |

## Phase 2: Context Loading

The agent loads context in the defined sequence (see `Memory-Strategy.md`):

```
1. Global Memory
   - AI Constitution (immutable)
   - Enterprise Principles
   - Architecture Baseline

2. Standards
   - Naming Standards
   - Documentation Standards
   - Coding Standards

3. Domain Context
   - Business Rules (relevant subset)
   - Entity Definitions
   - Domain Model

4. Architecture Context
   - Relevant ADRs
   - API Contracts
   - Database Schema

5. Sprint Context
   - Sprint Goal
   - Definition of Done
   - Sprint Backlog

6. Task Context
   - Task ID
   - Acceptance Criteria
   - Dependencies

7. Knowledge Base
   - Relevant Patterns
   - Lessons Learned
   - Troubleshooting Guides

8. Previous Session (if resuming)
   - Last Session Summary
   - Open Items
```

### Context Loading Rules
1. All 8 steps must be completed before execution begins
2. If a step fails (document not found, inaccessible), the agent logs the issue and continues
3. Missing context items are flagged in the session log
4. The agent may not begin execution until step 6 (Task Context) is loaded

## Phase 3: Execution

### Execution Principles
1. **Follow the task** — Do exactly what the task specifies; no more, no less
2. **Stay in scope** — Do not work outside the defined scope boundaries
3. **Reference authority** — All decisions must cite their authority source
4. **Flag issues early** — If something is wrong, flag it immediately
5. **No speculation** — Do not invent requirements, constraints, or solutions

### Execution Constraints

| Constraint | Description |
|------------|-------------|
| Scope boundary | Agent must not exceed the in-scope/out-of-scope defined in the task |
| Authority boundary | Agent must not make decisions beyond its authority level |
| Time boundary | Agent must complete within the allocated time budget |
| Resource boundary | Agent must not consume more than allocated compute resources |
| Quality boundary | Agent must meet all applicable quality gate criteria |

### Execution Monitoring

The agent self-monitors during execution:
- **Progress check** — Every 25% of execution, the agent verifies it is on track
- **Scope check** — Continuous; flag any deviation from scope immediately
- **Quality check** — Continuous; flag any quality concerns as they arise
- **Time check** — At 75% execution time, assess if completion is feasible

### Interrupt Handling

| Interrupt Type | Action |
|----------------|--------|
| New information arrives | Assess relevance; if task-affecting, pause and evaluate |
| Priority change received | Pause; await re-prioritization instructions |
| Dependency becomes available | If blocking dependency, resume blocked work |
| Quality gate failure detected | Pause execution; resolve or escalate |
| Time budget nearly exhausted | Prioritize completion; flag incomplete items |

## Phase 4: Output Validation

### Self-Validation Checklist

Before delivering any output, the agent must self-validate:

```markdown
## Output Validation

### Completeness
- [ ] All acceptance criteria are addressed
- [ ] All required artifacts are produced
- [ ] All required metadata is included
- [ ] All traceability links are established

### Correctness
- [ ] Output matches task requirements
- [ ] Output stays within defined scope
- [ ] No contradictions or inconsistencies
- [ ] All references are valid

### Quality
- [ ] Output format matches specification
- [ ] Naming conventions are followed
- [ ] All quality gate requirements are met
- [ ] No known issues or defects

### Compliance
- [ ] Enterprise Principles are respected
- [ ] AI Constitution is followed
- [ ] Architecture Baseline is maintained
- [ ] Authority boundaries are respected

### Traceability
- [ ] Source requirement is referenced
- [ ] Artifact ID is assigned
- [ ] ADR references are included (if applicable)
- [ ] Change is logged
```

### Validation Failure Handling

| Failure | Action |
|---------|--------|
| Completeness failure | Return to execution; produce missing items |
| Correctness failure | Return to execution; fix issues |
| Quality failure | Return to execution; meet quality standards |
| Compliance failure | Do not deliver; escalate compliance issues |
| Traceability failure | Add missing traceability links |

## Phase 5: Delivery

### Delivery Steps
```
1. PACKAGE: Agent packages all artifacts with metadata
2. ASSEMBLE CONTEXT PACKET: Agent creates context packet for next stage
3. VALIDATE PACKAGE: Agent runs final validation on the package
4. STORE: Agent saves artifacts to designated locations
5. NOTIFY: Agent notifies Program Manager AI of completion
6. TRANSFER: Context packet is queued for the next agent
```

### Delivery Format
```markdown
SESSION DELIVERY
════════════════
Session ID: SESSION-042
Agent: [Role]
Task: TASK-042
Status: [Complete / Partial / Failed]

ARTIFACTS DELIVERED
───────────────────
- [Artifact ID]: [Description] — [Path]
- [Artifact ID]: [Description] — [Path]

NEXT STAGE
──────────
Next Agent: [Role]
Context Packet: CP-001

OPEN ITEMS
──────────
- [Item requiring attention]

ISSUES / RISKS
──────────────
- [Issues encountered during execution]
```

## Phase 6: Session Logging

### Session Log Format

Every session produces a structured log:

```markdown
SESSION LOG
═══════════
Session ID: SESSION-042
Agent: [Role]
Task: TASK-042
Started: YYYY-MM-DD HH:MM UTC
Completed: YYYY-MM-DD HH:MM UTC
Duration: [Minutes]

INITIALIZATION
──────────────
Status: [Success / Partial / Failed]
Issues: [Any initialization issues]

CONTEXT LOADED
──────────────
- Global Memory: Loaded
- Standards: Loaded
- Domain Context: Loaded
- Architecture Context: Loaded
- Sprint Context: Loaded
- Task Context: Loaded
- Knowledge Base: Loaded (2 patterns found)
- Previous Session: Not applicable

DECISIONS MADE
──────────────
- Decision: Selected feature-based module organization
  Authority: Level 3 (tactical)
  Rationale: Aligns with bounded contexts

ARTIFACTS PRODUCED
──────────────────
- BE-015: Payment Module — Created
- TS-015: Payment Unit Tests — Created

QUALITY GATES
─────────────
- GATE-BE: Passed
- GATE-DB: Not applicable

ISSUES ENCOUNTERED
──────────────────
- None

DEVIATIONS
──────────
- None

SUMMARY
───────
[Brief narrative of what was accomplished]
```

### Session Log Storage
- Session logs are stored in the audit trail at `PROGRAM-02-ENTERPRISE-AI-DELIVERY/11-EXECUTION/session-logs/`
- Logs are retained for the full program duration
- Logs are compressed and indexed for query

## Session Rules Summary

| Rule | Description |
|------|-------------|
| Complete lifecycle | Every session must go through all 6 phases |
| No phase skipping | An agent may not skip any phase |
| Sequential phases | Phases must be executed in order |
| Self-validation | Agent validates its own output before delivery |
| Full logging | Every session produces a complete log |
| No ghost sessions | Every session is registered before starting |
| Session ID unique | No session ID is reused |
| Time-bounded | Sessions have a maximum duration |
| Interruptible | Sessions may be interrupted by higher-priority tasks |
| Resumable | Interrupted sessions may resume from last checkpoint |
