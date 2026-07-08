# Epic Lifecycle

## State Machine

The epic lifecycle is governed by a formal state machine with defined states, transitions, triggers, and validation rules.

### State Transition Diagram

```
                        +------------------+
                        |                  |
                        |     DRAFT        |
                        |                  |
                        +--------+---------+
                                 |
                                 | Submit for Review
                                 v
                        +------------------+
          +------------>|                  |<-----------+
          |             |  UNDER_REVIEW    |            |
          |             |                  |            |
          |             +--------+---------+            |
          |                      |                      |
          |          Approve     |     Reject           |
          |                      v                      |
          |             +------------------+            |
          |             |                  |            |
          |             |    APPROVED      |            |
          |             |                  |            |
          |             +--------+---------+            |
          |                      |                      |
          |              Start Execution                |
          |                      v                      |
          |             +------------------+            |
          |     +------>|                  |            |
          |     |       |   IN_PROGRESS    |            |
          |     |       |                  |            |
          |     |       +--------+---------+            |
          |     |                |                      |
          |     |   Risk Flag    |    Complete          |
          |     |       v        v                      |
          |     |  +-----------+-----------+            |
          |     |  |                     |              |
          |     |  |     AT_RISK         |              |
          |     |  |                     |              |
          |     |  +---------+-----------+              |
          |     |            |                          |
          |     |  Mitigated |                          |
          |     |            v                          |
          |     |   Back to IN_PROGRESS                 |
          |     |                                       |
          |     |            +--------------------------+---
          |     |            v                              |
          |     |  +------------------+                     |
          |     +--|                  |                     |
          |        |   COMPLETED      |                     |
          |        |                  |                     |
          |        +--------+---------+                     |
          |                 |                               |
          |       Accept    |     Reject                    |
          |                 v                               |
          |        +------------------+                     |
          |        |                  |                     |
          |        |     CLOSED       |                     |
          |        |                  |                     |
          |        +------------------+                     |
          |                                                |
          |        +------------------+                     |
          |        |                  |                     |
          +--------|    REJECTED      |                     |
                   |                  |                     |
                   +------------------+                     |
                      ^                                     |
                      |                                     |
                      +-------------------------------------+
```

## State Definitions

| State | Definition | Expected Duration |
|-------|-----------|-------------------|
| **Draft** | Epic is being defined; template being completed | 1-10 business days |
| **Under Review** | Epic is under review by Program Manager and stakeholders | 1-5 business days |
| **Approved** | Epic is approved and ready for execution | 1-20 business days (until execution starts) |
| **In Progress** | Epic execution is active; features being delivered | 1-6 months |
| **At Risk** | Epic has identified risks that may impact delivery | Variable |
| **Completed** | All features delivered; pending acceptance review | 1-10 business days |
| **Closed** | Epic accepted, signed off, and archived | Terminal state |
| **Rejected** | Epic rejected at any point; may be resubmitted | Terminal (or resubmitted) |

## State Transitions

### Draft to Under Review
- **Trigger:** Epic Owner submits completed template for review
- **Validation:** All required fields populated; business capability identified; Epic Owner assigned; initial effort estimate provided
- **Actor:** Epic Owner

### Under Review to Approved
- **Trigger:** Program Manager approves the epic
- **Validation:** Strategic alignment confirmed; value assessment complete; capacity available; dependencies identified; risks assessed
- **Actor:** Program Manager (with steering committee input for P0 epics)

### Under Review to Rejected
- **Trigger:** Review determines epic should not proceed
- **Validation:** Clear rationale documented
- **Actor:** Program Manager
- **Note:** Rejected epics can be resubmitted from Draft after addressing concerns

### Under Review to Draft
- **Trigger:** Epic requires significant revision
- **Validation:** Review feedback documented
- **Actor:** Program Manager

### Approved to In Progress
- **Trigger:** Execution starts; first feature sprint begins
- **Validation:** Resources allocated; features defined; sprint plan in place; dependencies confirmed
- **Actor:** Delivery Lead

### In Progress to At Risk
- **Trigger:** Identified risk(s) threaten timeline, scope, or quality
- **Validation:** Risk documented; impact assessed; mitigation plan initiated
- **Actor:** Epic Owner or Delivery Lead

### At Risk to In Progress
- **Trigger:** Risk is mitigated; impact reduced to acceptable level
- **Validation:** Mitigation actions completed; residual risk assessed as acceptable
- **Actor:** Epic Owner (confirmed by Program Manager)

### In Progress to Completed
- **Trigger:** All features delivered and accepted; no remaining scope items
- **Validation:** All feature acceptance criteria met; quality gates passed; no open P0/P1 defects; documentation complete
- **Actor:** Delivery Lead

### Completed to Closed
- **Trigger:** Formal acceptance review completed; stakeholders sign off
- **Validation:** Definition of Done met; value realization documented; lessons learned captured; all artifacts archived
- **Actor:** Program Manager (confirmed by Steering Committee for P0/P1)

### Completed to In Progress
- **Trigger:** Acceptance review reveals incomplete items or quality gaps
- **Validation:** Specific gaps documented; rework plan created
- **Actor:** Program Manager

### Rejected to Draft
- **Trigger:** Epic owner revises and resubmits
- **Validation:** Rejection reasons addressed; changes documented
- **Actor:** Epic Owner

## Transition Validation Rules

1. No state may be skipped — every transition must go to an adjacent state
2. Status changes must be recorded with timestamp and actor identity
3. Certain transitions require approval:
   - Draft → Under Review requires Epic Owner confirmation
   - Under Review → Approved requires Program Manager approval
   - Completed → Closed requires formal sign-off
4. At-risk epics must have a documented mitigation plan
5. Rejected epics must document the rejection reason
6. State changes are broadcast to relevant stakeholders

## Audit Trail

Every state transition is recorded with:
- Previous state
- New state
- Timestamp (UTC)
- Actor (individual who performed the transition)
- Reason or trigger
- Any associated artifacts (approval documents, risk logs, etc.)

The audit trail is immutable and available for governance reviews and retrospective analysis.
