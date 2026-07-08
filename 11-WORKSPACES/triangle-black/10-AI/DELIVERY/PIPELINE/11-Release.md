# Stage 11: Release

## Purpose

Build the release artifact, tag the release, and deploy the feature to the target environment following DevOps best practices.

## Agent Role

**DevOps Architect AI** — Responsible for build, tagging, deployment, and release verification.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Merged Code on Main | Feature branch merged to main with post-merge CI passing |
| Release Version | Next semantic version determined (major.minor.patch) |
| Deployment Target | Target environment identified (staging, production) |
| Infrastructure Ready | Target environment is provisioned and accessible |

## Process

### Step 1: Determine Release Version
- Follow semantic versioning: `MAJOR.MINOR.PATCH`.
  - MAJOR: breaking API or schema changes.
  - MINOR: new features, backward-compatible.
  - PATCH: bug fixes, backward-compatible.
- Check the changelog for any unreleased breaking changes.
- Update version in `package.json` (and any other version files).

### Step 2: Build Release Artifact
- Run production build: `npm run build` or equivalent.
- For containerized deployments: build Docker image with version tag.
- Run security scan on the built artifact (dependency audit, container scan).

### Step 3: Create Release Tag
- Git tag format: `v<MAJOR>.<MINOR>.<PATCH>` (e.g., `v2.3.0`).
- Annotated tag with release notes:
  ```
  git tag -a v2.3.0 -m "Release v2.3.0: Order Processing Feature"
  ```
- Push tag to remote: `git push origin v2.3.0`.

### Step 4: Update Changelog
- Move `[Unreleased]` entries to the new release version.
- Add release date.
- Create header: `## [2.3.0] - 2026-07-02`.
- Commit changelog update.

### Step 5: Deploy to Target Environment
- Trigger deployment pipeline for the target environment.
- Run database migrations (if applicable) as part of deployment.
- Verify:
  - Health check endpoint returns 200.
  - Key feature API endpoints respond correctly.
  - Frontend loads without errors.
  - Background jobs (if any) start correctly.

### Step 6: Smoke Test Deployment
- Run a subset of E2E tests against the deployed environment.
- Verify critical user journeys work in the deployed environment.
- Monitor application logs for errors during the first 5 minutes post-deployment.

### Step 7: Document Release
- Write the release artifact to `.release.md`.
- Include version, changelog, deployment summary, and verification results.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Release Artifact Built | Docker image or build artifact created and tagged |
| Release Tagged | Git tag created and pushed |
| Deployed Successfully | Application running in target environment |
| Health Check Passes | Health endpoint returns HTTP 200 |
| Smoke Tests Pass | Critical E2E tests pass against deployment |
| Changelog Updated | Release notes finalized and committed |

## Artifact Template

```markdown
# Release: v<MAJOR>.<MINOR>.<PATCH>

**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Version
- **Version**: v2.3.0
- **Build Number**: 456
- **Commit**: `a1b2c3d4e5f6...`
- **Tag**: `v2.3.0`

## Changelog
### Added
- Feature: Order Processing — create and manage orders (PR #42)
### Fixed
- Bug: Payment timeout handling (PR #40)

## Deployment
- **Environment**: staging
- **Deployment Method**: Docker Compose
- **Database Migrations**: 2 migrations applied

## Verification
| Check | Result |
|-------|--------|
| Health endpoint | ✅ HTTP 200 |
| API: POST /api/orders | ✅ 201 Created |
| API: GET /api/orders/:id | ✅ 200 OK |
| Frontend: /orders | ✅ Page loads |
| E2E: Order flow | ✅ 3/3 tests passed |
| Log errors (5min) | ❌ 0 errors |

## Rollback Plan
- Revert to previous tag: `v2.2.0`
- Rollback DB migration: `prisma migrate resolve --rolled-back <migration>`
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Build fails | Review build logs, fix issues, rebuild |
| Deployment fails | Check infrastructure logs, verify configuration, retry |
| Health check fails | Rollback to previous version, investigate root cause |
| Smoke tests fail | Rollback and investigate test failures |
| Migration fails | Execute rollback migration, restore backup if needed |
| Security scan fails | Fix vulnerable dependencies, rebuild, re-deploy |

## Cross-References

- [10-Merge.md](./10-Merge.md)
- [Pipeline README](./README.md)
