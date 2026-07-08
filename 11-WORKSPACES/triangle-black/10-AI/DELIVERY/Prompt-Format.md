# Standard Prompt Format

> Defines the standard prompt format for all AI agents in the Enterprise AI Delivery Framework.

## Purpose

Standard prompts ensure every agent receives consistent, complete, and unambiguous instructions regardless of the agent role or task type. The format is designed for model-agnostic use.

## Prompt Structure

Every prompt consists of exactly four sections in this order:

```
# SYSTEM IDENTITY
# CONTEXT
# TASK
# OUTPUT REQUIREMENTS
```

No additional sections may be added. No section may be omitted.

## Section 1: System Identity

Defines who the agent is and what boundaries it operates within.

```markdown
You are the [Agent Role Name] in the Enterprise AI Delivery Framework.

Your authority level: [Level 0-4]
Your supervisor: [Supervisor Role]
Your domain: [Bounded Context or Domain]

You MUST follow:
- Enterprise Principles (15 core principles)
- AI Constitution (10 immutable articles)
- Architecture Baseline (technology constraints)

You MUST NOT:
- Invent requirements not in the context
- Modify architecture baseline without ADR
- Skip any delivery pipeline stage
- Approve your own work
```

### Rules for System Identity
- Role name must match exactly from `MASTER-CONTEXT.md`
- Authority level must match from `Decision-Matrix.md`
- Supervisor must match from `Escalation.md`
- Do not add capabilities the agent does not have

## Section 2: Context

The minimum information the agent needs to perform its task.

```markdown
## Current Task
Task ID: [TASK-NNN]
Task Type: [Requirement / Architecture / Code / Test / Doc / Review / Merge]
Priority: [Critical / High / Normal / Low]
Sprint: [Sprint Number]
Feature: [Feature Name]

## Domain Context
Bounded Context: [Context Name]
Business Rules: [Relevant rules from domain documentation]
Entities: [Relevant entity definitions]

## Technical Context
Architecture Baseline: [Relevant sections]
ADRs: [Relevant ADR references]
API Contracts: [If applicable]
Database Schema: [If applicable]
Coding Standards: [If applicable]

## Dependencies
This task depends on: [Task IDs or artifact references]
This task is depended on by: [Task IDs or artifact references]

## Related Artifacts
[Links to requirements, ADRs, or other relevant documents]
```

### Context Injection Rules
1. **Minimum necessary** — Include only the context the agent needs for the task
2. **No full repository** — Never include the entire repository
3. **References over content** — Reference documents rather than including them inline, except when the referenced content is small (< 500 words)
4. **Relevant subset only** — For large documents (architecture baseline, business rules), include only the relevant sections
5. **Traceability** — Every context item must be traceable to a source document
6. **No conversation history** — Previous sessions are loaded from memory, not included in the prompt

## Section 3: Task

The specific work the agent must perform.

```markdown
## Task
[Clear, specific description of what to do]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Scope
IN SCOPE:
- [What the agent should do]

OUT OF SCOPE:
- [What the agent should NOT do]

### Constraints
- [Constraint 1]
- [Constraint 2]

### References
- [Document 1]: [Relevant section or page]
- [Document 2]: [Relevant section or page]
```

### Task Rules
1. **Single responsibility** — One task per prompt. If multiple tasks are needed, split into multiple prompts.
2. **Unambiguous** — The task must be clear without requiring interpretation
3. **Measurable** — Acceptance criteria must be objectively verifiable
4. **Scoped** — Explicit in-scope and out-of-scope boundaries
5. **Referenced** — All constraints must reference a source document

## Section 4: Output Requirements

Defines what the agent must produce and in what format.

```markdown
## Output Requirements

### Deliverable
[Description of what to produce: file(s), artifact(s), decision(s)]

### Format
[File format: Markdown, TypeScript, SQL, YAML, etc.]

### Location
[Where to save the output: path convention]

### Quality Gates Required
- [ ] Gate 1: [Check description]
- [ ] Gate 2: [Check description]

### Traceability
- Source requirement: [Req ID]
- Source ADR: [ADR ID if applicable]
- Artifact ID: [To be assigned]
```

### Output Rules
1. **Explicit format** — The output format must be specified, not assumed
2. **Quality checks** — Each output requirement maps to a quality gate check
3. **Traceable** — Every output must link to its source requirement
4. **Complete** — The agent must produce all required outputs, not partial
5. **Validated** — Output must pass automated validation before submission

## Complete Prompt Example

```markdown
You are the Database Architect AI in the Enterprise AI Delivery Framework.

Your authority level: 3
Your supervisor: Solution Architect AI
Your domain: Data Architecture

You MUST follow:
- Enterprise Principles (15 core principles)
- AI Constitution (10 immutable articles)
- Architecture Baseline (technology constraints)

You MUST NOT:
- Invent requirements not in the context
- Modify architecture baseline without ADR
- Skip any delivery pipeline stage
- Approve your own work

## Current Task
Task ID: TASK-042
Task Type: Database Schema
Priority: High
Sprint: Sprint 4
Feature: Payment Processing Module

## Domain Context
Bounded Context: Payment
Business Rules:
- Payments must be immutable once processed
- Refunds create new payment records (not modifications)
- All payments must have audit trail

Entities: Payment, Refund, PaymentMethod, PaymentStatus

## Technical Context
Architecture Baseline: PostgreSQL 16, Prisma 6 ORM
ADRs: ADR-012 (Database naming conventions)
Database Schema: Existing schema at /database/schema.prisma

## Dependencies
This task depends on: ADR-012, API-Contracts/payment.yaml
This task is depended on by: TASK-043 (Backend Payment Implementation)

## Task
Create the database schema for the Payment Processing Module.

### Acceptance Criteria
- [ ] All Payment entities are modeled with proper relationships
- [ ] Schema follows ADR-012 naming conventions
- [ ] Migration is reversible
- [ ] Indexes defined for all foreign keys and query patterns
- [ ] Audit fields included on all tables

### Scope
IN SCOPE: Payment, Refund, PaymentMethod tables
OUT OF SCOPE: User account changes, billing address tables

### Constraints
- Must use Prisma 6 schema format
- All monetary values use decimal type
- Timestamps in UTC

## Output Requirements

### Deliverable
Prisma schema file for the Payment module

### Format
Prisma Schema Language (.prisma)

### Location
/database/schemas/payment.prisma

### Quality Gates Required
- [ ] GATE-DB: All database naming standards met
- [ ] GATE-DB: Primary keys on all tables
- [ ] GATE-DB: Reversible migration

### Traceability
- Source requirement: REQ-015 (Payment Processing)
- Source ADR: ADR-012
```

## Prompt Versioning

All prompts are versioned:
- Version number in the prompt header: `Prompt Version: 1.0`
- Changes to prompt format require an ADR
- Prompt versions are tracked in CHANGELOG

## Prompt Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Context dumping | Including irrelevant context increases token usage and noise | Filter to only what's needed |
| Ambiguous tasks | "Implement the feature" is not actionable | Break down into specific deliverables |
| Missing constraints | Agent may choose wrong approach | Always define in-scope and out-of-scope |
| No output format | Agent may produce wrong format | Always specify format and location |
| Missing traceability | Artifact cannot be traced to requirement | Always include traceability section |
