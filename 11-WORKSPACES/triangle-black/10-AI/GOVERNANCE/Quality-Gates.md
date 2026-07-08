# Quality Gates

> Every gate in the delivery pipeline: checks performed, who enforces them, failure handling, and waiver process.

## Quality Gate Principles

1. **Every artifact passes through every gate** — No skipping
2. **Gates are automated where possible** — Manual gates only where judgment is required
3. **Gates are blocking** — A failed gate stops the pipeline
4. **Gates have clear criteria** — Pass/fail is objective and measurable
5. **Gates are enforced by designated agents** — No gate is self-enforced

## Gate Pipeline

```
Requirement → Validation → Architecture → Database → API → Backend → 
Frontend → QA → Security → Performance → Documentation → Review → Merge → Release
```

## Gate Definitions

### GATE-REQ: Requirement Quality Gate

| Property | Value |
|----------|-------|
| Stage | Requirements |
| Enforced By | Product Owner AI |
| Type | Manual + Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] Requirement traces to an approved business capability in Program 1
- [ ] Requirement follows the standard template
- [ ] Acceptance criteria are defined and testable
- [ ] Requirement is unambiguous and atomic
- [ ] Dependencies are identified
- [ ] Priority is assigned
- [ ] Stakeholder is identified
- [ ] No conflicts with existing requirements

**Failure Handling:**
- Requirement returned to Business Analyst AI with specific gaps
- Product Owner AI logs the failure and requested changes
- Business Analyst AI must resubmit within 4 hours

### GATE-VAL: Validation Gate

| Property | Value |
|----------|-------|
| Stage | Business Validation |
| Enforced By | Program Manager AI |
| Type | Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] Requirement aligns with sprint goal
- [ ] Effort estimate is reasonable
- [ ] No duplicates with existing backlog items
- [ ] Business value is articulated
- [ ] Acceptance criteria are complete and unambiguous
- [ ] Traceability is verified

**Failure Handling:**
- Requirement returned with validation notes
- Business Analyst AI and Product Owner AI resolve issues
- Program Manager AI sets priority for re-validation

### GATE-ARC: Architecture Gate

| Property | Value |
|----------|-------|
| Stage | Architecture |
| Enforced By | Chief Enterprise Architect AI |
| Type | Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] Architecture follows Enterprise Principles
- [ ] ADR exists for any architectural decision
- [ ] Design is consistent with architecture baseline
- [ ] No violation of bounded contexts
- [ ] API contracts are defined and consistent
- [ ] Technology choices comply with approved stack
- [ ] Security architecture is reviewed by Security Architect AI
- [ ] Performance implications are assessed

**Failure Handling:**
- Architecture returned to Solution Architect AI with findings
- Fix requires ADR update or new ADR if the issue is significant
- Re-review SLA: 8 hours

### GATE-DB: Database Gate

| Property | Value |
|----------|-------|
| Stage | Database |
| Enforced By | Database Architect AI |
| Type | Automated + Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] Schema follows naming standards
- [ ] All tables have primary keys
- [ ] Foreign key relationships are defined
- [ ] Indexes are defined for query patterns
- [ ] Migration is reversible (for non-breaking changes)
- [ ] No hardcoded values in schema definition
- [ ] Data types match domain requirements
- [ ] Schema versioning is applied

**Failure Handling:**
- Migration script returned for correction
- Breaking changes require Solution Architect AI approval
- Database Architect AI fixes and re-validates

### GATE-API: API Gate

| Property | Value |
|----------|-------|
| Stage | API |
| Enforced By | Code Review AI |
| Type | Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] API follows the API contract specification
- [ ] Endpoints follow RESTful conventions
- [ ] Request/response models match contracts
- [ ] Error handling follows RFC 7807
- [ ] Authentication and authorization are implemented
- [ ] Rate limiting is configured
- [ ] API versioning is applied
- [ ] Input validation is complete
- [ ] OpenAPI/Swagger documentation is generated

**Failure Handling:**
- API implementation returned to Backend Lead AI
- Automated test must pass before re-submission
- Code Review AI re-validates within 2 hours

### GATE-BE: Backend Gate

| Property | Value |
|----------|-------|
| Stage | Backend |
| Enforced By | Code Review AI |
| Type | Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] Code compiles without errors
- [ ] Linting passes (zero errors, zero warnings)
- [ ] Type checking passes (zero type errors)
- [ ] Unit test coverage >= 80%
- [ ] All existing tests pass (no regressions)
- [ ] No security vulnerabilities introduced
- [ ] Code follows project coding standards
- [ ] No hardcoded secrets or credentials
- [ ] Logging is implemented at appropriate levels
- [ ] Error handling covers all failure modes

**Failure Handling:**
- Code returned with specific line-level issues
- Automated gates must pass locally before re-submission
- Re-review SLA: 4 hours

### GATE-FE: Frontend Gate

| Property | Value |
|----------|-------|
| Stage | Frontend |
| Enforced By | Code Review AI |
| Type | Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] Code compiles without errors
- [ ] Linting passes (zero errors, zero warnings)
- [ ] Type checking passes
- [ ] Unit test coverage >= 80%
- [ ] All existing tests pass
- [ ] UI matches UX specifications
- [ ] Accessibility standards are met
- [ ] Mobile responsiveness is verified
- [ ] No console errors in development
- [ ] Bundle size is within threshold

**Failure Handling:**
- Code returned with issues
- Automated gates must pass before re-submission
- UX Architect AI reviews UI conformance

### GATE-QA: Quality Assurance Gate

| Property | Value |
|----------|-------|
| Stage | QA |
| Enforced By | QA Director AI |
| Type | Manual + Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] All acceptance criteria are tested and passing
- [ ] Integration tests pass (coverage >= 70%)
- [ ] E2E tests pass for critical paths
- [ ] No high-severity defects remain
- [ ] All medium-severity defects have workarounds documented
- [ ] Test plan is complete and executed
- [ ] Regression test suite passes
- [ ] Edge cases are tested
- [ ] Cross-browser compatibility verified

**Failure Handling:**
- Feature returned to development with defect list
- High-severity defects must be fixed before re-submission
- Medium/low defects may be deferred with QA Director AI approval
- Re-test SLA: 8 hours

### GATE-SEC: Security Gate

| Property | Value |
|----------|-------|
| Stage | Security |
| Enforced By | Security Architect AI |
| Type | Manual + Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] No known vulnerabilities in dependencies
- [ ] Authentication is properly implemented
- [ ] Authorization checks are in place
- [ ] Input validation prevents injection attacks
- [ ] Sensitive data is encrypted at rest and in transit
- [ ] Secrets are not hardcoded
- [ ] Session management is secure
- [ ] CORS and CSP are properly configured
- [ ] Rate limiting is in place
- [ ] Audit logging is complete
- [ ] No security regression from previous scan

**Failure Handling:**
- Critical/high findings block the gate — must be fixed before proceeding
- Medium findings may proceed with documented remediation plan
- Low findings are logged and scheduled in next sprint
- Security Architect AI has veto power — cannot be overridden without CEO approval

### GATE-PERF: Performance Gate

| Property | Value |
|----------|-------|
| Stage | Performance |
| Enforced By | Performance Engineer AI |
| Type | Automated |
| Blocking | Yes |

**Checks Performed:**
- [ ] API response times within thresholds (p95 < 500ms)
- [ ] Database query performance within thresholds (p95 < 100ms)
- [ ] Frontend bundle size within threshold
- [ ] Lighthouse score >= 80 (all categories)
- [ ] No N+1 query patterns
- [ ] Caching strategy is implemented
- [ ] Load test passes for expected concurrent users
- [ ] Memory usage is within limits
- [ ] No memory leaks detected

**Failure Handling:**
- Performance regression requires optimization before proceeding
- Performance Engineer AI provides specific optimization guidance
- Re-test SLA: 8 hours

### GATE-DOC: Documentation Gate

| Property | Value |
|----------|-------|
| Stage | Documentation |
| Enforced By | Documentation Engineer AI |
| Type | Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] API documentation is complete and accurate
- [ ] User-facing documentation is written
- [ ] Technical documentation is updated
- [ ] ADR is referenced where applicable
- [ ] Change log entry is prepared
- [ ] Release notes are drafted
- [ ] Traceability links are updated
- [ ] All new artifacts have required metadata

**Failure Handling:**
- Documentation returned with gaps identified
- Documentation Engineer AI provides specific requirements
- Re-review SLA: 4 hours

### GATE-REV: Review Gate

| Property | Value |
|----------|-------|
| Stage | Review |
| Enforced By | Code Review AI |
| Type | Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] All previous gate checks are passing
- [ ] Code is clean and maintainable
- [ ] No dead code or commented-out code
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate
- [ ] No obvious bugs or logic errors
- [ ] Tests are meaningful (not just coverage padding)
- [ ] Architecture compliance is verified
- [ ] Coding standards are followed

**Failure Handling:**
- Code returned for correction with specific review comments
- Author must address all comments before re-submission
- Re-review SLA: 4 hours

### GATE-MRG: Merge Gate

| Property | Value |
|----------|-------|
| Stage | Merge |
| Enforced By | Merge Controller AI |
| Type | Automated + Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] All previous gates are passing
- [ ] Branch is up to date with target
- [ ] No merge conflicts
- [ ] All CI checks pass
- [ ] Required number of approvals received
- [ ] No force-push to protected branch
- [ ] Commit messages follow convention
- [ ] Change log is updated

**Failure Handling:**
- Merge blocked until all conditions are met
- Merge Controller AI provides specific failure reason
- Auto-retry after conflict resolution

### GATE-RLS: Release Gate

| Property | Value |
|----------|-------|
| Stage | Release |
| Enforced By | Merge Controller AI + Human CEO |
| Type | Manual |
| Blocking | Yes |

**Checks Performed:**
- [ ] All gates pass for all features in the release
- [ ] Release notes are complete
- [ ] Version number is updated
- [ ] Tag is created
- [ ] Deployment plan is reviewed
- [ ] Rollback plan is in place
- [ ] Monitoring is configured
- [ ] Human CEO approval is obtained
- [ ] Stakeholders are notified

**Failure Handling:**
- Release is postponed until all conditions are met
- Issues are documented in the risk register
- Release rescheduled with Program Manager AI

## Gate Waiver Process

A quality gate may only be bypassed through the formal waiver process:

### When a Waiver is Possible
- The gate failure is minor and does not affect system integrity
- The gate failure is a false positive
- The feature is urgent (security patch, production hotfix)
- The cost of passing the gate exceeds the risk of bypassing

### Waiver Request Format

```markdown
QUALITY GATE WAIVER REQUEST
═══════════════════════════
ID: QGW-001
Date: YYYY-MM-DD HH:MM UTC

AFFECTED GATE
─────────────
Gate: [Gate ID]
Stage: [Pipeline stage]
Artifact: [Artifact ID or description]

FAILURE REASON
──────────────
[What check failed and why]

WAIVER JUSTIFICATION
────────────────────
[Why the waiver is appropriate]
[Risk assessment of bypassing this gate]

MITIGATION
──────────
[What compensating controls are in place]
[When the gate requirement will be fulfilled]

REQUESTED BY
────────────
Agent: [Role]

APPROVALS
─────────
QA Director AI: [Approved / Rejected]
Chief Enterprise Architect AI: [Approved / Rejected]
```

### Waiver Authority

| Gate | Can Approve Waiver | Requires |
|------|--------------------|----------|
| REQ / VAL | Chief Enterprise Architect AI | Risk assessment |
| ARC | Chief Executive AI | Written rationale |
| DB / API / BE / FE | Chief Enterprise Architect AI | QA Director AI concurrence |
| QA | Chief Enterprise Architect AI | Risk assessment |
| SEC | No waiver possible | — |
| PERF | Chief Enterprise Architect AI | Performance Engineer AI concurrence |
| DOC | Program Manager AI | — |
| REV | Chief Enterprise Architect AI | — |
| MRG | Chief Enterprise Architect AI | — |
| RLS | Human CEO | — |

### Waiver Expiration
- Waivers expire at the end of the current sprint
- Recurring waivers require a new ADR
- Expired waivers are void and the gate requirement is reinstated

## Gate Status Tracking

| Status | Meaning |
|--------|---------|
| Pending | Gate not yet evaluated |
| In Progress | Gate evaluation in progress |
| Passed | All checks pass |
| Failed | One or more checks fail |
| Waived | Gate bypassed via approved waiver |
| Not Applicable | Gate does not apply to this artifact |
