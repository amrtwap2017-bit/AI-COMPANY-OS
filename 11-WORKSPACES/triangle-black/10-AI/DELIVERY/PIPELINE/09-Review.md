# Stage 09: Review

## Purpose

Perform a comprehensive code review across four dimensions: architecture, security, style, and completeness. Produce a detailed review report that gates the merge decision.

## Agent Role

**Code Review AI** — Responsible for thorough, automated, and systematic code review.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Backend Implementation | Backend artifact with status `APPROVED` |
| Frontend Implementation | Frontend artifact with status `APPROVED` |
| Test Report | Test report artifact with status `APPROVED` |
| Documentation | Documentation artifact with status `APPROVED` |
| All Source Code | Full feature code, tests, and docs available for review |

## Process

### Step 1: Architecture Review
- Verify the implementation matches the architecture spec:
  - Package structure matches Clean Architecture layers.
  - Dependency rules are followed (Presentation → Application → Domain).
  - No circular dependencies exist.
  - Interfaces are used where modules interact.
- Check that new ADRs are consistent with the design decisions.

### Step 2: Security Review
- Scan for common security issues:
  - SQL injection: raw queries should use parameterized inputs.
  - XSS: user input rendered in UI should be sanitized.
  - Authentication: endpoints have appropriate guards.
  - Authorization: access control checks exist for protected resources.
  - Input validation: all user inputs validated at the boundary.
  - Secrets: no hard-coded keys, tokens, or credentials.
- Check that security-related tests exist and pass.

### Step 3: Style & Quality Review
- Run linter and verify zero violations.
- Verify TypeScript strict mode compliance.
- Check naming conventions (PascalCase for types/classes, camelCase for variables/functions).
- Ensure no dead code (unused imports, variables, or functions).
- Verify error messages are user-friendly and consistent.
- Check logging follows project conventions (structured logging, appropriate levels).

### Step 4: Completeness Review
- Verify all acceptance criteria from the requirement are covered by implementation or tests.
- Check that every task from the sprint backlog item is complete.
- Verify all TODO/FIXME/HACK comments are addressed or documented.
- Ensure migration rollback script exists if applicable.

### Step 5: Generate Review Report
- Write the review report artifact to `.review-report.md`.
- Categorize findings: Blocking, Major, Minor, Suggestion.
- Blocking issues prevent merge. Major issues should be fixed before merge. Minor issues can be deferred. Suggestions are optional.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Review Report Generated | Artifact with all findings categorized |
| No Blocking Issues | Zero blocking findings |
| No Security Issues | Zero security-related findings |
| Architecture Compliant | Implementation matches architecture spec |
| Lint Clean | Zero lint violations |
| All Acceptance Criteria Met | Every AC is satisfied by implementation or tests |

## Artifact Template

```markdown
# Review Report: <Feature Title>

**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Summary
| Category | Blocking | Major | Minor | Suggestion |
|----------|----------|-------|-------|------------|
| Architecture | 0 | 1 | 0 | 2 |
| Security | 0 | 0 | 0 | 1 |
| Style | 0 | 0 | 3 | 1 |
| Completeness | 0 | 0 | 1 | 0 |
| **Total** | **0** | **1** | **4** | **4** |

## Blocking Findings
*(none)*

## Major Findings
### ARCH-001: Missing Repository Interface
- **File**: `src/domains/orders/infrastructure/order.repository.ts`
- **Issue**: Implementation does not implement a defined interface
- **Severity**: Major
- **Recommendation**: Create `IOrderRepository` interface and implement it

## Minor Findings
### STYLE-001: Unused import in order.controller.ts
- **File**: `src/domains/orders/presentation/order.controller.ts:5`
- **Issue**: `HttpException` imported but not used
- **Recommendation**: Remove unused import

## Suggestions
### SEC-SUGGEST-001: Rate limiting on POST /api/orders
- **File**: `src/domains/orders/presentation/order.controller.ts`
- **Issue**: No rate limiting on order creation endpoint
- **Recommendation**: Add rate limiting middleware for POST endpoints (optional)

## Conclusion
- [x] Ready to merge (no blocking issues)
- [ ] Changes required before merge
- [ ] Rejected (architecture/security redesign needed)
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Blocking architecture violation | Redesign the violating component to follow Clean Architecture |
| Security vulnerability found | Fix the vulnerability immediately and re-run review |
| Acceptance criteria not met | Identify missing implementation and return to relevant stage |
| Dead code detected | Remove unused imports, variables, functions |

## Cross-References

- [05-Backend.md](./05-Backend.md)
- [06-Frontend.md](./06-Frontend.md)
- [07-Testing.md](./07-Testing.md)
- [08-Documentation.md](./08-Documentation.md)
- [Standards: Security Standards](../05-STANDARDS/Security-Standards.md)
- [Standards: Coding Standards](../05-STANDARDS/Coding-Standards.md)
