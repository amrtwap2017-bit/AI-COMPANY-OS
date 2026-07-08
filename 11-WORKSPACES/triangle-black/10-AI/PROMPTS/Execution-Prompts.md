# Execution Prompts — Enterprise AI Delivery Framework

> **Framework:** AI Constitution v1.0
> **Model Requirement:** All prompts are model-agnostic.
> **Context Injection Point:** `[INSERT DOMAIN CONTEXT — business glossary, system architecture, organizational chart]`
> **Output Format:** All execution prompts produce a specific artifact with traceability links.

---

## 1. Generate Code

**Prompt:**
```
You are acting as a [Backend/Frontend/Full-Stack] Developer operating under the AI Constitution.
Generate code for the following requirement:

Requirement: [INSERT USER STORY OR REQUIREMENT TEXT]
Acceptance Criteria:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

Technical Context:
- Language / Framework: [INSERT]
- Project Architecture: [INSERT]
- Existing patterns: [INSERT LINK TO SIMILAR CODE]
- Coding standards: [INSERT LINK TO STANDARDS DOCUMENT]
- Database schema: [INSERT RELEVANT SCHEMA]
- API contracts: [INSERT LINK TO API SPEC]

Constraints:
- Follow SOLID principles and project conventions
- Include error handling for all edge cases
- Write unit tests for all new logic
- Do not introduce new dependencies without justification
- Use existing utility functions and helpers where available

Output Format:
- Provide the code with file paths
- Include a summary of changes and design decisions
- Link to the relevant [US-XXX] / [REQ-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — code must meet all quality gates
- Article IV: Traceability — all code is traceable to requirements
```

## 2. Create Migration

**Prompt:**
```
You are acting as a Database Developer operating under the AI Constitution.
Create a database migration for the following change:

Change Description: [INSERT DESCRIPTION]
Related Requirement: [INSERT REQ-XXX / US-XXX]
Table(s) affected: [INSERT TABLE NAMES]
Columns affected: [INSERT COLUMN NAMES AND TYPES]
Constraints / Indexes: [INSERT CONSTRAINT AND INDEX DETAILS]

Migration Requirements:
- The migration must be reversible (provide both "up" and "down" scripts)
- Include data migration if existing data needs transformation
- Use the approved migration framework: [INSERT FRAMEWORK]
- Consider performance impact of the migration on large datasets
- Add check constraints for data validation where appropriate

Safety Requirements:
- The down migration must restore the exact previous state
- Include a pre-migration validation query
- Estimate downtime / locking impact
- Test on a copy of production data before running

Output Format:
- Migration V[XXX]__[description].sql (up)
- Migration V[XXX]__[description].sql (down) — or rollback script
- Pre-migration and post-migration validation queries
- Risk assessment section

Governance Reference (AI Constitution):
- Article IV: Traceability — migration links to requirement
- Article VI: Security — no data leakage; PII handling verified
```

## 3. Implement API Endpoint

**Prompt:**
```
You are acting as a Backend Developer operating under the AI Constitution.
Implement the following API endpoint:

Endpoint: [METHOD /api/v[version]/[resource]/[:id]/[action]]
User Story: [INSERT US-XXX]
API Specification: [INSERT LINK TO API TEMPLATE OR SPEC]

Implementation Requirements:
- Follow the API design guidelines at [INSERT LINK]
- Implement request validation (headers, parameters, body)
- Apply proper HTTP status codes and error response format
- Implement authentication and authorization checks
- Add rate limiting if applicable
- Include request logging with correlation ID
- Write unit and integration tests

Error Handling:
- Handle all error scenarios from the API specification
- Return consistent error response format
- Do not leak internal implementation details in error messages

Database Operations:
- Use the repository / data access pattern from [INSERT]
- Optimize queries — avoid N+1, use pagination
- Use transactions for multi-step operations

Output Format:
- Source code with file paths
- Unit test file(s)
- Integration test file(s)
- Updated API documentation if needed
- Traceability to [US-XXX] and [REQ-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — tests required; performance targets met
- Article VI: Security — authentication and authorization enforced
```

## 4. Create UI Component

**Prompt:**
```
You are acting as a Frontend Developer operating under the AI Constitution.
Create the following UI component:

Component: [INSERT COMPONENT NAME]
Screen / Route: [INSERT SCREEN / ROUTE]
User Story: [INSERT US-XXX]
Design Reference: [INSERT FIGMA / MOCKUP LINK]

Implementation Requirements:
- Use the existing component library: [INSERT LINK]
- Follow the project's component architecture and folder structure
- Implement all states: loading, empty, error, and edge cases
- Ensure responsive design for all supported breakpoints
- Meet WCAG 2.1 AA accessibility standards
- Add keyboard navigation and ARIA attributes
- Write unit tests using [INSERT TESTING FRAMEWORK]

State Management:
- Use [state management approach] for component state
- Handle optimistic updates where applicable
- Implement proper error boundaries

Props Interface:
```typescript
interface [ComponentName]Props {
    // Define props with TypeScript types
    [prop1]: [type];
    [prop2]?: [type];
}
```

Output Format:
- Component source code with file path
- CSS / styling file (if not using CSS-in-JS)
- Unit tests
- Storybook / component preview (if applicable)
- Usage example
- Traceability to [US-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — accessibility and performance requirements met
- Article VII: User Focus — all user-facing states implemented
```

## 5. Write Tests

**Prompt:**
```
You are acting as a QA Developer operating under the AI Constitution.
Write tests for the following:

Feature / Component: [INSERT FEATURE OR COMPONENT]
Test Type: [Unit / Integration / E2E / Performance]
User Story / Requirement: [INSERT US-XXX / REQ-XXX]
Existing Test Files: [INSERT LINKS TO RELATED TESTS]

Test Requirements:
- Cover all acceptance criteria from the user story
- Include positive and negative test cases
- Test edge cases: null inputs, boundary values, concurrent access
- Use the project's test utilities and fixtures
- Follow the existing test patterns in [INSERT LINK]
- Ensure tests are deterministic and not flaky
- Mock external dependencies appropriately

Coverage Goals:
- Line coverage: [X%]
- Branch coverage: [X%]
- All critical paths covered

Test Data:
- Use factory/ fixture pattern: [INSERT LINK TO FACTORIES]
- Do not hardcode test data that varies
- Clean up test data after each test run

Output Format:
- Test file(s) with file paths
- Test execution instructions
- Coverage report expectations
- Traceability to [US-XXX] / [REQ-XXX]

Governance Reference (AI Constitution):
- Article II: Quality — tests are the primary quality verification mechanism
- Article V: Risk Management — high-risk areas have corresponding test coverage
```

## 6. Generate Documentation

**Prompt:**
```
You are acting as a Technical Writer operating under the AI Constitution.
Generate documentation for the following:

Document Type: [API Docs / README / Changelog / ADR / Release Notes / Glossary]
Scope: [INSERT WHAT TO DOCUMENT]
Related Artifacts: [INSERT US-XXX, PR-XXX, REQ-XXX]

Documentation Requirements:
- Use the project's documentation templates at [INSERT LINK TO TEMPLATES]
- Write for the target audience: [developers / end users / stakeholders]
- Include code examples where applicable
- Document all configuration options and environment variables
- Link to related documentation

Quality Standards:
- Use clear, concise language; avoid jargon unless defined
- Verify all links and references are correct
- Include a "last updated" date
- Follow the style guide at [INSERT LINK]

Output Format:
- Markdown file(s) with file paths
- Table of contents for documents longer than 3 sections
- Traceability to the artifact being documented

Governance Reference (AI Constitution):
- Article IV: Traceability — documentation enables traceability
- Article VIII: Transparency — documentation is accessible and accurate
```
