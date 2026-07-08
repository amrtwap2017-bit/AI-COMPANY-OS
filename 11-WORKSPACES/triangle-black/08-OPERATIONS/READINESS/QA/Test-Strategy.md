# 04 — Test Strategy

> Quality assurance test strategy for Triangle Black.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | Testing-Strategy.md | Test pyramid, standards |
| PHASE-06 | All domains, 16-Testing.md | Domain test specifications |

## Test Pyramid

```
      ╱╲
     ╱ E2E ╲          Critical business workflows: Lead→Contract, Project→Invoice
    ╱────────╲
   ╱Integration╲      API endpoints, service integration, database
  ╱──────────────╲
 ╱   Unit Tests    ╲  Services, controllers, components, utilities
╱────────────────────╲
```

## Test Coverage Targets

| Test Type | Coverage Target | Tool |
|-----------|----------------|------|
| Unit (Services) | >= 80% | Jest |
| Unit (Components) | >= 80% | Vitest |
| Integration (API) | >= 70% | Jest + Supertest |
| E2E (Workflows) | Critical paths | Playwright |
| API Contract | All endpoints | Supertest |

## Test Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Local | Developer testing | Seed data |
| CI (GitHub Actions) | Automated PR checks | Seed data |
| Staging | Integration + UAT | Anonymized copy |
| Production | Smoke + monitoring | Live data |

## Test Execution

| Frequency | Type | Trigger |
|-----------|------|---------|
| Every commit | Unit + lint + typecheck | Pre-commit hook |
| Every PR | All unit + integration | GitHub CI |
| Daily | Full regression + E2E | Scheduled CI |
| Pre-release | Full suite + performance | Release tag |
| Post-deploy | Smoke tests | Deployment hook |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |

**Status:** ❌ NOT VALIDATED
