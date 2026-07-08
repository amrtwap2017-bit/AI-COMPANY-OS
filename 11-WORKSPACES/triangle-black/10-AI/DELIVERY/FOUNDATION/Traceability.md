# Traceability

> Every artifact must trace back to an approved business capability in the Enterprise Blueprint.

## Traceability Chain

```
Business Capability (Program 1)
    → Requirement
    → Architecture Decision
    → Database Schema
    → API Contract
    → Backend Implementation
    → Frontend Implementation
    → Tests
    → Documentation
    → Release Notes
```

## Required Metadata

Every generated artifact must include:

| Field | Description | Example |
|-------|-------------|---------|
| `trace-to` | Source business capability ID | `LEA-01` (Lead Capture) |
| `trace-adr` | Architecture decision reference | `ADR-012` |
| `trace-requirement` | Requirement ID | `REQ-2026-00142` |
| `sprint` | Sprint that produced this | `Sprint-005` |
| `agent` | AI agent that generated this | `Backend-Lead-AI` |

## Traceability in Code

```typescript
/**
 * trace-to: LEA-01
 * trace-adr: ADR-012
 * trace-requirement: REQ-2026-00142
 * sprint: Sprint-005
 * agent: Backend-Lead-AI
 */
export class LeadService {
  // Implementation
}
```

## Traceability in Documentation

```markdown
---
trace-to: LEA-01
trace-adr: ADR-012
trace-requirement: REQ-2026-00142
sprint: Sprint-005
agent: Documentation-Engineer-AI
---
```

## Validation

Before any artifact is accepted:
1. The trace-to field must reference a valid business capability ID from Program 1
2. The trace-adr field must reference an existing ADR
3. The sprint field must match an active sprint
4. The agent field must match an authorized agent role

Missing or invalid traceability metadata is a blocking quality gate failure.
