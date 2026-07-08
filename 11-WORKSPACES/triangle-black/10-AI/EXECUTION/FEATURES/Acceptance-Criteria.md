# Feature Acceptance Criteria

## Overview

Acceptance criteria define the specific conditions that must be met for a feature to be considered complete and acceptable. Well-written acceptance criteria ensure shared understanding between business stakeholders, developers, and testers. They form the basis for testing, validation, and feature sign-off.

## Standards for Effective Acceptance Criteria

### INVEST Principles

Each acceptance criterion should follow the INVEST mnemonic:

| Principle | Description | Example |
|-----------|-------------|---------|
| **I**ndependent | Criteria can be tested independently of others | "User can submit the form" vs. "User can submit and receive confirmation" |
| **N**egotiable | Scope is negotiable within the criteria | "Response time under 2 seconds" vs. "Response time exactly 1.5 seconds" |
| **V**aluable | Each criterion delivers clear value | "System validates email format" vs. "System checks field pattern" |
| **E**stimable | Criteria enable effort estimation | "Upload supports 10MB files" (testable effort estimate) |
| **S**mall | Criteria are granular enough to test | One condition per criterion, not compound conditions |
| **T**estable | Each criterion can be objectively verified | "Screen shows confirmation message" vs. "Screen looks good" |

### Characteristics of Good Criteria

- **Specific:** Use precise numbers, terms, and conditions
- **Measurable:** Define how compliance is verified
- **Actionable:** State what the system or user does
- **Relevant:** Focus on functional behavior, not implementation
- **Unambiguous:** Single interpretation only

## Given/When/Then Format

Acceptance criteria follow the Behavior-Driven Development (BDD) format:

### Structure

```
Scenario: {Descriptive scenario name}
Given {precondition(s)}
When {action or event}
Then {expected outcome(s)}
```

### Examples

**Simple Scenario:**
```
Scenario: Successful document upload
Given the user is authenticated and on the upload page
When the user selects a valid PDF file under 10MB and clicks "Upload"
Then the system displays a success message
And the document appears in the user's document list
And a confirmation email is sent to the user's registered address
```

**Error Scenario:**
```
Scenario: Upload failure due to file size
Given the user is authenticated and on the upload page
When the user selects a file larger than 10MB and clicks "Upload"
Then the system displays an error message "File size exceeds 10MB limit"
And the upload button remains enabled
And no file is saved to the system
```

**Edge Case Scenario:**
```
Scenario: Upload with special characters in filename
Given the user is authenticated and on the upload page
When the user selects a file with special characters in the name and clicks "Upload"
Then the system sanitizes the filename
And the upload completes successfully
And the stored filename contains only alphanumeric characters, hyphens, and underscores
```

### Scenario Organization

Features typically have multiple scenarios:

1. **Happy Path:** The primary successful flow
2. **Alternate Flow:** Variations of success (different inputs, user types)
3. **Error / Negative Path:** What happens when things go wrong
4. **Edge Cases:** Boundary conditions, empty states, unusual inputs

## Non-Functional Acceptance Criteria

In addition to behavioral criteria, features may have non-functional criteria:

| Category | Example Criterion |
|----------|------------------|
| Performance | "Page loads within 2 seconds on a 10Mbps connection" |
| Security | "All data transmitted over TLS 1.3" |
| Accessibility | "All form fields have associated labels for screen readers" |
| Scalability | "System handles 1000 concurrent users without degradation" |
| Reliability | "Feature has 99.9% availability during business hours" |
| Compatibility | "Feature works on Chrome, Firefox, and Safari latest 2 versions" |

## Acceptance Criteria Review Process

### Step 1: Authoring
Feature Owner or Business Analyst writes acceptance criteria during feature definition.

### Step 2: Peer Review
Acceptance criteria are reviewed by:
- **Product Owner:** Confirms criteria reflect business requirements
- **Developer:** Assesses technical feasibility and identifies gaps
- **QA Engineer:** Validates testability and coverage
- **UX Designer:** Verifies alignment with user experience design

### Step 3: Refinement
Criteria are refined based on review feedback:
- Ambiguous criteria are clarified
- Missing scenarios are added
- Unnecessary scenarios are removed
- Non-functional criteria are validated

### Step 4: Approval
Final acceptance criteria are approved by the Product Owner and added to the feature record.

### Step 5: Verification
During testing, each criterion is verified:
- Pass: Criteria met as specified
- Fail: Criteria not met, logged as defect
- Blocked: Cannot verify due to dependency or environment issue

## Common Mistakes

| Mistake | Why It's Problematic | Better Approach |
|---------|---------------------|-----------------|
| Vague language ("fast", "easy", "user-friendly") | Not testable, subjective | Use specific metrics ("under 2 seconds") |
| Multiple conditions in one criterion | Cannot determine which part failed | Split into individual criteria |
| Implementation details | Restricts developer approach | Focus on behavior, not code |
| Missing error scenarios | Assumes only happy path | Include error, edge case, and boundary scenarios |
| Overly complex scenarios | Difficult to test and maintain | Keep scenarios focused on one behavior |
| Assumptions about UI layout | Brittle when UI changes | Focus on behavior, not pixel position |
| Too many criteria per feature | Analysis paralysis | Focus on the essential 80% (5-12 scenarios per feature) |

## Acceptance Criteria Template

```yaml
Feature: FEAT-{NNN}: {Feature Title}

Acceptance Criteria:
  - Scenario: {Name}
    Given: {Precondition}
    When: {Action}
    Then: {Expected outcome 1}
    And: {Expected outcome 2}

  - Scenario: {Name}
    Given: {Precondition}
    When: {Action}
    Then: {Expected outcome}

Non-Functional Criteria:
  - {Category}: {Criterion}

Reviewed By:
  Product Owner: {Name} - {Date}
  Developer: {Name} - {Date}
  QA: {Name} - {Date}
  UX: {Name} - {Date}

Approved By: {Name} - {Date}
```
