# Architecture Decision Record Workflow

> Complete lifecycle of an Architecture Decision Record (ADR) from creation through implementation and superseding.

## What is an ADR?

An Architecture Decision Record is a permanent document that captures a significant architectural decision, including the context, alternatives considered, and rationale. ADRs form the permanent decision log of the system.

## When to Create an ADR

An ADR is **required** when:

- Introducing a new technology, library, framework, or infrastructure component
- Changing the architecture baseline
- Modifying a domain boundary or bounded context
- Making a breaking change to the database schema
- Adding a new integration with an external system
- Changing the deployment model or CI/CD architecture
- Modifying security policies or authentication architecture
- Changing the API versioning strategy
- Making any Level 1 or Level 2 decision as defined in Decision-Matrix.md
- Overriding a quality gate
- Making an exception to the AI Constitution

An ADR is **recommended** when:
- Selecting a design pattern for a complex module
- Choosing between two significant implementation approaches
- Making a decision with long-term consequences

An ADR is **not needed** when:
- Making routine operational decisions
- Implementing standard patterns without modification
- Making trivial implementation choices

## ADR Template

Every ADR follows the template defined in `06-TEMPLATES/ADR-Template.md`. The required sections are:

| Section | Required | Description |
|---------|----------|-------------|
| Title & ID | Yes | ADR-NNN with descriptive title |
| Status | Yes | Proposed, Accepted, Deprecated, Superseded |
| Date | Yes | Creation date |
| Author | Yes | Agent role that created the ADR |
| Context | Yes | Problem description and motivation |
| Decision | Yes | The decision itself, with scope boundaries |
| Alternatives Considered | Yes | At least 2 alternatives with pros/cons |
| Decision Rationale | Yes | Why this alternative was chosen |
| Consequences | Yes | Positive, negative, and neutral impacts |
| Compliance | Yes | How compliance will be verified |
| Notes | No | Additional references or follow-up items |

## ADR Lifecycle

```
                    ┌──────────────┐
                    │   Proposed   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Reviewed   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐  ┌────▼────┐  ┌───▼────────┐
     │  Approved   │  │Rejected │  │ Needs Work │
     └────────┬───┘  └─────────┘  └───┬────────┘
              │                        │
     ┌────────▼───┐                   │
     │Implemented │                   │
     └────────┬───┘                   │
              │                       │
     ┌────────▼───┐                  │
     │  Accepted  │◄─────────────────┘
     └────────┬───┘
              │
     ┌────────▼───┐       ┌──────────────┐
     │ Superseded │◄──────│ New ADR      │
     └────────────┘       │ supersedes   │
                          │ this one     │
                          └──────────────┘
```

## Step-by-Step ADR Workflow

### Step 1: Identify Need
The agent identifies a decision that requires an ADR (per criteria above).

### Step 2: Draft ADR
The agent creates the ADR using the template:
1. Assign the next available ADR number from the ADR register
2. Fill all required sections
3. Document at least 2 viable alternatives
4. State a clear recommendation with rationale
5. Set status to **Proposed**

### Step 3: Review
The ADR is submitted for review:

| ADR Type | Reviewer | Review SLA |
|----------|----------|------------|
| Technology introduction | Chief Enterprise Architect AI | 24 hours |
| Architecture baseline change | Chief Enterprise Architect AI | 24 hours |
| Domain boundary change | Chief Enterprise Architect AI + Program Manager AI | 48 hours |
| Database breaking change | Solution Architect AI + Database Architect AI | 24 hours |
| Security policy change | Security Architect AI + Chief Enterprise Architect AI | 24 hours |
| Integration change | Solution Architect AI + DevOps Architect AI | 24 hours |
| Standard ADR | Solution Architect AI | 12 hours |

### Step 4: Review Outcome

| Outcome | Action |
|---------|--------|
| **Approved** | Reviewer sets status to Approved. Proceed to implementation. |
| **Rejected** | Reviewer sets status to Rejected with rationale. ADR is archived. Creator may appeal to next level. |
| **Needs Work** | Reviewer provides specific feedback. Creator revises and resubmits. |

### Step 5: Implementation
1. The decision in the approved ADR is implemented
2. Implementation artifacts reference the ADR ID
3. The implementing agent updates the ADR status to **Implemented**
4. Architecture baseline is updated if applicable

### Step 6: Acceptance
After implementation is verified:
1. The ADR status moves to **Accepted**
2. The ADR is added to the permanent decision register
3. All affected agents are notified

### Step 7: Superseding
When a later ADR replaces this one:
1. The new ADR references the superseded ADR: "Supersedes ADR-NNN"
2. The superseded ADR status is updated to **Superseded by ADR-MMM**
3. Both ADRs remain in the permanent record

## ADR Numbering

ADRs are numbered sequentially: `ADR-NNN` where NNN is a zero-padded integer.

- ADR-001 through ADR-999
- Numbers are never reused
- If an ADR is rejected, its number is retired
- The ADR register tracks assigned and available numbers

## ADR Register

The ADR register is maintained in `02-DECISION-RECORDS.md` at the program root:

```markdown
## ADR Register

| ID | Title | Status | Date | Author | Superseded By |
|----|-------|--------|------|--------|---------------|
| ADR-001 | Technology Stack Selection | Accepted | 2026-01-15 | Chief Enterprise Architect AI | — |
| ADR-002 | Database Schema Naming Convention | Accepted | 2026-01-20 | Database Architect AI | — |
| ADR-003 | API Versioning Strategy | Proposed | 2026-02-01 | Solution Architect AI | — |
```

## ADR Approval Thresholds

| Decision Type | Requires | Additional |
|---------------|----------|------------|
| Level 1 (Strategic) | Chief Enterprise Architect AI + CEO | Human approval documented |
| Level 2 (Architectural) | Chief Enterprise Architect AI | Standard review |
| Quality gate waiver | Chief Enterprise Architect AI | Must include risk assessment |
| Security exception | Security Architect AI + Chief Enterprise Architect AI + CEO | Human approval required |

## ADR Compliance Verification

Every agent implementing an ADR decision must:
1. Reference the ADR ID in the implementation artifact
2. Verify the implementation matches the decision
3. Flag any deviation immediately to the ADR author

Compliance is verified by:
- Code Review AI during the review stage
- Chief Enterprise Architect AI during architecture audits
- Documentation Engineer AI for documentation alignment

## Superseding Rules

1. Only an Accepted ADR can be superseded
2. The superseding ADR must explain why the previous decision is no longer valid
3. The superseded ADR is not deleted — it remains in the record with updated status
4. All artifacts referencing the superseded ADR must be updated within 2 sprints
5. The superseding ADR must include a migration plan if the change is breaking
