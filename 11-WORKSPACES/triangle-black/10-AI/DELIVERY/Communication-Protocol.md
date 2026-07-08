# Communication Protocol

> How AI agents communicate within the Enterprise AI Delivery Framework: message format, channels, priorities, synchronous vs asynchronous communication, and SLAs.

## Communication Principles

1. **Structured over freeform** — All communication follows defined formats
2. **Asynchronous by default** — Agents do not wait for responses unless necessary
3. **Right level of detail** — Enough context for action, not more
4. **Auditable** — Every message is logged for traceability
5. **Priority-aware** — Urgent messages are flagged and handled first

## Message Channels

| Channel | Purpose | Type | Persistence |
|---------|---------|------|-------------|
| **Context Packet** | Task assignment with full context | Asynchronous | Stored in session log |
| **Handover Document** | Pipeline stage transition | Asynchronous | Stored in artifact directory |
| **Escalation** | Blocking issue requiring intervention | Synchronous | Stored in escalation log |
| **Approval Request** | Decision requiring approval | Synchronous | Stored in approval log |
| **Notification** | Informational updates | Asynchronous | Stored in event log |
| **Query** | Request for information | Asynchronous | Stored in query log |
| **Alert** | Urgent system condition | Synchronous | Stored in alert log |

## Message Format

Every message between agents follows this standard format:

```markdown
MESSAGE
═══════
ID: MSG-001
Channel: [Context Packet / Handover / Escalation / Approval / Notification / Query / Alert]
Priority: [Critical / High / Normal / Low]
Timestamp: YYYY-MM-DD HH:MM UTC

FROM
────
Agent: [Role]
Session: [Session ID]
Task: [Task ID]

TO
──
Agent: [Role]

SUBJECT
───────
[Brief one-line subject]

BODY
────
[Message content following channel-specific format]

ATTACHMENTS
───────────
[References to artifacts, files, or context packets]

EXPIRY
──────
[Time after which this message is considered stale, if applicable]
```

## Message Priorities

| Priority | Color | When Used | Response SLA |
|----------|-------|-----------|-------------|
| Critical | Red | Pipeline blocked, production issue, security breach | 15 minutes |
| High | Orange | Feature blocked, dependency missing, requirement ambiguity | 1 hour |
| Normal | Blue | Standard task communication, status updates | 4 hours |
| Low | Gray | Informational, logging, future reference | End of day |

### Priority Rules
- The sending agent sets the priority based on impact
- The receiving agent may downgrade priority with justification
- Critical and High messages are delivered synchronously
- Normal and Low messages are delivered asynchronously

## Synchronous vs Asynchronous Communication

### Asynchronous (Default)
Most agent-to-agent communication is asynchronous:
- Context packets are delivered when the receiving agent starts its session
- Notifications are queued and delivered in priority order
- Status updates are sent at stage completion
- Queries are answered when the receiving agent is available

### Synchronous (Exception Only)
Synchronous communication is used when:
- The pipeline is blocked and cannot proceed
- A decision is required immediately
- An approval is needed to continue
- A critical error has occurred
- An escalation cannot wait

Synchronous channels:
- **Escalation** — Direct synchronous handoff with response expected
- **Approval Request** — Approval with defined SLA
- **Alert** — Immediate notification requiring action

## Communication Patterns

### Point-to-Point
```
Agent A → Agent B
```
Used for: Direct task handoffs, queries, notifications between specific agents.

### Broadcast
```
Agent A → All Agents
```
Used for: Critical alerts, policy changes, freeze declarations, milestone announcements.

### Hierarchical
```
Agent A → Supervisor Agent → Higher Authority
```
Used for: Escalations, approval requests, status reporting.

### Pipeline
```
Agent A → Agent B → Agent C → ...
```
Used for: Sequential stage transitions in the delivery pipeline.

## Response SLAs

| Channel | Priority | First Response SLA | Resolution SLA |
|---------|----------|-------------------|----------------|
| Escalation | Critical | 15 minutes | 1 hour |
| Escalation | High | 30 minutes | 4 hours |
| Escalation | Normal | 2 hours | 24 hours |
| Escalation | Low | 8 hours | 48 hours |
| Approval Request | Critical | 15 minutes | 1 hour |
| Approval Request | High | 30 minutes | 4 hours |
| Approval Request | Normal | 2 hours | 24 hours |
| Approval Request | Low | 8 hours | 48 hours |
| Query | Normal | 1 hour | 4 hours |
| Query | Low | 4 hours | End of day |
| Alert | Critical | Immediate | 30 minutes |
| Alert | High | 15 minutes | 1 hour |

## Message Delivery Guarantees

| Property | Guarantee |
|----------|-----------|
| Delivery | At-least-once delivery — No message is lost |
| Order | Messages from the same sender to the same receiver are delivered in order |
| Duplication | Duplicate messages are detected and deduplicated by message ID |
| Persistence | All messages are persisted in the message log |
| Acknowledgement | Every message must be acknowledged by the receiver |

## Message Log

All communication is logged:

```markdown
COMMUNICATION LOG
═════════════════
ID: MSG-001
From: Backend Lead AI
To: Code Review AI
Channel: Handover
Priority: Normal
Subject: Handover of payment module implementation
Status: Delivered + Acknowledged
Delivered: YYYY-MM-DD HH:MM UTC
Acknowledged: YYYY-MM-DD HH:MM UTC
```

## Communication Anti-Patterns

| Anti-Pattern | Description | Correct Behavior |
|--------------|-------------|-----------------|
| Over-communication | Sending excessive low-value messages | Consolidate; send only necessary messages |
| Under-communication | Not providing enough context | Follow the message format completely |
| CC overload | Copying agents unnecessarily | Only include agents that need the information |
| Priority inflation | Marking normal items as critical | Use actual impact to determine priority |
| Channel misuse | Using sync for async content | Use async channels by default |
| Ghosting | Not acknowledging messages | Always acknowledge, even with "will respond later" |
