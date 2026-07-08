# Stage 01: Requirement

## Purpose

Transform a high-level business capability from the blueprint into a well-defined, testable requirement with clear acceptance criteria.

## Agent Role

**Business Analyst AI** — Responsible for eliciting, analyzing, and documenting requirements.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Blueprint Item | A business capability card exists in the blueprint with a priority label |
| Context Available | Relevant domain context, existing feature docs, and user research are accessible |
| Stakeholder Defined | At least one stakeholder or user persona is identified |

## Process

### Step 1: Analyze Business Capability
- Parse the blueprint card to extract the core business need.
- Identify related existing features by scanning the codebase and ADR history.
- Determine the user persona(s) affected.

### Step 2: Write Requirement Specification
- **Title**: Concise feature name.
- **Description**: 3-5 sentence narrative of what the feature does and why.
- **User Story**: `As a <persona>, I want <goal> so that <benefit>.`
- **Functional Requirements**: Numbered list of specific behaviors.
- **Non-Functional Requirements**: Performance, security, scalability constraints.

### Step 3: Define Acceptance Criteria
- Write 5-10 Gherkin-style scenarios:
  ```
  Scenario: <title>
    Given <precondition>
    When <action>
    Then <expected outcome>
  ```
- Cover happy path, error paths, edge cases, and security scenarios.
- Each criterion must be independently testable.

### Step 4: Validate Completeness
- Check INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable.
- Verify all acceptance criteria are unambiguous and quantitative where possible.
- Ensure traceability back to the original blueprint capability.

### Step 5: Submit for Approval
- Write the requirement artifact to `.requirement.md`.
- Set status to `PENDING_APPROVAL`.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Approved Requirement | Artifact status is `APPROVED` |
| Acceptance Criteria Set | Minimum 5 Gherkin scenarios covering happy + error paths |
| Blueprint Traceability | Requirement links back to original blueprint card ID |
| INVEST Compliant | All six INVEST criteria satisfied |
| No Ambiguity | Every requirement term has a single, clear interpretation |

## Artifact Template

```markdown
# Requirement: <Title>

**Blueprint Card**: `BP-<ID>`
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Description
<3-5 sentence narrative>

## User Story
As a <persona>, I want <goal> so that <benefit>.

## Functional Requirements
1. ...

## Non-Functional Requirements
1. ...

## Acceptance Criteria
### Scenario 1: <Title>
Given ...
When ...
Then ...

### Scenario 2: <Title>
...

## Dependencies
- List any upstream features or external systems

## Attachments
- Links to mockups, diagrams, or reference docs
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Insufficient acceptance criteria | Request BA AI to add minimum 5 scenarios |
| Requirement too large (epic) | Split into multiple smaller requirements and re-enter pipeline |
| Missing persona | Identify and document the affected user persona |
| Not testable | Reframe acceptance criteria with concrete, measurable outcomes |

## Cross-References

- [Pipeline README](./README.md)
- [Standards: Documentation Standards](../05-STANDARDS/Documentation-Standards.md)
