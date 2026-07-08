# Context Transfer Protocol

> How context is transferred between AI agents during pipeline stage transitions, including handover format, context packet structure, compression, and lossless transfer guarantees.

## Context Transfer Principles

1. **Lossless** — No information is lost during transfer between agents
2. **Minimal** — Only the context needed by the receiving agent is transferred
3. **Structured** — Context follows a defined packet format
4. **Verifiable** — Receiver confirms receipt and comprehension
5. **Auditable** — All transfers are logged for traceability

## Context Transfer Points

Context is transferred at every pipeline stage boundary:

```
REQ → VAL → ARC → DB → API → BE → FE → QA → SEC → PERF → DOC → REV → MRG → RLS
```

At each arrow, the source agent produces a context packet for the destination agent.

## Context Packet Structure

```markdown
CONTEXT PACKET
══════════════
ID: CP-001
Pipeline Stage: [Source Stage] → [Destination Stage]
Date: YYYY-MM-DD HH:MM UTC
Task ID: [TASK-NNN]

SOURCE
──────
Agent: [Role]
Session: [Session ID]

DESTINATION
───────────
Agent: [Role]
Session: [Pending]

ARTIFACTS PRODUCED
──────────────────
- [Artifact ID]: [Description] — [Status]
- [Artifact ID]: [Description] — [Status]

DECISIONS MADE
──────────────
- Decision: [Decision]
  Rationale: [Rationale]
  Reference: [ADR or document link]

OPEN ITEMS
──────────
- [Issue 1] — Action required from destination
- [Issue 2] — Action required from destination

REJECTED ALTERNATIVES
─────────────────────
- Alternative: [Description]
  Reason for rejection: [Rationale]

CONTEXT FOR NEXT STAGE
──────────────────────
[Domain-specific context the next agent needs]

SUMMARY
───────
[Executive summary of what was done and what comes next]
```

## Stage-Specific Context Packets

### REQ → VAL (Requirements to Validation)

```markdown
## Artifacts Produced
- REQ-015: Payment Processing Requirement — Draft
- US-042: User views payment history — Draft

## Context for Validation
- Business capability: Billing and Payments (Program 1)
- Stakeholder: Finance Department
- Priority: High
- Dependencies: Payment gateway integration (external)
- Assumptions: PCI-DSS compliance required
```

### VAL → ARC (Validation to Architecture)

```markdown
## Artifacts Produced
- REQ-015: Payment Processing Requirement — Validated
- US-042: User views payment history — Validated
- AC-015-01 through AC-015-12 — Defined

## Context for Architecture
- Validated requirements with acceptance criteria
- Business rules for payment processing
- Integration points identified
- Security requirements flagged
- Performance expectations: < 2 second payment processing
```

### ARC → DB (Architecture to Database)

```markdown
## Artifacts Produced
- ADR-012: Technology stack confirmed
- API-022: Payment API contract — Draft
- DM-002: Payment domain model

## Context for Database
- Domain model with entities: Payment, Refund, PaymentMethod
- Relationships: Payment 1→* Refund, Payment *→1 PaymentMethod
- Estimated volume: 10K transactions/day
- Query patterns: Lookup by user, by date range, by status
```

### DB → API (Database to API)

```markdown
## Artifacts Produced
- DB-007: Payment schema — Implemented
- MIG-008: Create payment tables — Pending review

## Context for API
- Schema structure with table and column definitions
- Data types for all fields
- Indexes defined
- Audit fields included
- Migration plan
```

### API → BE (API to Backend)

```markdown
## Artifacts Produced
- API-022: Payment API contract — Approved
- OpenAPI Specification: payment-api.yaml

## Context for Backend
- Full API contract
- Request/response models
- Error codes defined
- Authentication requirements
- Rate limiting configuration
```

### BE → FE (Backend to Frontend)

```markdown
## Artifacts Produced
- BE-015: Payment service implementation — Implemented
- API-022-IMPL: Payment endpoints — Implemented

## Context for Frontend
- API endpoints available
- Response models
- Error handling patterns
- Loading states required
- WebSocket events (if applicable)
```

### FE → QA (Frontend to QA)

```markdown
## Artifacts Produced
- FE-032: Payment form component — Implemented
- FE-033: Payment history page — Implemented

## Context for QA
- User flows implemented
- Edge cases identified
- Browser support matrix
- Accessibility considerations
- Known limitations
```

### QA → SEC (QA to Security)

```markdown
## Artifacts Produced
- TP-005: Payment test plan — Approved
- TS-015: Payment test suite — Passing

## Context for Security
- Test results summary
- All code paths exercised
- Integration points with external systems
- Data sensitivity classification
- Authentication and authorization flows
```

### SEC → PERF (Security to Performance)

```markdown
## Artifacts Produced
- SR-004: Payment security review — Approved

## Context for Performance
- Security controls implemented
- Encryption overhead to account for
- Authentication overhead
- Rate limiting thresholds
- No blocking security findings
```

### PERF → DOC (Performance to Documentation)

```markdown
## Artifacts Produced
- PR-002: Payment API performance report — Approved

## Context for Documentation
- Performance characteristics
- Response time percentiles
- Throughput capacity
- Scalability limits
- Caching strategy
```

### DOC → REV (Documentation to Review)

```markdown
## Artifacts Produced
- DOC-042: Payment API documentation — Draft
- RN-005: Sprint 4 release notes — Draft

## Context for Review
- All artifacts ready for final review
- Known issues documented
- API documentation complete
- User-facing documentation written
- Release notes drafted
```

## Context Compression Rules

To minimize token usage, context packets follow these compression rules:

1. **Include references, not content** — Reference documents by ID and version; do not include full document content
2. **Summarize decisions** — Include decisions and rationale, not the full deliberation
3. **State only what changed** — If the context is an update, include only the delta
4. **Rejected alternatives** — Include only name and rejection reason (omit full pros/cons)
5. **Open items** — Include only items requiring action from the destination agent
6. **Truncate large datasets** — For large data (schemas, test results), summarize and reference

### Compression Example

**Before (uncompressed):**
```
The API endpoint POST /api/payments accepts a JSON body with fields: amount (decimal, required),
currency (string, required, ISO 4217), paymentMethodId (string, required), description (string,
optional, max 500 chars), metadata (object, optional). It returns a 201 response with the
payment object, or a 400 with validation errors, 401 for authentication failure, 402 if payment
declined, 409 for duplicate transaction.
```

**After (compressed):**
```
API: POST /api/payments — see API-022 for full contract.
Key points: ISO 4217 currency, idempotency key required, returns 201/400/401/402/409.
```

## Lossless Transfer Guarantee

To ensure lossless transfer, each context transfer follows this protocol:

### Transfer Steps
```
1. SOURCE PACKAGES: Source agent creates context packet
2. SOURCE VALIDATES: Source verifies packet contains all required sections
3. SOURCE SENDS: Source delivers packet to destination agent's queue
4. DESTINATION RECEIVES: Destination acknowledges receipt
5. DESTINATION VALIDATES: Destination reviews packet for completeness
6. DESTINATION CONFIRMS: Destination confirms full comprehension
7. SOURCE RELEASED: Source is released from context duty
```

### Confirmation Protocol
```markdown
CONTEXT TRANSFER CONFIRMATION
═════════════════════════════
ID: CTC-001
Packet ID: CP-001

DESTINATION CONFIRMS:
- [x] All artifacts received and accessible
- [x] All decisions understood
- [x] All open items acknowledged
- [ ] Clarification needed: [Question about unclear item]

QUESTIONS / CLARIFICATIONS:
- [Question 1]
- [Question 2]

DESTINATION READY TO PROCEED: [Yes / No — waiting on clarification]
```

### Clarification Handling
If the destination needs clarification:
1. Destination records specific question in confirmation
2. Source responds within 1 hour
3. Destination confirms comprehension after clarification
4. Three clarification cycles max; after that, escalate to Program Manager AI

### Transfer Failure Handling

| Failure Mode | Detection | Resolution |
|--------------|-----------|------------|
| Packet not received | No acknowledgement within SLA | Source resends; verify routing |
| Packet corrupted | Validation fails | Source regenerates and resends |
| Incomplete packet | Destination flags missing sections | Source completes and resends |
| Incomprehensible content | Destination requests clarification | Source provides clarification |
| Lossy compression | Destination identifies missing info | Source provides full context for missing items |
