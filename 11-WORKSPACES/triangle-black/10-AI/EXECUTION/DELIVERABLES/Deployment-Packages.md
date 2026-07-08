# Deployment Packages Deliverable Contract

## Purpose

Ensure that every deployment package is complete, reproducible, and deployable to target environments with minimal manual intervention.

## Requirements

### 1. Docker Image Built and Tagged

- A Docker image must be built for every deployable component.
- Image tagging convention:
  - `latest`: Most recent stable build
  - `<version>`: Semantic version tag (e.g., `1.2.3`)
  - `<commit-sha>`: Short commit hash for traceability
  - `<environment>`: Dev, staging, production tags as needed
- The image must be built from a Dockerfile checked into version control.
- Multi-stage builds must be used to minimize image size.
- Base images must be pinned to specific versions and scanned for vulnerabilities.

### 2. Configuration Files Updated

- All configuration files must be aligned with the current release.
- Configuration must be externalized (environment variables, config maps, or secrets).
- Configuration templates must be version-controlled with sensible defaults.
- Environment-specific configuration must use override patterns.
- No hardcoded environment-specific values in default configuration.

### 3. Environment Variables Documented

- All environment variables required by the application must be documented:
  - Variable name
  - Purpose
  - Required or optional
  - Default value (if any)
  - Example value
  - Sensitivity classification (public, internal, secret)
- Environment variable documentation must be kept in the project repository.

### 4. Database Migrations Included

- All database migrations for the release must be included in the deployment package.
- Migrations must be executable in the deployment pipeline.
- Migration order must be deterministic.
- Migration scripts must be idempotent where possible.
- Failed migrations must trigger an automatic rollback or halt the deployment.

### 5. Health Check Endpoints Verified

- Every service must expose health check endpoints:
  - `/health/liveness`: Is the service running?
  - `/health/readiness`: Is the service ready to accept traffic?
- Health check endpoints must return appropriate HTTP status codes (200 for healthy, 503 for unhealthy).
- Health checks must verify critical dependencies (database, cache, external services).
- Health check responses must include a status field and optional detail.

### 6. Rollback Procedure Documented

- Each deployment package must include a documented rollback procedure:
  - Rollback trigger conditions
  - Step-by-step rollback instructions
  - Database rollback migration scripts (if applicable)
  - Estimated rollback time
  - Rollback validation steps
- The rollback procedure must be tested before production deployment.

### 7. Artifact Reproducibility

- Build artifacts must be reproducible from the same commit.
- Build scripts must be idempotent.
- Dependency lock files must be committed (package-lock.json, yarn.lock, requirements.txt, etc.).
- Build timestamps and version information must be embedded in the artifact.

### 8. Security Scanning

- The deployment package must pass security scanning:
  - Container image vulnerability scan
  - Dependency vulnerability scan
  - Static application security testing (SAST)
- Critical and high-severity vulnerabilities must be resolved before deployment.

## Verification

| Check | Tool/Method | Pass/Fail |
|---|---|---|
| Docker build | CI pipeline | Pass |
| Image tag convention | CI pipeline | Pass |
| Config alignment | Review | Pass |
| Env var documentation | Review | Pass |
| Migrations included | CI pipeline | Pass |
| Health check verification | Post-deploy test | Pass |
| Rollback procedure | Review | Pass |
| Security scan | CI pipeline | Pass |

## Non-Compliance

Deployment packages that fail any verification check are blocked from promotion to staging and production environments.
