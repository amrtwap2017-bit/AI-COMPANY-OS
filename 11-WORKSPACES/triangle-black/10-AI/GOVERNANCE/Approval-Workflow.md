# Approval Workflow

> General approval workflow covering what needs approval, who can approve, SLAs, rejection handling, and override protocol.

## What Needs Approval

### Mandatory Approval — Human Required
| Item | Approver | When |
|------|----------|------|
| Architecture baseline change | Human CTO | Before implementation |
| Technology stack change | Human CEO | Before adoption |
| Security exception | Human CEO | Before proceeding |
| Production release | Human CEO | Before deployment |
| Budget allocation > $10K | Human CEO | Before commitment |
| Framework change (process/structure) | Human CEO | Before adoption |
| AI Constitution amendment | Human CTO | Before publication |
| Quality gate override (blocking) | Human CEO | Before bypass |
| External partnership integration | Human CEO | Before development |

### Mandatory Approval — AI Agent Required
| Item | Approver | When |
|------|----------|------|
| Sprint scope change | Program Manager AI | Before sprint starts |
| Requirement change | Product Owner AI | Before implementation |
| Architecture decision (Level 2) | Chief Enterprise Architect AI | Before implementation |
| Database schema change (breaking) | Solution Architect AI | Before migration |
| API contract change | Solution Architect AI | Before implementation |
| Test plan | QA Director AI | Before test execution |
| Deployment to staging | DevOps Architect AI | Before deployment |
| Merge to main | Merge Controller AI | Before merge |
| Documentation publication | Program Manager AI | Before publishing |
| Memory store update | Program Manager AI | Before updating |

### Automatic Approval — No Explicit Approval Needed
| Item | Note |
|------|------|
| Code implementation within defined scope | Reviewed at merge gate |
| Unit tests | Verified by CI |
| Non-breaking database changes | Logged for notification |
| Documentation updates | Verified by Documentation Engineer AI |
| Sprint task execution | Logged in sprint log |

## Approval Authority Matrix

| Approver Role | Can Approve | Cannot Approve |
|---------------|-------------|----------------|
| Business Analyst AI | Requirement clarifications | Requirement scope changes |
| Product Owner AI | Requirement changes, AC changes | Architecture decisions |
| Solution Architect AI | Architectural decisions (L2) | Strategic decisions (L1) |
| Chief Enterprise Architect AI | Strategic architecture decisions | Constitutional changes |
| Database Architect AI | Non-breaking schema changes | Breaking schema changes |
| Backend Lead AI | Backend implementation decisions | Architecture decisions |
| Frontend Lead AI | Frontend implementation decisions | Architecture decisions |
| QA Director AI | Test plans, quality criteria | Production releases |
| Security Architect AI | Security reviews, policies | Security exceptions |
| DevOps Architect AI | Deployment scripts, CI/CD config | Production deployments |
| Program Manager AI | Sprint scope, priorities | Architecture decisions |
| Merge Controller AI | Merge approvals | Code quality exceptions |
| Documentation Engineer AI | Documentation format | Content accuracy |
| Chief Executive AI | Level 1 strategic decisions | Constitutional amendments |
| Human CEO/CTO | All decisions, overrides | (unlimited) |

## Approval Workflow

### Standard Approval Flow
```
1. SUBMIT: Agent creates approval request with complete information
2. QUEUE: Request enters approver's queue
3. REVIEW: Approver evaluates the request
4. DECIDE: Approver approves, rejects, or requests changes
5. NOTIFY: Result is communicated to all affected agents
6. LOG: Approval/rejection is recorded in audit trail
```

### Approval Request Format

```markdown
APPROVAL REQUEST
════════════════
ID: APR-001
Date: YYYY-MM-DD HH:MM UTC
Priority: [Critical / High / Normal / Low]

REQUESTED BY
────────────
Agent: [Role]
Session: [Session ID]
Task: [Task ID]

REQUEST
───────
[Clear description of what requires approval]

RATIONALE
─────────
[Why this decision needs to be made]
[What problem it solves]
[What happens if not approved]

DETAILS
───────
[Supporting information, links to artifacts, references]
[Risk assessment if applicable]

DEADLINE
────────
[When approval is needed by to avoid blocking the pipeline]
```

## Approval SLA

| Priority | Response SLA | Resolution SLA | Escalation |
|----------|-------------|----------------|------------|
| Critical | 30 minutes | 2 hours | Escalate to next level after SLA |
| High | 2 hours | 8 hours | Escalate to next level after SLA |
| Normal | 8 hours | 24 hours | Escalate after 24 hours |
| Low | 24 hours | 72 hours | Escalate after 72 hours |

### SLA Clock
- SLA starts when the approval request is submitted
- If the approver requests changes, the clock resets when the updated request is resubmitted
- SLA pauses during non-working hours (defined per program)

## Approval Outcomes

### Approved
- The request is granted as submitted
- The approving agent sets status to Approved
- The requesting agent proceeds with implementation

### Approved with Conditions
- The request is granted with specific conditions
- Conditions must be met before or during implementation
- The requesting agent acknowledges conditions
- Program Manager AI verifies conditions are met

### Rejected
- The request is denied with written rationale
- The approving agent sets status to Rejected
- The requesting agent may:
  - Accept the rejection and stop work
  - Provide new information and resubmit
  - Appeal to the next approval level

### Needs Changes
- The request requires modification before re-review
- The approving agent provides specific change requests
- The requesting agent modifies and resubmits
- The review SLA restarts on resubmission

## Rejection Handling

### Rejection Response Options

| Option | Description | Process |
|--------|-------------|---------|
| Accept | Agree with rejection rationale | Stop work, document acceptance |
| Resubmit | Provide new information | Update request with new facts, resubmit |
| Appeal | Disagree with rejection | Escalate to next level approver |
| Compromise | Propose modified approach | Submit revised request addressing concerns |

### Rejection Appeal Chain
```
Original Approver → Next Level Approver → Chief Enterprise Architect AI → 
Chief Executive AI → Human CEO/CTO
```

### Rejection Logging
Every rejection must include:
```markdown
REJECTION RECORD
────────────────
ID: APR-001
Rejected By: [Role]
Date: YYYY-MM-DD HH:MM UTC

REJECTION REASON
────────────────
[Detailed explanation of why the request was rejected]

ALTERNATIVES SUGGESTED
──────────────────────
[What the approver suggests instead, if applicable]

NEXT STEPS
──────────
[What the requesting agent should do next]
[Resubmission conditions if applicable]
```

## Override Protocol

### Who Can Override
| Role | Can Override | Limitations |
|------|-------------|-------------|
| Chief Enterprise Architect AI | Any Level 2-4 decision | Must document rationale |
| Chief Executive AI | Any Level 1-4 decision | Must document rationale; report to CEO |
| Human CEO/CTO | Any decision, any level | Unlimited |

### Override Process
```
1. OVERRIDE INITIATION: Authorized agent declares override
2. RATIONALE: Override must include written justification
3. NOTIFICATION: Original decision maker and all affected agents notified
4. DOCUMENTATION: Override recorded in permanent audit trail
5. REVIEW: Human CEO/CTO reviews all overrides within 7 days
```

### Override Record
```markdown
OVERRIDE RECORD
═══════════════
ID: OVR-001
Date: YYYY-MM-DD HH:MM UTC

ORIGINAL DECISION
─────────────────
Decision: [What was originally decided]
Made By: [Original decision maker]
Approval: [Original approval ID if applicable]

OVERRIDE DECISION
─────────────────
Decision: [What the override changed]
Overridden By: [Role]

RATIONALE FOR OVERRIDE
──────────────────────
[Why the override was necessary]

RISK ASSESSMENT
───────────────
[Assessment of risks introduced by the override]

APPROVALS
─────────
[Additional approvals if required]
```

## Approval Delegation

An approver may delegate approval authority:
1. Delegation must be in writing (logged to Program Manager AI)
2. Delegation specifies scope and duration
3. The delegate has the same authority as the delegator within scope
4. The delegator remains accountable for the delegate's decisions
5. Delegation expires automatically at the specified end date
6. Revocable at any time by the delegator

## Approval Log

Every approval action is recorded:
```
APPROVAL LOG
════════════
ID: APR-001
Type: Architecture Decision
Requested By: Solution Architect AI
Approved By: Chief Enterprise Architect AI
Date: YYYY-MM-DD HH:MM UTC
Status: Approved
Outcome: Approved with conditions
Conditions: Database migration must be reversible
Artifact: ADR-015
```
