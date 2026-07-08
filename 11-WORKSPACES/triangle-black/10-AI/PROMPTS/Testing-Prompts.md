# Testing Prompts — Enterprise AI Delivery Framework

> **Framework:** AI Constitution v1.0
> **Model Requirement:** All prompts are model-agnostic.
> **Context Injection Point:** `[INSERT DOMAIN CONTEXT — business glossary, system architecture, organizational chart]`
> **Output Format:** Each test prompt produces test file(s) with traceability.

---

## 1. Write Unit Tests

**Prompt:**
```
You are acting as a Developer operating under the AI Constitution.
Write unit tests for the following code:

Source File(s): [INSERT FILE PATHS]
Function/Component Under Test: [INSERT NAME]
Test Framework: [INSERT — e.g., Jest, Vitest, pytest, JUnit]
Existing Test File: [INSERT TEST FILE PATH — or create new one at [path]]

Test Requirements:
- Cover all exported functions and methods
- Cover all branches and decision points (if/else, switch, ternary)
- Cover happy path, error path, and edge cases
- Use descriptive test names following the pattern:
  - "[method] should [expected behavior] when [condition]"
- Mock external dependencies (database, API calls, file system)
- Use project test utilities and factories for test data

Edge Cases to Consider:
- Null / undefined / empty inputs
- Boundary values (min, max, zero, negative)
- Invalid data types
- Concurrent or race conditions
- Exception propagation

Code Coverage Target:
- Lines: [X%]
- Branches: [X%]
- Functions: [X%]

Output Format:
- Test file with imports and test cases
- Summary of test scenarios covered
- Instructions to run: [INSERT COMMAND]
- Traceability to [US-XXX] / [REQ-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — unit tests are the first line of quality defense
```

## 2. Write Integration Tests

**Prompt:**
```
You are acting as a QA Developer operating under the AI Constitution.
Write integration tests for the following scope:

Scope: [INSERT — e.g., "Order creation flow: API → Service → Database → Event"]
Related User Story: [INSERT US-XXX]
API Specification: [INSERT LINK TO API SPEC]
Test Framework: [INSERT — e.g., SuperTest + Jest, pytest + httpx]

Integration Points:
- [INSERT — e.g., "POST /api/v1/orders"]
- [INSERT — e.g., "OrderService.createOrder()"]
- [INSERT — e.g., "orders table insert + inventory update"]
- [INSERT — e.g., "OrderCreated event published to Kafka"]

Test Requirements:
- Set up test database with known state
- Execute the full integration flow end-to-end
- Verify database state after operation
- Verify side effects (events, notifications, audit logs)
- Clean up test data after test execution
- Test failure scenarios: invalid input, missing resources, concurrent access

Environment Setup:
- Database: [INSERT — e.g., "test PostgreSQL instance with Flyway migrations"]
- Message Queue: [INSERT — e.g., "in-memory Kafka (Redpanda or Testcontainers)"]
- External APIs: [INSERT — e.g., "mocked with WireMock"]

Output Format:
- Integration test file(s)
- Test data setup script
- Docker Compose or Testcontainers configuration if applicable
- Summary of test scenarios
- Traceability to [US-XXX] / [REQ-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — integration tests verify system behavior
- Article V: Risk Management — integration points are high-risk areas
```

## 3. Write E2E Tests

**Prompt:**
```
You are acting as a QA Developer operating under the AI Constitution.
Write end-to-end tests for the following user journey:

User Journey: [INSERT — e.g., "User registers → confirms email → creates first order → views order history"]
User Story: [INSERT US-XXX]
Test Framework: [INSERT — e.g., Playwright, Cypress, Selenium]
Environment: [INSERT — e.g., "staging environment at https://staging.example.com"]

Test Requirements:
- Simulate real user interactions (click, type, navigate)
- Cover the full user journey from start to finish
- Verify UI state at each step (loading, success, error, empty)
- Assert on visible content, not implementation details
- Handle authentication (login, session management)

Page Objects (if applicable):
- [Page]: [INSERT PAGE CLASS / MODULE]
- [Page]: [INSERT PAGE CLASS / MODULE]

Scenarios:
1. **Happy Path:** [Describe the complete successful flow]
2. **Error Path:** [Describe what happens when something goes wrong]
3. **Edge Case:** [Describe unusual but valid scenario]

Test Data Strategy:
- Use API calls to set up test data before test
- Clean up test data after test (teardown)
- Isolate tests — no test should depend on another test's state

Output Format:
- E2E test file(s)
- Page object files (if using Page Object Model)
- Test data setup/teardown scripts
- Instructions to run: [INSERT COMMAND]
- Traceability to [US-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — E2E tests validate the integrated user experience
- Article VII: User Focus — tests reflect real user journeys
```

## 4. Generate Test Data

**Prompt:**
```
You are acting as a Developer operating under the AI Constitution.
Generate test data for the following:

Purpose: [INSERT — e.g., "load testing for order processing", "integration test data for user module"]
Data Model / Schema: [INSERT LINK TO DATABASE SCHEMA OR DATA MODEL]
Volume Requirement: [INSERT — e.g., "10,000 orders across 1,000 users"]
Output Format: [INSERT — e.g., "SQL INSERT statements / JSON file / CSV file"]

Data Requirements:
- Realistic data that respects domain constraints
- Variety in values to avoid uniform distribution bias
- Edge cases included: null fields, boundary dates, special characters
- Referential integrity maintained across related tables

Generation Rules:
- [INSERT RULE 1 — e.g., "Order total must equal sum of line items"]
- [INSERT RULE 2 — e.g., "Email addresses must be unique"]
- [INSERT RULE 3 — e.g., "Created dates must be in the past 90 days"]

Data Masking:
- Do not use real PII — generate fake but realistic data
- Use [INSERT Faker library] for data generation

Output Format:
- Data generation script (e.g., Python script, SQL script, or factory files)
- Generated output file(s)
- Data dictionary describing each field
- Instructions for loading data into test environment
- Traceability to [TEST-XXX] / [US-XXX]

Governance Reference (AI Constitution):
- Article VI: Security — no real PII in test data; use synthetic data
```

## 5. Review Test Coverage

**Prompt:**
```
You are acting as a QA Director operating under the AI Constitution.
Review test coverage for the following scope:

Scope: [INSERT — e.g., "User Registration module", "Sprint 12 deliverables"]
Coverage Report: [INSERT LINK TO COVERAGE REPORT]
Last Review Date: [INSERT DATE]
Quality Thresholds: [INSERT — e.g., "Lines > 80%, Branches > 70%", "No untested critical paths"]

Review Criteria:
1. **Coverage Metrics**
   - Line coverage: [Actual]% vs [Target]%
   - Branch coverage: [Actual]% vs [Target]%
   - Function coverage: [Actual]% vs [Target]%
   - Are there significant gaps?
2. **Test Quality**
   - Are tests meaningful (assertions, not just "no error")?
   - Are tests independent and deterministic?
   - Are there flaky tests?
3. **Risk Coverage**
   - Are critical business paths tested?
   - Are error/exception paths tested?
   - Are security-sensitive paths tested?
4. **Test Maintenance**
   - Are tests easy to understand and maintain?
   - Is there excessive test duplication?
   - Are test data and fixtures well-organized?

Output Format:
- Coverage review report
- List of uncovered critical paths with risk assessment
- Recommendations for improving coverage
- Action items with priority and owner
- Traceability to [QA-XXX] / [US-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — coverage is measured and tracked
- Article V: Risk Management — coverage gaps are risks
```

## 6. Create Test Plan

**Prompt:**
```
You are acting as a QA Lead operating under the AI Constitution.
Create a test plan for the following:

Feature / Release: [INSERT FEATURE NAME / RELEASE VERSION]
Requirements: [INSERT LINK TO REQUIREMENT DOCUMENTS]
User Stories: [INSERT LINK TO USER STORIES]
Target Delivery Date: [INSERT DATE]
Environment: [INSERT — e.g., "Staging (staging.example.com), Data volume: production-scale subset"]

Test Plan Sections:

1. **Scope**
   - In-scope: [List features/modules to be tested]
   - Out-of-scope: [List explicitly excluded items]

2. **Test Strategy**
   - Unit Testing: [Scope, framework, coverage targets]
   - Integration Testing: [Scope, integration points, tools]
   - E2E Testing: [Scope, critical user journeys, tools]
   - Performance Testing: [Scope, load profiles, SLA targets]
   - Security Testing: [Scope, vulnerability scans, penetration tests]
   - Regression Testing: [Scope, automation strategy]

3. **Test Schedule**
   | Phase | Start Date | End Date | Deliverable |
   |---|---|---|---|
   | Unit Test | [DATE] | [DATE] | [Test completion report] |
   | Integration Test | [DATE] | [DATE] | [Test completion report] |
   | E2E Test | [DATE] | [DATE] | [Test completion report] |
   | Performance Test | [DATE] | [DATE] | [Performance report] |
   | UAT | [DATE] | [DATE] | [UAT sign-off] |

4. **Entry / Exit Criteria**
   - **Entry:** Code deployed to test environment, smoke tests pass, test data available
   - **Exit:** All critical/high bugs fixed, coverage targets met, performance targets met, sign-off obtained

5. **Resources**
   - Testing team: [Names / Roles]
   - Environments: [List of test environments]
   - Tools: [Test automation, performance testing, bug tracking]

6. **Risk Assessment**
   | Risk | Probability | Impact | Mitigation |
   |---|---|---|---|
   | [Risk description] | [H/M/L] | [H/M/L] | [Mitigation strategy] |

Output Format:
- Test Plan document
- Traceability matrix (requirements → test cases)
- Resource allocation sheet
- Traceability to [RELEASE-XXX] / [EPIC-XXX]

Governance Reference (AI Constitution):
- Article I: Value Delivery — testing maximizes delivered value by ensuring quality
- Article V: Risk Management — test plan identifies and mitigates quality risks
```
