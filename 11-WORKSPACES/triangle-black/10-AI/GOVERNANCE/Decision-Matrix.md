# Decision Authority Matrix

> Defines which AI agent role has authority to make each type of decision, whether an ADR is required, and whether human approval is needed.

## Decision Levels

| Level | Name | Description | ADR Required | Human Approval |
|-------|------|-------------|-------------|----------------|
| 0 | Immutable | AI Constitution, Architecture Baseline | Constitutional amendment | CTO |
| 1 | Strategic | Enterprise principles, business capabilities, technology stack | Yes | Yes |
| 2 | Architectural | Design patterns, module boundaries, library choices | Yes | No |
| 3 | Tactical | Implementation approach, algorithm selection | No | No |
| 4 | Operational | Daily execution, sprint tasks, code formatting | No | No |

## Decision Authority Matrix

| Decision Type | Level | Decision Authority | ADR Required | Human Approval | Notification |
|---------------|-------|-------------------|-------------|----------------|--------------|
| Architecture baseline change | 0 | Chief Enterprise Architect AI proposes; CTO approves | Yes | CTO | CEO |
| AI Constitution amendment | 0 | Chief Executive AI proposes; CTO approves | Yes | CTO | All agents |
| Technology stack change | 1 | Chief Enterprise Architect AI proposes; CEO approves | Yes | CEO | CTO |
| New framework/library introduction | 1 | Chief Enterprise Architect AI proposes; CEO approves | Yes | CEO | CTO |
| Domain boundary modification | 1 | Chief Enterprise Architect AI | Yes | CEO | Program Manager AI |
| Bounded context change | 1 | Chief Enterprise Architect AI | Yes | CEO | Solution Architect AI |
| API versioning strategy | 2 | Solution Architect AI | Yes | No | Chief Enterprise Architect AI |
| Database schema change (breaking) | 2 | Database Architect AI proposes; Solution Architect AI approves | Yes | No | Chief Enterprise Architect AI |
| Database schema change (non-breaking) | 3 | Database Architect AI | No | No | Solution Architect AI |
| Design pattern selection | 2 | Solution Architect AI | Yes | No | Chief Enterprise Architect AI |
| Module structure | 3 | Backend Lead AI / Frontend Lead AI | No | No | Solution Architect AI |
| Code implementation approach | 3 | Backend Lead AI / Frontend Lead AI | No | No | Code Review AI |
| Test framework selection | 2 | QA Director AI proposes; Solution Architect AI approves | Yes | No | Chief Enterprise Architect AI |
| Test coverage threshold | 2 | QA Director AI | Yes | No | Chief Enterprise Architect AI |
| Security policy | 1 | Security Architect AI proposes; CEO approves | Yes | CEO | All agents |
| Security exception | 1 | Security Architect AI proposes; CEO approves | Yes | CEO | CTO |
| Deployment strategy | 2 | DevOps Architect AI proposes; Solution Architect AI approves | Yes | No | Chief Enterprise Architect AI |
| CI/CD tool change | 2 | DevOps Architect AI proposes; Solution Architect AI approves | Yes | No | Chief Enterprise Architect AI |
| Production release | 1 | Merge Controller AI proposes; CEO approves | No | CEO | All agents |
| Hotfix release | 2 | Merge Controller AI | No | No | CEO (post-facto) |
| Sprint scope change | 3 | Program Manager AI | No | No | Chief Enterprise Architect AI |
| Priority change | 3 | Product Owner AI | No | No | Program Manager AI |
| Requirement change | 2 | Business Analyst AI proposes; Product Owner AI approves | No | No | Program Manager AI |
| Requirement rejection | 2 | Product Owner AI | No | No | Business Analyst AI |
| UI/UX design direction | 2 | UX Architect AI proposes; Solution Architect AI approves | Yes | No | Chief Enterprise Architect AI |
| Documentation format | 3 | Documentation Engineer AI | No | No | Program Manager AI |
| Quality gate waiver | 2 | QA Director AI proposes; Chief Enterprise Architect AI approves | Yes | No | CEO |
| Performance threshold | 2 | Performance Engineer AI proposes; QA Director AI approves | Yes | No | Chief Enterprise Architect AI |
| Budget allocation | 1 | Chief Executive AI | No | CEO | CTO |
| Agent role reassignment | 1 | Chief Executive AI | No | CEO | All agents |
| Framework process change | 1 | Chief Enterprise Architect AI proposes; CEO approves | Yes | CEO | All agents |
| Memory store modification | 2 | Documentation Engineer AI proposes; Program Manager AI approves | Yes | No | Chief Enterprise Architect AI |

## Decision Workflow by Level

### Level 4 — Operational (Full Agent Authority)
```
Agent identifies decision → Agent makes decision → Agent logs decision → Proceeds
```

### Level 3 — Tactical (Agent Authority, No ADR)
```
Agent identifies decision → Agent evaluates options → Agent makes decision → 
Agent logs with rationale → Agent proceeds → Agent notifies relevant parties
```

### Level 2 — Architectural (ADR Required)
```
Agent identifies decision → Agent creates ADR → ADR reviewed by Chief Enterprise Architect AI →
ADR approved/rejected → If approved, decision implemented → ADR logged in decision register
```

### Level 1 — Strategic (ADR + Human Approval)
```
Agent identifies decision → Agent creates ADR → Chief Enterprise Architect AI reviews →
ADR escalated to human CEO/CTO → Human approves/rejects → If approved, decision implemented →
ADR logged with human approval reference
```

### Level 0 — Immutable (Constitutional Amendment)
```
Agent identifies need → Agent escalates to Chief Executive AI → 
Chief Executive AI proposes amendment → Human CTO reviews → 
CTO approves/rejects → If approved, constitution updated → 
CHANGELOG entry created → All agents notified
```

## Decision Escalation

If any agent determines a decision exceeds its authority level:
1. The agent immediately stops work on the decision
2. The agent escalates to the next higher authority using the escalation format
3. The decision is held until the higher authority responds
4. Work may proceed on independent tasks while waiting

## Decision Logging

Every decision must be logged regardless of level:

```
DECISION LOG
────────────
Decision ID: DEC-001
Decision Type: Module structure
Level: 3
Agent: Backend Lead AI
Date: YYYY-MM-DD
Decision: Selected feature-based module organization
Rationale: Better cohesion, aligns with bounded contexts
Options Considered: Feature-based, layer-based, hybrid
References: ADR-012, Enterprise-Principles.md
Outcome: Implemented
```
