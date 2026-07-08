# Context Pack Validation

## Purpose

Validates that a context pack is complete, consistent, and ready before it is sent to an AI agent for code generation.

## Validation Rules

### 1. Completeness Check

Every context pack must contain these required sections:

| Section | Required | Validation Rule |
|---------|----------|----------------|
| Domain Overview | Yes | At least 3 paragraphs describing domain |
| Entity Definitions | Yes | At least 1 entity defined |
| API Endpoints | Yes | At least 1 endpoint per entity |
| Acceptance Criteria | Yes | At least 5 ACs per capability |
| Dependency References | Yes | Must list all dependencies |
| Data Model | Yes | ERD or table definitions |
| Business Rules | Yes | At least 3 business rules |

**Failure**: Missing section → Critical severity, pack rejected.

### 2. Dependency Check

All dependencies declared in the context pack must be resolved:

| Check | Rule |
|-------|------|
| Cross-domain dependencies | References must point to existing domains |
| Entity references | FK references must exist in referenced domain |
| API dependencies | Endpoint references must be defined elsewhere |

**Failure**: Unresolved dependency → High severity, pack rejected.

### 3. Version Check

| Check | Rule |
|-------|------|
| Pack version | Must increment from previous version |
| Domain version | Must match current domain version |
| Program version | Must match active Program 2.5 version |

**Failure**: Version mismatch → Medium severity, pack flagged.

### 4. Traceability Check

Every element must trace back to a source:

| Element | Source | Check |
|---------|--------|-------|
| Acceptance Criteria | User story or requirement ID | AC-001 pattern |
| Entity | Data model specification | Entity name matches spec |
| Endpoint | API specification | Route matches spec |
| Business Rule | Business process document | Rule ID present |

**Failure**: Untraced element → Medium severity, pack flagged.

## Validation Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Pack        │────→│ Completeness│────→│ Dependency  │────→│   Result    │
│ Submitted   │     │ Check       │     │ Check       │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                                      │
                           ▼                                      ▼
                    ┌─────────────┐                        ┌─────────────┐
                    │ Version     │                        │ Pass/Fail   │
                    │ Check       │                        │ Report      │
                    └─────────────┘                        └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Traceability│
                    │ Check       │
                    └─────────────┘
```

## Output

Validation produces a report with:

- **Status**: Pass / Fail / Flagged
- **Issues**: List of all issues found with severity
- **Recommendations**: Suggested fixes for each issue
- **Score**: Completeness percentage (target > 90%)
