# Code Review Checklist

This checklist guides peer code reviews to ensure code quality, consistency, correctness, and maintainability across all deliverables.

## Style & Formatting

- [ ] Code follows the project's style guide and formatting rules
- [ ] No linting warnings or errors are introduced
- [ ] Consistent indentation, spacing, and bracket placement
- [ ] No excessively long lines (configured per language standard)
- [ ] Imports are organized and unused imports are removed
- [ ] File naming conventions are followed
- [ ] No large files that should be split into modules

## Naming & Conventions

- [ ] Variable, function, class, and module names are descriptive and meaningful
- [ ] Abbreviations are avoided unless they are universally understood
- [ ] Naming follows language and framework conventions (camelCase, PascalCase, snake_case)
- [ ] Constants are named with the appropriate casing convention
- [ ] Boolean variables are named with is/has/should prefixes
- [ ] Functions/methods are named with verb phrases that describe their action
- [ ] Design patterns are named consistently with the codebase conventions

## Code Structure & Design

- [ ] Functions and methods are small and do one thing (single responsibility)
- [ ] Duplicate code is extracted into reusable functions or components
- [ ] Complex logic is broken down into smaller, testable units
- [ ] No magic numbers or hard-coded strings without named constants
- [ ] Conditional complexity is minimized (no deeply nested if/else)
- [ ] Switch or match statements are exhaustive or have default handling
- [ ] Inheritance is used appropriately (prefer composition over inheritance)
- [ ] Pure functions are preferred over functions with side effects

## Error Handling

- [ ] All error paths are handled, not just happy paths
- [ ] Exceptions are caught at the appropriate level (not swallowed or silenced)
- [ ] Error messages are descriptive and actionable
- [ ] Custom exceptions are used for domain-specific error conditions
- [ ] External library exceptions are wrapped in application exceptions
- [ ] No generic catch blocks without specific error handling
- [ ] Resource cleanup is guaranteed (try/finally, using, dispose patterns)
- [ ] Null safety is ensured (null checks, Option types, Maybe monads)

## Testing & Coverage

- [ ] New code is covered by unit tests
- [ ] Test names describe the scenario and expected outcome
- [ ] Tests are independent and can run in any order
- [ ] Mocking is used only for external dependencies, not for internal logic
- [ ] Edge cases and boundary conditions are tested
- [ ] Negative tests exist for error and failure scenarios
- [ ] No flaky tests are introduced (deterministic, no timing dependencies)
- [ ] Test data is minimal and focused on the test scenario

## Performance

- [ ] No unnecessary object allocations in hot paths
- [ ] Loops are optimized (no redundant calculations inside loops)
- [ ] Collection operations use appropriate data structures
- [ ] No synchronous blocking calls in asynchronous code paths
- [ ] Database queries are efficient (no N+1 queries, appropriate indexing)
- [ ] Lazy loading is used where appropriate
- [ ] Caching is applied for repeated expensive operations

## Security

- [ ] No hard-coded secrets, tokens, or credentials
- [ ] User input is validated and sanitized
- [ ] SQL queries use parameterized statements or ORM (no string concatenation)
- [ ] Output is encoded to prevent XSS
- [ ] Authentication tokens are not logged or exposed in URLs
- [ ] File uploads are validated for type, size, and content
- [ ] Permissions and authorization checks are verified at every entry point

## Documentation

- [ ] Public API members have XML/JSDoc/Python doc comments
- [ ] Complex logic includes inline comments explaining the why, not the what
- [ ] TODO or FIXME comments include a ticket reference
- [ ] Configuration values have documentation explaining their purpose
- [ ] README or setup docs are updated if the change affects local development

## Completeness

- [ ] All acceptance criteria are addressed
- [ ] No unrelated changes are included in the pull request
- [ ] Commit messages are descriptive and follow the project convention
- [ ] Migration scripts are included where schema changes are made
- [ ] Feature flags or toggles are properly scoped and documented
- [ ] Review comments from the last review round are addressed
