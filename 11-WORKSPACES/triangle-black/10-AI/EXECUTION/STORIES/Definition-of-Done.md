# Definition of Done

## Overview

The Definition of Done (DoD) establishes the post-conditions that a user story must satisfy before it can be marked complete. DoD ensures consistent quality across all deliverables, regardless of the implementing team or AI agent. A story is not considered done until all criteria are verified.

## DoD Criteria

### 1. Code Written

- [ ] All production code for the story has been implemented.
- [ ] Code follows the project's coding standards and style guide.
- [ ] Code adheres to the architecture and design documented in technical notes.
- [ ] No dead code, commented-out code, or TODO/FIXME markers remain.
- [ ] Logging is implemented at appropriate levels (INFO, WARN, ERROR).
- [ ] Feature flags are wired correctly (if applicable).

### 2. Tests Pass

- [ ] All unit tests pass with no failures.
- [ ] All integration tests pass with no failures.
- [ ] All existing tests continue to pass (no regressions).
- [ ] Code coverage meets the project threshold (≥80% line coverage).
- [ ] New code has corresponding tests: unit tests for logic, integration tests for services.
- [ ] BDD scenarios from the story have been implemented as automated tests.
- [ ] Error paths and edge cases are covered.
- [ ] Test suite runs in CI without flaky failures.

### 3. Code Reviewed

- [ ] All code changes have been reviewed by at least one peer.
- [ ] Review comments have been resolved or addressed.
- [ ] The final review approval has been recorded.
- [ ] No critical or major findings remain open.
- [ ] Code review covered: correctness, design, security, performance, testability.

### 4. Documentation Updated

- [ ] Inline code documentation is accurate and complete.
- [ ] API documentation is updated if the public API surface changed.
- [ ] README files are updated if setup steps or configuration changed.
- [ ] Architecture diagrams are updated (if applicable).
- [ ] Changelog is updated with a summary of the change.
- [ ] Operational runbooks are updated if deployment or monitoring changed.

### 5. API Contracts Aligned

- [ ] API endpoint signatures match the specification.
- [ ] Request/response schemas are aligned with documented contracts.
- [ ] HTTP status codes match documented values.
- [ ] Error response formats match the standard error schema.
- [ ] API versioning strategy is followed.
- [ ] Contract tests pass for provider and consumer.

### 6. Acceptance Criteria Met

- [ ] Every acceptance criterion has been verified and passes.
- [ ] Verification evidence is recorded (test results, screenshots, logs).
- [ ] Product Owner has reviewed and accepted the implementation.
- [ ] Sign-off is documented in the story record.

### 7. No Critical or Blocker Bugs

- [ ] No bugs classified as Critical or Blocker are open against this story.
- [ ] All known high-severity bugs are fixed.
- [ ] Medium and low-severity bugs are triaged and have a documented resolution plan.
- [ ] Security vulnerabilities discovered during testing are remediated.

### 8. Performance Validation

- [ ] Performance impact has been assessed.
- [ ] Response times remain within established SLAs.
- [ ] No memory leaks introduced (verified by load test or static analysis).
- [ ] Database query performance is acceptable (no N+1 patterns, appropriate indexing).

### 9. Security Validation

- [ ] Authentication and authorization are correctly enforced.
- [ ] Input validation and sanitization are in place.
- [ ] Secrets and credentials are not hard-coded.
- [ ] Dependency vulnerabilities have been scanned and cleared.

### 10. Deployment Readiness

- [ ] Database migrations are prepared and tested (forward and rollback).
- [ ] Feature flag is configured for controlled rollout (if applicable).
- [ ] Release notes entry is drafted.
- [ ] Monitoring alerts are configured for new metrics or error conditions.

## DoD Checklist Summary

```
Story: [US-XXX] [Title]

[ ] Code written and follows standards
[ ] Tests pass with ≥80% coverage
[ ] Code reviewed and approved
[ ] Documentation updated
[ ] API contracts aligned
[ ] Acceptance criteria met and signed off
[ ] No critical/blocker bugs
[ ] Performance validated
[ ] Security validated
[ ] Deployment ready
```

## DoD Enforcement

- The DoD is non-negotiable for all stories in the program.
- The QA Lead is responsible for verifying DoD compliance before marking a story as Accepted.
- The Product Owner signs off on acceptance criteria satisfaction.
- Stories failing DoD checks are returned to In Progress with documented gaps.
- Partial DoD compliance is not accepted — a story is either Done or it is not.
- Automation should be employed wherever possible to verify DoD criteria (test coverage gates, static analysis, contract testing).

## DoD Exceptions

Exceptions to the DoD are rarely granted and require approval from the Engineering Director and Product Owner. Exception requests must:

- State which criteria will not be met and the rationale.
- Describe the residual risk and mitigation plan.
- Include a timeline for fulfilling the unmet criteria post-release.
- Be time-boxed to no more than one sprint.

## Continuous Improvement

The DoD is reviewed at the end of each release cycle. Teams may propose additions or modifications based on lessons learned. Changes to the DoD require approval from the Engineering Director, QA Lead, and Product Owner.
