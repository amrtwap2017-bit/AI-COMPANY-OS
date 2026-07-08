# Automated Release Rules

## Overview

The Release Manager AI automates the build, versioning, and deployment of software releases. The release automation system ensures that every release is reproducible, traceable, and follows consistent procedures across all deployment stages from development to production.

## Versioning

### Semantic Versioning (SemVer)

All releases follow the Semantic Versioning 2.0.0 specification:

```
MAJOR.MINOR.PATCH (e.g., 1.4.2)
```

| Component | Increment Trigger | Example |
|-----------|------------------|---------|
| MAJOR | Breaking API or data model changes | 1.0.0 to 2.0.0 |
| MINOR | New features, backward compatible | 1.0.0 to 1.1.0 |
| PATCH | Bug fixes, backward compatible | 1.0.0 to 1.0.1 |

### Pre-release Versions

Pre-release versions use the format: `MAJOR.MINOR.PATCH-PRERELEASE.BUILD`

- `1.0.0-alpha.1` - Early feature development
- `1.0.0-beta.2` - Feature complete, testing phase
- `1.0.0-rc.3` - Release candidate, final validation

### Version Determination

Version is automatically determined from commit history:

1. Scan commits since last tagged version
2. Check for `BREAKING CHANGE:` in commit messages (MAJOR bump)
3. Check for `feat:` commits since last version (MINOR bump)
4. Default to PATCH bump if only `fix:`, `refactor:`, `docs:`, etc.
5. Pre-release and build metadata appended for non-production builds

### Version Tagging

Each release commit is tagged with the version:

```
git tag -a v{MAJOR}.{MINOR}.{PATCH} -m "Release v{MAJOR}.{MINOR}.{PATCH}"
```

Tags are pushed to the repository and used as immutable release references.

## Changelog Generation

### Automated Changelog

The changelog is automatically generated from commit history at release time:

```
v{version} changelog = AGGREGATE(previous_tag..HEAD, COMMITS)
```

### Entry Format

```
## [{version}] - {YYYY-MM-DD}

### Added
- {list of feature commits}

### Changed
- {list of refactoring or enhancement commits}

### Fixed
- {list of bug fix commits}

### Deprecated
- {list of deprecation notices}

### Removed
- {list of removed features}

### Security
- {list of security fixes}
```

### Grouping Rules

Commits are grouped into changelog sections based on conventional commit types:

| Commit Type | Changelog Section |
|------------|-------------------|
| feat | Added |
| fix | Fixed |
| refactor | Changed |
| perf | Changed |
| docs | (link to documentation changelog) |
| style | (omitted unless significant) |
| chore | (omitted unless significant) |
| BREAKING CHANGE | Added, with BREAKING marker |
| deprecated | Deprecated |
| security | Security |
| revert | Fixed |

### Breaking Change Highlighting

Breaking changes are highlighted with:

```
### Added
- User authentication v2 API [BREAKING]
  - Old `/api/v1/auth/login` endpoint removed
  - New `/api/v2/auth/login` requires `{email, password}` format
  - Migration guide: [...]
```

## Build Artifact Creation

### Build Pipeline

The release build pipeline executes in sequence:

```
Source Code (tagged commit)
    |
    v
[Clean Install] - npm ci / mvn clean install
    |
    v
[Compilation] - tsc / mvn compile
    |
    v
[Static Analysis] - ESLint, SonarQube, security scan
    |
    v
[Test Execution] - Unit, integration, E2E tests
    |
    v
[Package] - Build artifacts, container images
    |
    v
[Sign & Checksum] - GPG signing, SHA256 checksum
    |
    v
[Publish] - Artifact registry, container registry
```

### Artifact Types

| Artifact | Format | Storage |
|----------|--------|---------|
| Application package | .tar.gz, .zip | Artifact registry (Nexus/Artifactory) |
| Container image | Docker image | Container registry (Docker Hub/ECR) |
| Database migration | SQL scripts | Versioned migration directory |
| Configuration | YAML/JSON templates | Config repository |
| Documentation | PDF, HTML | Documentation site |
| SBOM | SPDX/CycloneDX | Artifact metadata |

### Build Metadata

Each build produces metadata:

```yaml
build:
  version: "1.4.2"
  commit: "a1b2c3d4e5f6..."
  branch: "main"
  timestamp: "2026-06-15T14:30:00Z"
  builder: "Release Manager AI v2.1"
  artifacts:
    - name: "app-server.tar.gz"
      size: "45MB"
      checksum: "sha256:a1b2c3..."
      signature: "gpg-sig:..."
  dependencies:
    - name: "express"
      version: "4.18.2"
    - name: "typescript"
      version: "5.4.5"
```

## Deployment Stages

### Stage Definitions

```
Dev  -->  Staging  -->  Production
  |           |            |
  v           v            v
Auto      Auto        Manual Approval
deploy    deploy      (with automation)
```

### Development Deployment

- Trigger: Every merge to develop/main branch
- Environment: Shared development environment
- Validation: Automated smoke tests
- Data: Synthetic test data
- Rollback: Automatic on failure
- Retention: Last 5 builds

### Staging Deployment

- Trigger: Release branch created, successful dev deployment
- Environment: Pre-production (mirrors production)
- Validation: Full test suite (integration, E2E, performance)
- Data: Anonymized production clone
- Rollback: Automatic on critical test failure
- Retention: Release candidate builds

### Production Deployment

- Trigger: Release candidate approved, manual go-ahead
- Environment: Production
- Strategy: Blue-green or canary deployment
- Validation: Smoke tests, health checks, monitoring baseline
- Data: Production data (no seed)
- Rollback: Either automatic (health check failure) or manual
- Approval: Required from release manager or designate

### Deployment Strategies

**Blue-Green Deployment:**
1. Deploy new version to inactive environment (green)
2. Run smoke tests against green
3. Switch traffic from blue to green
4. Monitor for stabilization period (15 min)
5. Keep blue as rollback target

**Canary Deployment:**
1. Deploy to 5% of instances
2. Monitor error rates and latency for 10 minutes
3. Increase to 25% and monitor
4. Increase to 50% and monitor
5. Full rollout (100%)
6. Halt and rollback if any stage exceeds error threshold

## Rollback Procedure

### Automatic Rollback Triggers

The system automatically initiates rollback when:

1. Health check fails within 15 minutes of deployment
2. Error rate increases by more than 50% from baseline
3. PagerDuty alert triggered by deployment
4. Key business metric (e.g., checkout success rate) drops below threshold
5. Database migration failure detected
6. Rollback command received from authorized pipeline trigger

### Rollback Steps

```
1. Halt further traffic to new version
2. Restore previous version artifacts
3. Revert database migration (if applicable)
4. Point traffic back to previous version
5. Run smoke tests on restored version
6. Confirm system health metrics return to baseline
7. Notify stakeholders of rollback
```

### Rollback Types

| Type | Scope | Duration | Data Loss Risk |
|------|-------|----------|---------------|
| Code rollback | Application code only | < 5 minutes | None |
| Full rollback | Code + configuration | < 10 minutes | None |
| Database rollback | Code + schema migration | < 30 minutes | Possible (data written during rollback window) |
| Full environment rebuild | Complete environment teardown and rebuild | < 60 minutes | None (infrastructure as code) |

### Rollback Testing

Rollback procedures are tested:

- Automatically in staging environment before every production deployment
- Quarterly disaster recovery drill simulating full production rollback
- Rollback success rate tracked as a release metric (target: 100%)

### Post-Rollback Actions

After rollback, the system:

1. Creates a rollback incident report with timestamps and root cause
2. Generates fix tasks for the issue that caused rollback
3. Updates deployment status in tracking system
4. Notifies all stakeholders with rollback summary
5. Blocks subsequent production deployments until fix is validated

### Release Freeze

After a production rollback, an automatic 2-hour release freeze is applied to allow incident investigation and prevent cascading failures.
