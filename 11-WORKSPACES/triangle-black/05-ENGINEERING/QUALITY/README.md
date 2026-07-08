# 22 — Definition of Done

## DoD Checklist

A feature is **done** only when ALL of these conditions are met:

### Business
- [ ] Feature traces to a requirement ID (Phase 3 Traceability Matrix)
- [ ] Acceptance criteria verified by Product Owner
- [ ] Feature works in staging environment

### Technical
- [ ] Code follows Phase 4 coding standards
- [ ] All API endpoints return correct status codes and response shapes
- [ ] Error states handled: loading, empty, error, edge cases
- [ ] Database migrations verified (up + down)
- [ ] N+1 queries eliminated
- [ ] Pagination implemented for all list endpoints
- [ ] Performance: queries < 100ms (indexed), pages Lighthouse 90+

### Documentation
- [ ] README updated (if new module/feature)
- [ ] API docs updated (if endpoint changed)
- [ ] ADR written (if architecture decision)
- [ ] Environment variables documented in `.env.example`

### Tests
- [ ] Unit tests: 80%+ coverage on new code
- [ ] Branch coverage: 70%+ on new code
- [ ] Integration tests: happy path + error paths
- [ ] All existing tests pass
- [ ] No flaky tests

### Security
- [ ] No secrets committed
- [ ] Authentication required for all non-public endpoints
- [ ] Authorization enforced (role/permission check)
- [ ] Input validated (DTO + class-validator)
- [ ] Rate limiting applied
- [ ] Security headers present

### Performance
- [ ] Database queries use indexes
- [ ] No N+1 queries
- [ ] Response time < 200ms for p95
- [ ] Lighthouse: Performance >= 90, Accessibility >= 90
- [ ] Bundle size: no unnecessary dependencies

### Release
- [ ] CHANGELOG updated
- [ ] Version bumped (if applicable)
- [ ] Migration script tested
- [ ] Rollback plan documented (if migration)

## DoD for Bug Fixes

- [ ] Root cause identified and documented
- [ ] Regression test added
- [ ] Fix verified in staging
- [ ] No new issues introduced

## DoD for Infrastructure

- [ ] Works with `docker compose up`
- [ ] Health check endpoint responds
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Rollback procedure documented
- [ ] Runbook written
