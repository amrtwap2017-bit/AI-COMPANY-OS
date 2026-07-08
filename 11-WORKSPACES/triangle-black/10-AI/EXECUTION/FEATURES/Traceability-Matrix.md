# Feature Traceability Matrix

## Overview

The Feature Traceability Matrix (FTM) provides end-to-end traceability from strategic business capabilities through to delivered tests. Traceability ensures that every feature can be traced back to a business need and that all requirements are validated through testing. This creates a complete chain of accountability and verification.

## Traceability Chain

```
Enterprise Blueprint (Program 1)
    │
    ├── Business Capability
    │       │
    │       ├── Strategic Objective
    │       │
    │       v
    │   Epic
    │       │
    │       v
    │   Feature  ◄── Requirement
    │       │               │
    │       ├── Entity      │
    │       ├── API         │
    │       ├── Screen      │
    │       └── Test ───────┘
    │
    v
  Delivered Value
```

## Traceability Dimensions

### 1. Feature to Business Capability (Program 1)
Traces features upward to the business capabilities defined in the Enterprise Blueprint.

| Feature | Business Capability | Map to Objective |
|---------|-------------------|------------------|
| FEAT-{NNN} {Title} | CAP-{NNN} {Capability} | {Strategic objective} |
| FEAT-{NNN} {Title} | CAP-{NNN} {Capability} | {Strategic objective} |

**Validation:** Every feature must have at least one business capability mapping inherited from its parent epic.

### 2. Feature to Epic
Traces features to their parent epic.

| Feature ID | Feature Title | Epic ID | Epic Title |
|-----------|--------------|---------|------------|
| FEAT-{NNN} | {Title} | EPIC-{NNN} | {Title} |
| FEAT-{NNN} | {Title} | EPIC-{NNN} | {Title} |

**Validation:** Each feature belongs to exactly one epic. Epics without features are flagged.

### 3. Feature to Requirements
Traces features to specific functional and non-functional requirements.

| Feature | Requirement ID | Requirement | Type |
|---------|---------------|-------------|------|
| FEAT-{NNN} | REQ-{NNN} | {Requirement text} | Functional / Non-functional |
| FEAT-{NNN} | REQ-{NNN} | {Requirement text} | Functional / Non-functional |

**Validation:** Each requirement must trace to at least one feature. Orphan requirements are flagged.

### 4. Feature to Entities
Traces features to the business entities (data models, domain objects) they affect.

| Feature | Entity | CRUD Operation | Description |
|---------|--------|---------------|-------------|
| FEAT-{NNN} | {Entity name} | Create/Read/Update/Delete | {How the feature interacts} |
| FEAT-{NNN} | {Entity name} | Read | {How the feature interacts} |

**Validation:** All entities modified by a feature are documented. Unchanged entities are excluded.

### 5. Feature to APIs
Traces features to the APIs they expose or consume.

| Feature | API Endpoint | Method | Direction | Contract |
|---------|-------------|--------|-----------|----------|
| FEAT-{NNN} | /api/v1/{resource} | GET/POST/PUT/DELETE | Internal/External | {Link to spec} |
| FEAT-{NNN} | /api/v1/{resource} | GET/POST/PUT/DELETE | Internal/External | {Link to spec} |

**Validation:** Every API endpoint is linked to a feature. Orphan endpoints are flagged for review.

### 6. Feature to Screens/UI
Traces features to the user interface screens they affect.

| Feature | Screen | Component | Interaction |
|---------|--------|-----------|-------------|
| FEAT-{NNN} | {Screen name} | {Component(s)} | {Description of interaction} |
| FEAT-{NNN} | {Screen name} | {Component(s)} | {Description of interaction} |

**Validation:** All new or modified UI elements are documented. Design assets are linked.

### 7. Feature to Tests
Traces features to the tests that validate them.

| Feature | Test ID | Test Type | Test Case | Status |
|---------|---------|-----------|-----------|--------|
| FEAT-{NNN} | TC-{NNN} | Unit/Integration/E2E | {Description} | Pass/Fail/Blocked |
| FEAT-{NNN} | TC-{NNN} | Unit/Integration/E2E | {Description} | Pass/Fail/Blocked |

**Validation:** Each acceptance criterion must have at least one associated test case. Untested criteria are flagged.

## Traceability Matrix Template

```yaml
Matrix ID: FTM-{EPIC-NNN}
Epic: EPIC-{NNN}: {Epic Title}
Generated: {YYYY-MM-DD}

Features:
  - Feature ID: FEAT-{NNN}
    Title: {Feature Title}
    Capability: CAP-{NNN}
    Requirements:
      - {REQ-{NNN}: Requirement description}
    Entities:
      - {Entity}: {CRUD}
    APIs:
      - {Endpoint}: {Method}
    Screens:
      - {Screen}: {Components}
    Tests:
      - {Test ID}: {Type} - {Status}

  - Feature ID: FEAT-{NNN}
    Title: {Feature Title}
    ...
```

## Traceability Validation Process

### Continuous Validation

Events that trigger traceability validation:
1. **Feature creation:** New features inherit epic's business capability mapping
2. **Feature modification:** Updated feature attributes checked against traceability rules
3. **Requirement change:** Affected features are flagged for re-validation
4. **Test creation:** New tests are linked to features and acceptance criteria
5. **Epic closure:** Full traceability audit is performed before acceptance

### Validation Rules

| Rule | Description | Violation Severity |
|------|-------------|-------------------|
| Feature must map to capability | Via epic linkage | High |
| Feature must have acceptance criteria | At least one criterion | High |
| Each criterion must have a test | At least one test per criterion | Medium |
| Feature must trace to an entity | If feature modifies data | Medium |
| API endpoints must trace to feature | No orphan endpoints | Medium |
| Screens must trace to feature | New/ modified screens tracked | Low |
| Requirements must trace to feature | No orphan requirements | High |

### Validation Frequency

| Check | Frequency | Automated? |
|-------|-----------|-----------|
| Feature-to-epic linkage | Daily | Yes |
| Feature-to-capability mapping | Weekly | Yes |
| Feature-to-requirement tracing | Per feature change | Yes |
| Feature-to-test coverage | Per test run | Yes |
| Full traceability audit | Pre-release | Partially |
| Pre-closure traceability audit | Epic completion | Partially |

## Reports

### Traceability Coverage Report
Percentage of features with complete traceability across all dimensions:
- Feature to capability: {X}%
- Feature to requirements: {X}%
- Feature to entities: {X}%
- Feature to APIs: {X}%
- Feature to screens: {X}%
- Feature to tests: {X}%

### Traceability Gap Report
Features with incomplete traceability, organized by gap type and severity.

### Impact Analysis Report
When a capability, requirement, or entity changes, this report identifies all affected features, tests, and epics.
