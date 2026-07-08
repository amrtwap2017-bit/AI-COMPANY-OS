# Handover Protocol

> Defines how work is handed over between pipeline stages: what information is passed, the handover format, confirmation protocol, and failure handling.

## Handover Principles

1. **Clean handover** — The source agent completes its work before handing over
2. **Complete information** — The receiving agent has everything it needs to proceed
3. **No rework** — The receiving agent should not need to redo or rediscover work
4. **Explicit confirmation** — The receiving agent confirms readiness before the source is released
5. **Auditable** — Every handover is logged with full traceability

## Handover Points

Every pipeline stage transition is a handover point:

```
REQ → VAL → ARC → DB → API → BE → FE → QA → SEC → PERF → DOC → REV → MRG → RLS
```

## Standard Handover Format

Every handover uses this standard format, regardless of the specific stage transition:

```markdown
HANDOVER DOCUMENT
═════════════════
ID: HO-001
Date: YYYY-MM-DD HH:MM UTC
Stage: [Source Stage] → [Destination Stage]
Task ID: TASK-NNN
Feature: [Feature Name]

SOURCE AGENT
────────────
Role: [Agent Role]
Session ID: [Session ID]

DESTINATION AGENT
─────────────────
Role: [Agent Role]

ARTIFACTS BEING HANDED OVER
───────────────────────────
| Artifact ID | Type | Status | Location |
|-------------|------|--------|----------|
| ART-001     | Type | Status | Path     |
| ART-002     | Type | Status | Path     |

KEY DECISIONS MADE
──────────────────
| Decision | Rationale | Authority | Reference |
|----------|-----------|-----------|-----------|
| Decision | Rationale | Auth      | Ref       |

PENDING DECISIONS (requires destination action)
───────────────────────────────────────────────
| Decision Needed | Context | Deadline |
|-----------------|---------|----------|
| Decision        | Context | Deadline |

NEXT STEPS
──────────
1. [Step 1 for destination agent]
2. [Step 2 for destination agent]
3. [Step 3 for destination agent]

KNOWN ISSUES / RISKS
────────────────────
- [Issue 1] — Severity: [Low/Med/High] — Mitigation: [Description]

CONTEXT FOR DESTINATION
───────────────────────
[Specific information the destination agent needs to begin work efficiently]

QUALITY GATES COMPLETED
───────────────────────
| Gate ID | Status | Notes |
|---------|--------|-------|
| GATE-ID | Passed | Notes |

SOURCE AGENT DECLARATION
────────────────────────
I confirm that all artifacts in scope have been completed to the best of my ability,
all decisions have been documented, and the destination agent has sufficient context
to proceed.

Signed: [Agent Role]
Date: YYYY-MM-DD HH:MM UTC
```

## Stage-Specific Handover Requirements

### REQ → VAL Handover

| Required | Description |
|----------|-------------|
| Business Requirement document | REQ-NNN with full template |
| Traceability links | To business capability in Program 1 |
| Stakeholder identification | Who requested and who approves |
| Preliminary acceptance criteria | Draft ACs for validation |
| Dependencies identified | Known dependencies on other requirements or external systems |

### VAL → ARC Handover

| Required | Description |
|----------|-------------|
| Validated requirements | REQ-NNN status = Validated |
| Final acceptance criteria | AC-NNN all defined and reviewed |
| Business rules | All relevant business rules documented |
| Integration points | Known external system touchpoints |
| Priority and value score | Business value assessment |
| Non-functional requirements | Performance, security, scalability expectations |

### ARC → DB Handover

| Required | Description |
|----------|-------------|
| System architecture document | ARCH-NNN with diagrams |
| Domain model | DM-NNN with entities and relationships |
| API contracts | API-NNN contracts (if database-adjacent) |
| Data requirements | Volume, velocity, access patterns |
| Security requirements | Data classification, encryption needs |
| ADR references | ADRs that constrain database design |

### DB → API Handover

| Required | Description |
|----------|-------------|
| Database schema | DB-NNN with all table definitions |
| Migration scripts | MIG-NNN reversible |
| Entity relationship model | For API contract alignment |
| Query patterns | Expected query patterns for API design |
| Data access constraints | Security, performance constraints |

### API → BE Handover

| Required | Description |
|----------|-------------|
| API contract | API-NNN approved |
| OpenAPI specification | Complete spec file |
| Error definitions | All error codes defined |
| Authentication/authorization | Auth scheme, required roles |
| Rate limiting | Rate limit configuration |

### BE → FE Handover

| Required | Description |
|----------|-------------|
| API implementation status | What endpoints are available |
| Response models | All response types defined |
| Error handling patterns | How errors are returned |
| Loading states | Expected loading behavior |
| WebSocket events | Real-time events (if applicable) |
| Pagination approach | Pagination contract |

### FE → QA Handover

| Required | Description |
|----------|-------------|
| Feature implementation | All user stories implemented |
| User flows | Happy path and edge cases |
| Browser support | What browsers are supported |
| Known issues | Any known bugs or limitations |
| Test scenarios | Suggested test cases |
| Accessibility status | WCAG compliance status |

### QA → SEC Handover

| Required | Description |
|----------|-------------|
| Test results | TP-NNN execution summary |
| Defect log | All found and fixed defects |
| Coverage report | Code coverage percentages |
| Integration test results | Third-party integration testing |
| Edge case coverage | What edge cases were tested |

### SEC → PERF Handover

| Required | Description |
|----------|-------------|
| Security review report | SR-NNN findings and disposition |
| Security controls | What controls are implemented |
| Encryption overhead | Performance cost of encryption |
| AuthN/AuthZ overhead | Performance cost of authentication |
| Rate limiting config | Current rate limit settings |

### PERF → DOC Handover

| Required | Description |
|----------|-------------|
| Performance test report | PR-NNN with all metrics |
| Response time percentiles | p50, p95, p99 results |
| Throughput data | Requests per second, concurrent users |
| Scalability limits | Where the system starts to degrade |
| Caching configuration | What is cached and for how long |

### DOC → REV Handover

| Required | Description |
|----------|-------------|
| API documentation | DOC-NNN complete |
| User documentation | User-facing docs complete |
| Technical documentation | Internal docs complete |
| Release notes | RN-NNN draft |
| Change log entry | CL-NNN entry |

### REV → MRG Handover

| Required | Description |
|----------|-------------|
| Review report | All review comments addressed |
| Approval confirmation | Code Review AI sign-off |
| Quality gate summary | All gates passed with evidence |
| Final artifacts | All artifacts in their final location |

### MRG → RLS Handover

| Required | Description |
|----------|-------------|
| Merge confirmation | Merge commit reference |
| Version tag | Version number assigned |
| CI/CD status | All pipeline checks passed |
| Release notes | RN-NNN final |
| Deployment instructions | DEP-NNN deployment plan |
| Rollback plan | Rollback procedure |

## Handover Confirmation Protocol

### Standard Confirmation

```markdown
HANDOVER CONFIRMATION
═════════════════════
ID: HC-001
Handover ID: HO-001

DESTINATION AGENT CONFIRMS:
- [x] All artifacts received and accessible
- [x] All decisions understood
- [x] Next steps clear
- [x] Ready to proceed

QUESTIONS / CLARIFICATIONS:
- [None]

CONFIRMED BY
────────────
Agent: [Role]
Date: YYYY-MM-DD HH:MM UTC
```

### Clarification Request

If the destination agent needs clarification:

```markdown
CLARIFICATION REQUEST
═════════════════════
ID: CR-001
Handover ID: HO-001

RE: [Specific item requiring clarification]

QUESTION:
[Specific question]

IMPACT:
[What is blocked by this question]

REQUESTED BY
────────────
Agent: [Role]
Date: YYYY-MM-DD HH:MM UTC

--- RESPONSE ---

CLARIFICATION:
[Answer to question]

RESPONDED BY
────────────
Agent: [Role]
Date: YYYY-MM-DD HH:MM UTC
```

## Handover Failure Handling

### Failure Modes

| Failure Mode | Detection | Impact |
|--------------|-----------|--------|
| Incomplete artifacts | Destination agent identifies missing items | Handover blocked |
| Unclear decisions | Destination agent cannot understand rationale | Clarification needed |
| Quality gate failures | Gates not passed | Handover blocked |
| Missing context | Destination cannot proceed | Handover blocked |
| Confirmation timeout | No confirmation within SLA | Auto-escalation |

### Failure Resolution

```markdown
HANDOVER FAILURE RECORD
═══════════════════════
ID: HF-001
Handover ID: HO-001

FAILURE TYPE
────────────
[Incomplete artifacts / Unclear decisions / Quality gate failure / Missing context / Timeout]

DESCRIPTION
───────────
[What went wrong]

IMPACT
──────
[What is blocked]

RESOLUTION
──────────
[How the failure was resolved]

ADDITIONAL ACTIONS
──────────────────
[What is needed to prevent recurrence]

RESOLVED BY
───────────
Agent: [Role]
Date: YYYY-MM-DD HH:MM UTC
```

### Escalation on Handover Failure

| Step | Action | When |
|------|--------|------|
| 1 | Destination agent requests clarification | Within 15 minutes of detecting failure |
| 2 | Source agent provides clarification | Within 30 minutes of request |
| 3 | If still blocked, escalate to Program Manager AI | After 2 clarification cycles |
| 4 | Program Manager AI resolves or reassigns | Within 1 hour |
| 5 | If unresolved, escalate to Chief Enterprise Architect AI | After 2 hours total |

## Handover Log

Every handover is logged in the handover register:

```markdown
HANDOVER REGISTER
═════════════════
| ID | From | To | Date | Status | Duration |
|----|------|----|------|--------|----------|
| HO-001 | Business Analyst AI | Product Owner AI | YYYY-MM-DD | Completed | 15 min |
| HO-002 | Product Owner AI | Solution Architect AI | YYYY-MM-DD | In Progress | — |
| HO-003 | Solution Architect AI | Database Architect AI | YYYY-MM-DD | Pending | — |
```

## Handover SLA

| Transition | Standard SLA | Complex SLA (ADR Required) |
|------------|-------------|---------------------------|
| REQ → VAL | 1 hour | 2 hours |
| VAL → ARC | 2 hours | 4 hours |
| ARC → DB | 2 hours | 4 hours |
| DB → API | 1 hour | 2 hours |
| API → BE | 1 hour | 2 hours |
| BE → FE | 1 hour | 2 hours |
| FE → QA | 2 hours | 4 hours |
| QA → SEC | 2 hours | 4 hours |
| SEC → PERF | 1 hour | 2 hours |
| PERF → DOC | 1 hour | 2 hours |
| DOC → REV | 1 hour | 2 hours |
| REV → MRG | 2 hours | 4 hours |
| MRG → RLS | 30 minutes | 1 hour |
