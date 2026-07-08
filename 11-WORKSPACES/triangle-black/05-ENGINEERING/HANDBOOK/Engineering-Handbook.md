# Phase 04 — Engineering Handbook

> Engineering constitution for Triangle Black — 10 core principles.

## The Ten Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **Quality first** | Every PR passes lint, typecheck, test, build. No exceptions. |
| 2 | **Type safety** | TypeScript strict mode. No `any`. Prisma types everywhere. |
| 3 | **Defensive coding** | Validate all inputs. Never trust external data. Fail closed. |
| 4 | **Observability** | Every endpoint logs. Every event audits. Every error traces. |
| 5 | **Idempotency** | All mutations safe to retry. Side effects only on first execution. |
| 6 | **Single responsibility** | One module, one concern. No god classes. |
| 7 | **Testability** | Every service injectable. Every function pure where possible. |
| 8 | **Documentation as code** | Architecture documents mirror the code. Update both together. |
| 9 | **Security by default** | Auth on every endpoint. RBAC on every action. |
| 10 | **Startup efficiency** | Ship working software. No gold-plating. |

## Engineering Standards

See sub-directories for detailed standards:
- `00-MASTER-ENGINEERING-CONTEXT/` — Context and scope
- `05-CODING-STANDARDS/` — TypeScript, NestJS, React standards
- `06-DATABASE-STANDARDS/` — Prisma, SQL, migration standards
- `07-API-STANDARDS/` — REST design standards
- `08-FRONTEND-STANDARDS/` — UI component standards
- `09-BACKEND-STANDARDS/` — Service layer standards

## Quality

| Gate | Check | Tool |
|------|-------|------|
| Lint | Code style, no unused imports | ESLint |
| Typecheck | Type safety | TypeScript `tsc --noEmit` |
| Test | Unit + integration | Jest / Vitest |
| Build | Compilation | NestJS build / Next.js build |
| Security | Vulnerability scan | npm audit |

## Related Documents

- [Repository Engineering](Repository-Engineering.md) — Repo structure and conventions
- [Monorepo Architecture](Monorepo-Architecture.md) — Monorepo organization
- [Git Strategy](Git-Strategy.md) — Branching and commits
- [Coding Standards](Coding-Standards.md) — Language and framework standards
- [CI/CD](CI-CD.md) — Build and deployment pipeline
- [Testing Strategy](Testing-Strategy.md) — Testing approach
- [DevOps Architecture](DevOps-Architecture.md) — Infrastructure
- [Security Standards](Security-Standards.md) — Security requirements
- [Observability](Observability.md) — Logging and monitoring
- [AI Engineering](AI-Engineering.md) — AI development standards
