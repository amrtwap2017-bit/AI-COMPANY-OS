# QA Review Checklist

This checklist is used by QA during the quality assurance review to verify that all testing requirements are met and the deliverable is ready for release.

## Test Coverage

- [ ] Line and branch coverage meet the project threshold (minimum 80% line, 70% branch)
- [ ] All new and modified code paths are covered by tests
- [ ] Coverage reports are generated and reviewed for uncovered code
- [ ] No uncovered code is introduced without justification
- [ ] Coverage is measured at the module/component level, not just aggregated
- [ ] Coverage thresholds are enforced in CI pipeline

## Unit Tests

- [ ] Unit tests exist for all business logic and domain rules
- [ ] Unit tests are isolated (no network, database, or filesystem dependencies)
- [ ] Edge cases and boundary values are covered (null, empty, min, max, special characters)
- [ ] Error conditions and exception paths are tested
- [ ] Tests are deterministic and repeatable (no test ordering dependencies)
- [ ] Test execution is fast (unit tests complete within seconds)
- [ ] Mocks and stubs are used appropriately and not over-specified
- [ ] Test data factories or builders are used to reduce test duplication

## Integration Tests

- [ ] Integration tests cover all API endpoints and service boundaries
- [ ] Database integration tests verify queries, migrations, and constraints
- [ ] External service integrations are tested with contract tests or wire mocks
- [ ] Message queue and event stream integrations are tested
- [ ] Integration tests use realistic data and scenarios
- [ ] Integration tests clean up after themselves (test data is removed)
- [ ] Integration test suite runs within acceptable time limits

## End-to-End Tests

- [ ] Critical user journeys (happy paths) are covered by E2E tests
- [ ] E2E tests run against a production-like environment
- [ ] E2E tests are stable and flaky tests are identified and fixed
- [ ] E2E tests cover cross-cutting concerns (auth, navigation, data flow)
- [ ] E2E test data is managed and does not pollute shared environments
- [ ] E2E suite completes within the CI pipeline timeout

## Edge Cases & Negative Testing

- [ ] Empty states are tested (no data, empty lists, null results)
- [ ] Boundary values are tested (numeric limits, string length limits, date ranges)
- [ ] Invalid input formats are tested and produce appropriate errors
- [ ] Concurrent access and race conditions are tested where applicable
- [ ] Network failures and timeouts are tested (offline mode, retry behavior)
- [ ] Authentication and authorization failure scenarios are tested
- [ ] Duplicate submission prevention is tested (double-click, idempotency)
- [ ] Data integrity under concurrent modifications is verified

## Accessibility Testing

- [ ] Application meets WCAG 2.1 AA standards (or applicable level)
- [ ] Keyboard navigation is fully functional (tab order, focus indicators)
- [ ] Screen reader compatibility is verified (aria labels, roles, landmarks)
- [ ] Color contrast ratios meet minimum requirements
- [ ] Text is resizable without loss of functionality (up to 200%)
- [ ] Alt text is provided for all images and non-text content
- [ ] Focus management is correct for dynamic content and modals
- [ ] Accessibility testing tools (axe, Lighthouse, WAVE) report zero critical issues

## Responsive Design

- [ ] Application renders correctly at all supported breakpoints (mobile, tablet, desktop)
- [ ] Touch targets are appropriately sized for mobile interaction
- [ ] Content does not overflow or get cut off at any viewport size
- [ ] Navigation (hamburger menus, sidebars) works on all screen sizes
- [ ] Tables and data grids use responsive patterns (horizontal scroll, card layout)
- [ ] Forms are usable on mobile devices (input sizing, keyboard handling)
- [ ] Images and media are responsive and optimized per viewport

## Cross-Browser Testing

- [ ] Application is tested on all supported browsers (Chrome, Firefox, Safari, Edge)
- [ ] Functionality is verified on mobile browsers (iOS Safari, Android Chrome)
- [ ] CSS features are verified for cross-browser compatibility
- [ ] JavaScript APIs used are verified for browser support
- [ ] Polyfills or fallbacks are in place for unsupported features
- [ ] Rendering is consistent across browsers (no layout shifts or missing assets)

## Error States & User Feedback

- [ ] Form validation errors are displayed inline with clear messages
- [ ] API errors display user-friendly error messages
- [ ] Loading states are shown during async operations (spinners, skeletons)
- [ ] Empty states provide guidance on next steps
- [ ] Success states and confirmations are displayed after actions
- [ ] 404 and error pages are designed and functional
- [ ] Network offline state is handled gracefully
- [ ] Toast or notification system works for ephemeral messages

## Documentation & Reporting

- [ ] Test results are documented and attached to the release
- [ ] Known issues or limitations are documented and accepted by stakeholders
- [ ] Test environment configuration is documented
- [ ] Test data setup and teardown procedures are documented
- [ ] Regression test suite results are provided for the affected areas
- [ ] QA sign-off report is prepared and submitted

## QA Sign-Off

- [ ] All critical and high-severity defects are resolved
- [ ] Medium-severity defects are resolved or have a documented workaround
- [ ] Low-severity defects are triaged and accepted by Product Owner
- [ ] Product Owner has reviewed and accepted QA findings
- [ ] QA lead has provided final sign-off for release
