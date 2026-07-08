# Phase 04 — Repository Engineering

> Repository structure, conventions, and engineering practices.

## Repository Layout

```
triangle-black/
├── apps/          # Application packages (api, web, worker)
├── packages/      # Shared packages (shared, eslint-config)
├── docker/        # Docker configuration
├── scripts/       # Build, deploy, utility scripts
└── .github/       # CI/CD workflows
```

## Engineering Practices

| Practice | Standard |
|----------|----------|
| Code review | Required for all PRs, minimum 1 approval |
| Branch protection | main branch protected, no direct pushes |
| Commit style | Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) |
| Semantic versioning | `major.minor.patch` for releases |
| Changelog | Generated from commit history |
| Dependency management | Renovate bot for automated updates |

## Conventions

- All new code must have tests
- All new modules must have documentation
- All new APIs must have OpenAPI specs
- All new tables must have Prisma migrations

See `01-REPOSITORY-ENGINEERING/` for detailed repository setup.
