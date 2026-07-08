# Continuous Delivery

## Purpose

Continuous Delivery ensures that every change is a potential release candidate. The pipeline automates the entire journey from commit to production, with quality gates at every stage. Deployment is a low-risk, frequent, and automated event.

## Automated Pipeline Stages

```
Commit → Build → Test → Security Scan → Package → Deploy to Staging → Integration Tests → Performance Tests → Approve → Deploy to Production
```

### Stage 1: Commit

- **Trigger**: Any push to any branch.
- **Actions**:
  - Secret scanning (pre-commit hook + CI).
  - Commit message format validation (Conventional Commits).
  - Branch naming convention validation.
- **Duration**: < 10 seconds.
- **Outcome**: Commit accepted and continues, or rejected with feedback.

### Stage 2: Build

- **Trigger**: Commit accepted.
- **Actions**:
  - Dependency resolution (exact versions from lockfile).
  - Compilation / transpilation.
  - Artifact generation (binary, container image, package).
  - Dependency vulnerability scan.
- **Duration**: < 2 minutes (target).
- **Outcome**: Build artifact produced and cached for subsequent stages.

### Stage 3: Test

- **Trigger**: Build successful.
- **Actions**:
  - Unit tests (full suite).
  - Linting and static analysis.
  - Code coverage check (new code ≥ 80%).
  - License compliance scan.
- **Duration**: < 5 minutes (target).
- **Outcome**: Test results published. Coverage report published. Pipeline continues on pass.

### Stage 4: Security Scan

- **Trigger**: Tests pass.
- **Actions**:
  - SAST (Static Application Security Testing) — e.g., SonarQube, Semgrep.
  - Dependency vulnerability scan.
  - Container image vulnerability scan (if applicable).
  - Secret scanning (full repository scan).
  - License compliance scan.
- **Duration**: < 5 minutes.
- **Outcome**: Security report published. Critical/high findings block the pipeline.

### Stage 5: Package

- **Trigger**: Security scan passes.
- **Actions**:
  - Create deployable artifact (container image, JAR, ZIP).
  - Sign artifact (if required).
  - Push artifact to artifact registry (Docker registry, package repository).
  - Tag artifact with commit SHA and version (if release).
- **Duration**: < 2 minutes.
- **Outcome**: Immutable, versioned artifact stored in registry.

### Stage 6: Deploy to Staging

- **Trigger**: Artifact packaged.
- **Actions**:
  - Update staging environment with new artifact.
  - Zero-downtime deployment (blue-green or rolling update).
  - Health check verification (liveness, readiness).
  - Smoke tests (critical user journeys).
- **Duration**: < 5 minutes.
- **Outcome**: Staging environment running new version. Smoke tests pass.

### Stage 7: Integration Tests

- **Trigger**: Staging deployment verified.
- **Actions**:
  - End-to-end test suite (critical paths).
  - API contract tests.
  - Integration tests against real dependencies.
  - Database migration tests.
- **Duration**: < 10 minutes.
- **Outcome**: All tests pass. Pipeline continues.

### Stage 8: Performance Tests

- **Trigger**: Integration tests pass.
- **Actions**:
  - Load test against key endpoints (e.g., 1000 concurrent users).
  - Response time comparison against baseline.
  - Resource utilization check (CPU, memory, database connections).
  - Performance regression detection (> 10% degradation blocks).
- **Duration**: < 15 minutes.
- **Outcome**: Performance report published. No regression beyond threshold.

### Stage 9: Approve

- **Trigger**: Performance tests pass.
- **Actions**:
  - Automated approval (standard change) or manual approval (major change).
  - Deployment window check (is deployment during freeze?).
  - Change advisory board notification (if required).
- **Duration**: Variable — immediate (auto) to 24 hours (manual).
- **Outcome**: Deployment to production authorized.

### Stage 10: Deploy to Production

- **Trigger**: Approval granted.
- **Actions**:
  - Execute zero-downtime deployment strategy.
  - Progressively roll out (canary or blue-green).
  - Monitor health metrics during rollout.
  - Auto-rollback on health metric degradation.
  - Full rollout after verification.
- **Duration**: < 15 minutes.
- **Outcome**: New version serving production traffic. Rollback available.

## Pipeline as Code

The entire pipeline is defined as code in the repository:

- **Tool**: GitHub Actions, GitLab CI, Jenkins Pipeline, or equivalent.
- **Location**: `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`
- **Versioned**: Pipeline changes go through the same review process as code changes.
- **Testable**: Pipeline changes can be tested on a branch before merging to main.

## Zero-Downtime Deployment Strategies

### Blue-Green Deployment

- Two identical environments ("blue" and "green").
- One environment serves all production traffic.
- New version is deployed to the idle environment.
- Traffic is switched (load balancer, DNS) to the updated environment.
- Rollback: Switch traffic back to the previous environment.

### Rolling Update

- Instances are updated incrementally (e.g., 20% at a time).
- Each new instance passes health checks before the next batch is updated.
- Rollback: Revert to previous version across all instances.
- Best suited for: Stateless services, containerized workloads.

### Canary Deployment

- A small percentage of traffic (e.g., 5%) is routed to the new version.
- Traffic is gradually increased as metrics confirm stability.
- Rollback: Route remaining traffic away from the new version.
- Best suited for: High-traffic services where gradual validation is critical.

### Feature Flags

- The new code is deployed but hidden behind a feature flag.
- The flag is enabled for internal users first, then percentage-based rollout.
- Rollback: Disable the feature flag (no redeployment needed).
- Note: Feature flags are complementary to deployment strategies, not a replacement.

## Deployment Automation Rules

| Rule | Description |
|------|-------------|
| **No manual deployment to production** | All production deployments go through the automated pipeline |
| **Immutable artifacts** | Once built, an artifact is never modified. Rebuild for changes |
| **Automatic rollback** | Pipeline detects health degradation and rolls back automatically |
| **Deployment freeze windows** | Configurable per period (holiday, end-of-quarter). Pipeline respects these windows |
| **Approval gates** | Configurable per environment. Staging: automatic. Production: manual for major changes |
| **Audit trail** | Every deployment is logged with artifact version, approver, and timestamp |
