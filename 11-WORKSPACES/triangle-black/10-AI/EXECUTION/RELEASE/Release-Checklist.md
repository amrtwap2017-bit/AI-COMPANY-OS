# Release Checklist

## Purpose

The Release Checklist ensures that every release follows a consistent, repeatable process. It serves as the definitive guide for release execution and is completed by the Release Manager for every release.

## Pre-Release

### Scope and Readiness

- [ ] Release scope is defined and documented.
- [ ] All features in scope meet the Definition of Done.
- [ ] All features in scope have passed business review.
- [ ] Out-of-scope items are communicated and deferred.

### Bugs and Issues

- [ ] All P0 (critical) bugs are fixed and verified.
- [ ] All P1 (high) bugs are fixed and verified.
- [ ] P2 bugs are reviewed and either fixed or deferred with approval.
- [ ] No known issues would prevent successful deployment.

### Quality Gates

- [ ] Architecture Review: Passed.
- [ ] Code Review: All code in the release has been reviewed.
- [ ] Business Review: All features have business sign-off.
- [ ] QA Review: All test levels passed, coverage thresholds met.
- [ ] Security Review: No critical/high findings. All findings addressed.
- [ ] Performance Review: SLAs met, load tests passed.
- [ ] Documentation Review: All documentation is current.
- [ ] Executive Approval: Obtained.

### Release Artifacts

- [ ] Release candidate is built and tagged (e.g., `v1.2.0-rc.1`).
- [ ] Docker images are built, tagged, and pushed to the registry.
- [ ] Image vulnerability scan passes (no critical/high findings).
- [ ] Database migrations are included and tested.
- [ ] Down migration scripts are verified.

### Staging Deployment

- [ ] Release candidate is deployed to the staging environment.
- [ ] Staging deployment completed successfully.
- [ ] Smoke tests pass in staging.
- [ ] Integration tests pass in staging.
- [ ] UAT (User Acceptance Testing) is completed (if applicable).
- [ ] Performance tests in staging meet SLAs.

### Rollback Plan

- [ ] Rollback procedure is documented.
- [ ] Rollback scripts are tested (code revert + database down migrations).
- [ ] Rollback time estimate is calculated and acceptable.
- [ ] Rollback triggers and decision criteria are defined.
- [ ] Rollback team members are identified.

### Release Notes and Communication

- [ ] Release notes are complete and reviewed.
- [ ] Breaking changes section is present with migration guides.
- [ ] Known issues are documented.
- [ ] Upgrade instructions are clear.
- [ ] Stakeholders are notified of release timing.
- [ ] Support team is briefed on the release.
- [ ] Marketing/communications team is briefed (if customer-facing).

### Environment and Configuration

- [ ] Environment variables for production are documented.
- [ ] Configuration changes for production are reviewed.
- [ ] Secrets are updated in the secret management system (if changed).
- [ ] Third-party service credentials are verified (if changed).

## During Release

### Deployment Execution

- [ ] Deployment window is confirmed and started.
- [ ] Database migrations are executed (if applicable).
- [ ] Application services are deployed.
- [ ] Configuration is applied.
- [ ] Feature flags are configured (if applicable).

### Health Checks

- [ ] Liveness check: Service is running.
- [ ] Readiness check: Service is ready for traffic.
- [ ] All service instances are healthy.
- [ ] Dependencies are reachable (database, cache, queues, external services).
- [ ] API endpoints respond correctly.

### Monitoring and Alerting

- [ ] Monitoring dashboards are active for the release.
- [ ] Alerts are configured for new components or metrics.
- [ ] On-call team is aware of the release.
- [ ] Error tracking is active.

## Post-Release

### Validation

- [ ] Production validation tests pass (smoke tests).
- [ ] Key user journeys are verified in production.
- [ ] Error rate is within acceptable range.
- [ ] Response times are within SLAs.
- [ ] Data integrity is confirmed.

### Monitoring Period

- [ ] Monitoring is active for the next 24-48 hours.
- [ ] Performance metrics are stable (no degradation).
- [ ] Error rates remain at or below baseline.
- [ ] No unexpected behavior observed.

### Communication

- [ ] Release completion is communicated to all stakeholders.
- [ ] Post-release status is shared with the team.
- [ ] Support team is informed of successful deployment.

### Housekeeping

- [ ] Release branch is merged or tagged appropriately.
- [ ] Release artifacts are archived.
- [ ] Changelog is finalized.
- [ ] Version tags are pushed to the repository.
- [ ] Release notes are published.

### Retrospective

- [ ] Release retrospective is scheduled (within 1 week).
- [ ] Issues encountered during release are documented.
- [ ] Improvement actions are created and assigned.
- [ ] Release process improvements are incorporated.

## Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Release Manager | | | |
| Engineering Lead | | | |
| QA Lead | | | |
| Product Owner | | | |
| Operations Lead | | | |
| Security Lead | | | |

## Checklist Archive

The completed release checklist is archived with the release artifacts. It serves as an audit trail for the release and a reference for future release planning.
