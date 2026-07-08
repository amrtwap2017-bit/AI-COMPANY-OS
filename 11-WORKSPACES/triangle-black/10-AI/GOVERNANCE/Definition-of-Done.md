# Definition of Done

The Definition of Done (DoD) defines the post-conditions that must be satisfied before any sprint item can be considered complete and ready for release. Every item must satisfy all applicable criteria.

## Code Completeness

- [ ] All development work is complete per the acceptance criteria
- [ ] All code compiles without errors or warnings
- [ ] No dead code, commented-out code, or debugging artifacts remain
- [ ] All feature flags are properly configured or removed
- [ ] Configuration is externalized and environment-appropriate
- [ ] Database migrations are written and tested
- [ ] Logging is implemented at appropriate levels (error, warn, info, debug)
- [ ] Metrics and monitoring hooks are implemented
- [ ] API versioning is applied if applicable

## Testing Completeness

- [ ] Unit tests cover all new and modified code paths
- [ ] Unit test coverage meets or exceeds the team's threshold (minimum 80%)
- [ ] Integration tests cover all API endpoints and service interactions
- [ ] End-to-end tests cover the primary user flows
- [ ] All tests pass in the CI pipeline
- [ ] Edge cases and boundary conditions are tested
- [ ] Error-handling paths are tested (network failures, invalid input, auth failures)
- [ ] Performance tests confirm no regressions against baseline
- [ ] Security tests (SAST/DAST) pass with no critical or high findings

## Documentation Completeness

- [ ] API documentation is updated (OpenAPI/Swagger, GraphQL schema, etc.)
- [ ] README or developer docs are updated if interfaces changed
- [ ] Architecture Decision Records (ADRs) are created or updated for significant decisions
- [ ] Runbooks or operational procedures are updated
- [ ] Inline code documentation is sufficient for maintainability
- [ ] Wiki or knowledge base articles are updated for user-facing changes

## Review & Approval

- [ ] Code review is completed by at least one peer reviewer
- [ ] All reviewer comments are resolved or acknowledged
- [ ] Architecture review is completed for items requiring design changes
- [ ] Security review is completed with no unresolved findings
- [ ] Performance review is completed with no regressions
- [ ] QA review is completed and sign-off is obtained

## Security & Compliance

- [ ] Secrets and credentials are not hard-coded (verified by scanner)
- [ ] Input validation and sanitization are in place for all user-facing inputs
- [ ] Authentication and authorization are implemented per the security model
- [ ] Data is encrypted at rest and in transit where required
- [ ] Dependency vulnerabilities are resolved or waived with justification
- [ ] Audit logging is implemented for security-relevant events
- [ ] Compliance requirements are met (GDPR, SOC2, HIPAA, etc. as applicable)

## Integration & Deployment

- [ ] Code is merged to the target branch
- [ ] CI pipeline is green for the merged commit
- [ ] Deployment artifacts are built and versioned
- [ ] Deployment to the staging environment is successful
- [ ] Smoke tests pass in the staging environment
- [ ] Rollback plan is documented and tested
- [ ] Release notes are drafted and approved by Product Owner
- [ ] Feature documentation is handed off to support or operations teams

## Final Sign-Off

- [ ] Product Owner has accepted the completed work
- [ ] QA lead has signed off on the release candidate
- [ ] Tech lead has confirmed all technical DoD items are met
- [ ] Scrum Master has verified the DoD checklist is complete
