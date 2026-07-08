# Environment Definition and Management

## Purpose

Define the purpose, configuration, and governance for each deployment environment. Consistent environment management prevents configuration drift, ensures security boundaries between stages, and provides a reliable progression path from development to production.

## Environment Overview

| Environment | Purpose | Users | Deploy Frequency | Data Strategy | Config Source |
|-------------|---------|-------|-----------------|---------------|---------------|
| Development | Local coding and debugging | Individual developers | Continuous (local) | Synthetic or anonymized | Local files + env vars |
| Integration | Shared feature validation | Development team | Per merge to main | Anonymized subset | Repository + CI/CD vars |
| Staging | Pre-production verification | QA, PM, stakeholders | Per release candidate | Realistic anonymized | Repository + secrets manager |
| Production | Live customer-facing service | End users | Per approved release | Real customer data | Secrets manager + feature flags |

## Development Environment

- **Purpose**: Local coding, testing, and debugging on developer workstations.
- **Who uses it**: Individual developers and AI coding agents.
- **Deployment frequency**: Continuous — code changes are reflected immediately.
- **Data strategy**: Synthetic data or a small anonymized subset. No real production data.
- **Configuration sources**: Local `.env` files (gitignored), default values in code, local secrets via developer's credentials.
- **Access control**: Developer-only. No shared access.
- **Connection to services**: Local service instances or containerized dependencies (database, cache, message queue).

## Integration Environment

- **Purpose**: Shared validation of integrated changes. The first environment where multiple developers' work is combined and tested.
- **Who uses it**: Development team, automated CI/CD pipelines.
- **Deployment frequency**: Automated — every merge to `main` triggers deployment.
- **Data strategy**: Anonymized subset of production data (no PII). Refreshed weekly from an anonymized production snapshot.
- **Configuration sources**: Committed configuration files with environment-specific overrides in CI/CD variables.
- **Secrets**: Stored in CI/CD secret store (e.g., GitHub Actions secrets, GitLab CI variables). No secrets in repository.
- **Access control**: Development team members. Authentication required. VPN or network restriction.
- **Stability**: May be unstable. Used for rapid validation, not for demos or external testing.
- **Monitoring**: Basic health checks and error logging. Alerting on build failures.

## Staging Environment

- **Purpose**: Pre-production verification. Mirrors production configuration to validate releases before deployment.
- **Who uses it**: QA engineers, product managers, stakeholders, performance testers.
- **Deployment frequency**: Per release candidate — manual trigger from CI/CD pipeline.
- **Data strategy**: Realistic anonymized data. Full volume simulation for performance testing. No real PII.
- **Configuration sources**: Production-identical configuration files with environment-specific overrides from secrets manager.
- **Secrets**: Stored in secrets manager (Vault, AWS Secrets Manager) with environment-specific paths.
- **Access control**: QA team, engineering leads, product managers. Strong authentication. VPN or zero-trust network access.
- **Stability**: Expected to be stable. Used for demos, UAT, and stakeholder reviews.
- **Monitoring**: Full observability stack (metrics, logs, traces, dashboards). Alerting configured to production thresholds.
- **SLA**: 99% uptime target during business hours.

## Production Environment

- **Purpose**: Live customer-facing service. Highest stability and security requirements.
- **Who uses it**: End users and customers.
- **Deployment frequency**: As needed per release approval. Typically weekly or bi-weekly.
- **Data strategy**: Real customer data. Full compliance with data protection regulations (GDPR, CCPA, etc.).
- **Configuration sources**: Secrets manager (Vault, AWS Secrets Manager). Feature flags. No configuration in repository that affects production behavior.
- **Secrets**: Stored in secrets manager with strict access control. Hardware security module (HSM) for encryption keys.
- **Access control**: Strict — limited to on-call engineers and SRE team. Break-glass access with audit trail. Multi-factor authentication required.
- **Deployment**: Automated rollout with canary or blue-green deployment. Manual approval gate with deployment freeze policy.
- **Monitoring**: Full observability with PagerDuty/OpsGenie alerting. SLO/SLI tracking. Incident response runbooks.
- **SLA**: 99.95% uptime (or as defined per service agreement).
- **Backup**: Automated daily backups. Point-in-time recovery capability. Disaster recovery plan tested quarterly.

## Configuration Source Hierarchy

Configurations are resolved in the following order (later sources override earlier ones):

1. **Hardcoded defaults** in application code
2. **Committed configuration files** (config/default.yaml)
3. **Environment-specific config files** (config/production.yaml)
4. **Environment variables** (CI/CD injected)
5. **Secrets manager** (runtime resolved)
6. **Feature flags** (runtime toggles)

## Environment Promotion Gates

Changes must pass the following gates to progress through environments:

```
Development → Integration → Staging → Production
```

| Gate | Development → Integration | Integration → Staging | Staging → Production |
|------|--------------------------|----------------------|----------------------|
| Build | Must compile | Must compile | Must compile |
| Unit tests | Must pass | Must pass | Must pass |
| Integration tests | — | Must pass | Must pass |
| Security scan | — | Must pass | Must pass |
| Code review | Required | Required | Required |
| Performance tests | — | — | Must pass (no regression) |
| Manual QA approval | — | Required | Required |
| Stakeholder approval | — | — | Required |
| Change advisory board | — | — | For major releases |

## Environment Parity

Efforts must be made to keep environments as similar as possible:

- Same application version across environments
- Same dependency versions
- Same configuration structure (different values only for secrets and environment-specific settings)
- Same deployment method (containerized, same orchestrator)
- Same monitoring stack

Differences between environments (e.g., smaller instance sizes in non-production) must be documented and justified.
