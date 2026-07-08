# Deployment

| Field | Value |
|---|---|
| Document ID | 18-Deployment-README |
| Document Purpose | Overview of deployment environments, process, and release management |
| Version | 1.0 |
| Status | Approved |

## Purpose

Define the deployment environments, release process, and operational procedures for the Triangle Black platform. Every environment must be reproducible from code and configuration alone.

## Environments

| Environment | Purpose | URL | Deploy Trigger |
|---|---|---|---|
| Development | Local development, hot reload | `http://localhost:3000` | Manual `docker compose up` |
| Staging | Pre-production validation | `https://staging.triangleblack.com` | CI on merge to `develop` |
| Production | Live customer-facing system | `https://triangleblack.com` | CI on merge to `main` |

## Contents

| File | Purpose |
|---|---|
| [Development.md](Development.md) | Local development environment setup |
| [Staging.md](Staging.md) | Staging environment configuration and process |
| [Production.md](Production.md) | Production architecture and deployment |
| [Release.md](Release.md) | Release process, versioning, release notes |
| [Rollback.md](Rollback.md) | Database and application rollback procedures |

## Business Rules

1. All deployments must be automated via CI/CD — no manual server changes
2. Staging must mirror production configuration (except scale)
3. Every release must be deployed to staging first
4. Rollback must be possible within 5 minutes
5. Database migrations must be backward-compatible for one release cycle

## Cross-References

- [14-Infrastructure/](../14-Infrastructure/) — Infrastructure definitions
- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — CI/CD pipeline
- [17-Engineering/Branching.md](../17-Engineering/Branching.md) — Release branches
