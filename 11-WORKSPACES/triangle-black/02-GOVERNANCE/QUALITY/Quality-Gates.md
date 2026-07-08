# 07 — Quality Gates

> Phase completion criteria and automated quality checks.

## Gate Levels

| Gate | Scope | Enforcement | Blocking |
|------|-------|-------------|----------|
| GATE-0 | PR-level | Automated (CI) | Yes |
| GATE-1 | Phase completion | Manual review | Yes |
| GATE-2 | Cross-phase consistency | Manual audit | Advisory |
| GATE-3 | Production readiness | Review board | Yes |

## GATE-0: PR Quality Gates

Every pull request must pass:

| Check | Tool | Criteria |
|-------|------|----------|
| Lint | ESLint / Ruff | Zero errors, zero warnings |
| Typecheck | TypeScript `tsc --noEmit` | Zero type errors |
| Unit Tests | Jest / Vitest | 80%+ coverage, zero failures |
| Build | Next.js / NestJS build | Zero build errors |
| Dependency check | `npm audit` | Zero critical vulnerabilities |
| Formatting | Prettier | Consistent formatting |
| File naming | Manual (CI-assisted) | Matches SHARED/Naming-Conventions.md |

## GATE-1: Phase Completion Gates

| Phase | Criteria | Status |
|-------|----------|--------|
| 00 | Vision documented, business model validated, revenue architecture complete | ✅ |
| 01 | Business architecture complete, DDD context map done, all workflows documented | ✅ |
| 02 | All architecture documents written, technology decisions made | ✅ |
| 03 | 29 requirements → 49 APIs → 25 DB tables → 22 screens traced, readiness ≥ 8/10 | ✅ (9.2/10) |
| 04 | Engineering constitution written (10 principles), 7 exit criteria met | ✅ (7/7) |
| 05 | 25 files produced, working Prisma + NestJS auth, CI/CD, Docker, 10/10 exit criteria | ✅ (10/10) |
| 06 | 285 files across 13 domains, each with 20-file template, dependency graph acyclic | ✅ |
| 07 | 12 integration documents, 10/10 criteria (Business, Security, Budget, Scalability) | ✅ |

## GATE-2: Cross-Phase Consistency Gates

| Check | Method | Frequency |
|-------|--------|-----------|
| ADR compliance | Verify decisions applied across all phases | Per phase |
| Naming consistency | Verify SHARED/Naming-Conventions.md applied | Quarterly |
| Traceability | Verify requirement→API→DB→Screen mapping | Per phase |
| Dependency acyclicity | Graph validation script | Per release |
| Design freeze | Verify no Phase 0-4 modifications | Per PR to those directories |

## GATE-3: Production Readiness Gates

| Check | Criteria |
|-------|----------|
| Security audit | No hardcoded secrets, JWT properly configured, HTTPS enforced |
| Backup verified | Automated backup pipeline tested with restore |
| Monitoring active | Health checks, logging, alert thresholds configured |
| Runbook complete | Incident response, deployment rollback, recovery documented |
| Load test passed | VPS handles target concurrent users |
| UAT signed off | Business users approve end-to-end workflow |

## Phase 7 Final Gate Assessment

| Criteria | Status | Evidence |
|----------|--------|----------|
| Business Alignment | ✅ | All integrations map to Phase 6 revenue-generating domains |
| Hospitality Alignment | ✅ | V1 deferral on PMS, manual CSV for hotel systems |
| DDD Alignment | ✅ | ACLs, contracts, events — no internal domain modification |
| Security | ✅ | JWT/API keys, no open endpoints, secrets management |
| Startup Budget | ✅ | $0-40/mo additional infrastructure cost |
| Scalability | ✅ | Horizontal scaling path documented in V2 roadmap |
| Future SaaS Readiness | ✅ | Integration boundaries designed for multi-tenant |
| Traceability | ✅ | All integration events trace to Phase 6 domain events |
| No Vendor Lock-in | ✅ | Open source only, Docker portable |
| API Standards | ✅ | RFC 7807 errors, versioning, rate limiting |
| Enterprise Architecture Consistency | ✅ | Follows 01-ARCHITECTURE-PRINCIPLES.md |

## Gate Failure Protocol

1. Gate failure blocks phase sign-off
2. Root cause documented in 06-RISK-REGISTER.md
3. Remediation plan approved before re-check
4. Escalation to CTO if gate fails twice
