# Code Review Gate

## Gate Keeper

**Code Review AI** — Automated code review system that performs initial analysis. Human peer review is required as a secondary layer for all production code.

## When Triggered

This gate is triggered for **every pull request** or merge request in any repository containing production code. Exceptions: documentation-only changes, configuration-only changes (non-production).

## Review Criteria

### 1. Style Compliance

- Code follows the project's established style guide (language-specific).
- Formatting is consistent and aligns with the project's formatter configuration.
- No stylistic violations that reduce readability.
- Linting passes with zero violations.

### 2. Naming Conventions

- Variable, function, class, and file names follow project conventions.
- Names are descriptive and convey intent.
- Abbreviations are used only when universally understood.
- No single-letter variable names except in loops or mathematical contexts.

### 3. Error Handling

- All error states are handled appropriately.
- Exceptions are caught at the correct level of abstraction.
- Error messages are meaningful and user-actionable where applicable.
- No swallowed exceptions (empty catch blocks) without explicit justification.
- Logging includes sufficient context for debugging.

### 4. Test Coverage

- New code has corresponding unit tests.
- Changed code has existing tests updated or new tests added.
- Edge cases and error paths are tested.
- Test coverage thresholds are met (minimum 80% line coverage).
- Tests are meaningful (not just coverage padding).

### 5. Security Considerations

- No hardcoded secrets, credentials, or API keys.
- Input validation is present for all user-supplied data.
- Output encoding is applied to prevent XSS.
- SQL queries use parameterized statements or an ORM.
- Authentication and authorization checks are in place.
- No insecure deserialization patterns.

### 6. Performance Implications

- No obvious performance anti-patterns (N+1 queries, unnecessary loops, etc.).
- Resource cleanup is handled (connections, file handles, memory).
- Caching is used where appropriate.
- Asynchronous operations are properly awaited or handled.

### 7. Documentation Completeness

- Public API has doc comments.
- Complex logic has inline comments explaining the *why*.
- TODOs reference a ticket or issue ID.
- README and API docs are updated if the change affects them.

### 8. Code Organization

- The change is appropriately scoped (no unrelated changes in the same PR).
- Files are organized in the correct directories.
- Imports are clean and follow project conventions.
- Duplicate code is extracted into shared functions or components.

## Review Process

1. Developer submits pull request with description, linked issues, and test results.
2. Automated gates run (CI pipeline): lint, tests, security scan, build.
3. Code Review AI performs automated analysis and provides inline comments.
4. Human reviewer performs manual review, focusing on logic, design, and non-automatable aspects.
5. Reviewer provides feedback or approves the change.
6. Developer addresses feedback and re-requests review if needed.
7. Once approved, the PR can be merged.

## Review Outcomes

- **Approve**: Code is ready to merge.
- **Approve with Suggestions**: Code is acceptable; suggestions are optional improvements.
- **Request Changes**: Specific changes are required before approval.
- **Block**: Code has fundamental issues that require redesign.

## Best Practices

- Reviews should be completed within one business day.
- Pull requests should be smaller than 400 lines of changed code where possible.
- Reviewers should focus on the logic, not formatting (that is for automated tools).
- Feedback should be constructive, specific, and actionable.
- Developers should respond to all comments, even if just acknowledging.

## Non-Compliance

Code that fails the code review gate cannot be merged. Multiple failed reviews for similar issues may result in process escalation or training requirements.
