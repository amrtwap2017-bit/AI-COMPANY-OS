# 09 — Developer Experience

> Developer experience evolution for the engineering team.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — Engineering-Handbook.md | Engineering baseline |

## DX Principles

1. **Fast feedback** — Code → feedback in < 1 minute
2. **Low context switching** — Minimize interruptions
3. **Great tooling** — Invest in dev tooling
4. **Clear documentation** — Everything documented
5. **Automated everything** — No manual steps
6. **Consistent environment** — Everyone on same setup

## DX Initiatives

| Initiative | H1 | H2 | Impact |
|------------|----|----|--------|
| Pre-commit hooks | ✅ | ✅ | Lint/format before commit |
| Local dev environment | Docker Compose | Tilt/Skaffold | Fast setup |
| Hot reload | ✅ | ✅ | Instant feedback |
| Debug tooling | VS Code config | Remote debug | Easy debugging |
| API client | Bruno/Hoppscotch | Dedicated | Easy API testing |
| Database tool | pgAdmin | TablePlus | Easy DB access |
| Documentation | README + wiki | Docusaurus | Single source of truth |
| CI speed | < 10 min | < 5 min | Fast feedback |

## Dev Environment Setup

| Step | Automation | Time |
|------|-----------|------|
| Clone repo | Manual | 30s |
| Install dependencies | Script | 2 min |
| Start database | Docker Compose | 30s |
| Run migrations | Script | 1 min |
| Seed data | Script | 2 min |
| Start app | Script | 30s |
| Run tests | Script | 2 min |
| **Total** | **Automated** | **< 10 min** |

## DX Metrics

| Metric | Current | H1 Target | H2 Target |
|--------|---------|-----------|-----------|
| Dev setup time | — | < 10 min | < 5 min |
| CI feedback time | — | < 10 min | < 5 min |
| Build time (local) | — | < 30s | < 15s |
| Test run time (local) | — | < 2 min | < 1 min |
| Developer NPS | — | 40 | 60 |
| Onboarding time | — | < 5 days | < 2 days |
