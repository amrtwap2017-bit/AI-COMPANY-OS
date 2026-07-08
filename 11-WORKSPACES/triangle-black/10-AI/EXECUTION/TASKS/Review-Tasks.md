# Review Tasks

## Overview

Review tasks are quality assurance gates that verify deliverables against defined standards before they are accepted. Reviews occur at multiple levels — architecture, code, security, performance, documentation, and UX — ensuring that quality is built in throughout the development process rather than inspected at the end.

---

## 1. Architecture Review

Verify that the proposed or implemented architecture meets design standards, scalability requirements, and integration constraints.

| Attribute        | Description |
|------------------|-------------|
| **Purpose**      | Ensure architectural decisions are sound, documented, and aligned with enterprise standards before implementation proceeds at scale. |
| **Review Criteria** | Component boundaries are clearly defined, interfaces are stable and versioned, data flow is consistent with security and privacy requirements, scalability and availability targets are addressed, integration points are documented, architectural decisions have ADRs. |
| **Checklist**    | [ ] Architecture diagram is complete and up to date [ ] Component responsibilities are clearly defined [ ] Data flow is documented with security boundaries [ ] Scalability characteristics are understood and documented [ ] Failure modes are considered [ ] Integration contracts are defined [ ] ADRs exist for key decisions [ ] Architecture aligns with enterprise standards |
| **Finding Format** | Each finding includes: ID, severity (Blocker/Critical/Major/Minor/Info), description, location (component/module), recommendation, and status (Open/Accepted/Resolved). |
| **Pass/Fail Thresholds** | **Pass**: 0 Blocker, 0 Critical findings. **Conditional Pass**: ≤2 Major findings with remediation plan. **Fail**: Any Blocker/Critical finding or >2 Major findings without remediation plan. |
| **Effort Range** | 1–2 hours per review. |

---

## 2. Code Review

Peer review of source code changes for correctness, maintainability, style, and test coverage.

| Attribute        | Description |
|------------------|-------------|
| **Purpose**      | Catch defects early, improve code quality, share knowledge, and enforce coding standards. |
| **Review Criteria** | Code is correct and implements the intended behavior, code follows project style and naming conventions, error handling is comprehensive, logging is appropriate, tests cover the changes, no security vulnerabilities introduced, no performance issues, code is readable and maintainable. |
| **Checklist**    | [ ] Code implements the acceptance criteria correctly [ ] No obvious logic errors or bugs [ ] Input validation is present [ ] Error conditions are handled [ ] Logging is at appropriate levels [ ] Unit tests exist and cover edge cases [ ] All existing tests still pass [ ] No hard-coded secrets or credentials [ ] Code follows project style guide [ ] No dead code, commented code, or TODOs |
| **Finding Format** | Each finding includes: file path and line number, severity (Blocker/Critical/Major/Minor/Nitpick), description, suggested fix, and status (Open/Addressed/Resolved). |
| **Pass/Fail Thresholds** | **Pass**: 0 Blocker, 0 Critical, ≤3 Major findings all resolved. **Conditional Pass**: ≤5 Major findings with author acknowledgment and plan to address in follow-up. **Fail**: Any Blocker/Critical finding, >5 Major findings, or unresolved Major findings. |
| **Effort Range** | 0.5–2 hours per review depending on change size. |

---

## 3. Security Review

Focused review of code and configuration for security vulnerabilities and compliance.

| Attribute        | Description |
|------------------|-------------|
| **Purpose**      | Identify and remediate security vulnerabilities before they reach production. |
| **Review Criteria** | Authentication is enforced on all protected endpoints, authorization checks are correct and complete, input validation prevents injection attacks, sensitive data is not exposed in logs or error messages, secrets are not hard-coded, dependencies are free of known vulnerabilities, TLS is enforced, audit logging captures security events. |
| **Checklist**    | [ ] Authentication is validated on every request [ ] Authorization is checked for every operation [ ] Input data is sanitized and validated [ ] Output encoding prevents XSS [ ] No secrets in source code or config files [ ] SQL/NoSQL queries use parameterized statements [ ] Error messages do not leak sensitive information [ ] Dependencies have been scanned for vulnerabilities [ ] Security headers are set (CSP, HSTS, X-Frame-Options) [ ] Audit logging captures user ID, action, timestamp, and result |
| **Finding Format** | Each finding includes: vulnerability ID (CVE or internal), severity (Critical/High/Medium/Low), affected component, description, exploit scenario, remediation recommendation, CVSS score (if applicable), status (Open/In Progress/Resolved/Won't Fix). |
| **Pass/Fail Thresholds** | **Pass**: 0 Critical, 0 High findings. **Conditional Pass**: Medium findings with remediation timeline, Low findings acknowledged. **Fail**: Any Critical or High finding. |
| **Effort Range** | 1–3 hours per review session. |

---

## 4. Performance Review

Assess the performance characteristics of code changes, queries, and system interactions.

| Attribute        | Description |
|------------------|-------------|
| **Purpose**      | Ensure that changes meet performance SLAs and do not introduce regressions. |
| **Review Criteria** | Response times are within defined thresholds, database queries are optimized (indexed, no N+1), resource usage (CPU, memory, I/O) is acceptable, caching is used appropriately, synchronous calls in hot paths are evaluated, bulk operations are batch-processed, concurrency and locking are handled correctly. |
| **Checklist**    | [ ] Query execution plans are reviewed for full table scans [ ] N+1 query patterns are eliminated [ ] Appropriate indexes exist for new query patterns [ ] Caching strategy is defined and implemented [ ] Synchronous remote calls are time-boxed with timeouts [ ] Bulk operations use batch processing [ ] Memory usage is bounded (no unbounded collections) [ ] Concurrent access is thread-safe [ ] Load test results meet SLA targets [ ] Performance regression compared to baseline is within 10% |
| **Finding Format** | Each finding includes: component or query, severity (Critical/Major/Minor/Info), observed metrics (before/after), SLA threshold, description, recommendation, status. |
| **Pass/Fail Thresholds** | **Pass**: Performance meets or exceeds SLAs, no regression >10%. **Conditional Pass**: Minor regressions (<20%) with acknowledged optimization plan. **Fail**: SLA violations, Critical regressions (>20%), or unbounded resource usage. |
| **Effort Range** | 1–3 hours per review. |

---

## 5. Documentation Review

Verify that documentation is accurate, complete, and consistent with the implementation.

| Attribute        | Description |
|------------------|-------------|
| **Purpose**      | Ensure that documentation is a reliable source of truth that users and developers can depend on. |
| **Review Criteria** | Documentation accurately reflects the current implementation, examples are tested and produce correct results, no broken links or references, formatting is consistent with documentation standards, all public APIs and user-facing features are documented, configuration parameters are fully described. |
| **Checklist**    | [ ] All statements are factually accurate [ ] Code examples compile and run correctly [ ] All links resolve to valid pages [ ] Screenshots match current UI [ ] No placeholder text or TODOs remain [ ] API documentation matches the OpenAPI spec [ ] Configuration options match actual configuration [ ] Version information is correct [ ] Changelog entries are accurate [ ] Documentation is consistent with other related docs |
| **Finding Format** | Each finding includes: document and section, severity (Major/Minor/Typos), description, correction, status. |
| **Pass/Fail Thresholds** | **Pass**: 0 Major factual errors, minor typos acceptable. **Conditional Pass**: ≤3 Major issues with documented fix plan. **Fail**: Factual errors that would mislead readers or cause operational issues. |
| **Effort Range** | 1–2 hours per review. |

---

## 6. UX Review

Assess the user experience against design specifications, usability standards, and accessibility requirements.

| Attribute        | Description |
|------------------|-------------|
| **Purpose**      | Ensure that the user interface is usable, accessible, and consistent with the design system and UX specifications. |
| **Review Criteria** | UI matches approved mockups and design specifications, interaction patterns are consistent with the rest of the application, accessibility standards (WCAG 2.1 AA) are met, responsive design works at all defined breakpoints, error states and edge cases are handled gracefully, loading states provide user feedback, copy/text is clear and consistent. |
| **Checklist**    | [ ] UI matches approved mockups [ ] All UI states are implemented (default, loading, empty, error, success) [ ] Navigation is consistent with application patterns [ ] Responsive design works at all breakpoints [ ] Keyboard navigation is complete and logical [ ] Touch targets are appropriately sized [ ] Color contrast meets WCAG AA standards [ ] Text is readable and copy is consistent [ ] Animations/transitions are smooth and purposeful [ ] Error messages are clear and helpful |
| **Finding Format** | Each finding includes: page/component, severity (Critical/Major/Minor/Nitpick), description, expected behavior, actual behavior, reference (screenshot or mockup), status. |
| **Pass/Fail Thresholds** | **Pass**: 0 Critical, 0 Major usability issues. **Conditional Pass**: Minor issues noted for future sprints. **Fail**: Critical usability blocker, major accessibility violation, or significant deviation from approved design. |
| **Effort Range** | 1–3 hours per feature or page. |
