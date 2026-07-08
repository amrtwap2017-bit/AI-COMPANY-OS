# Phase 04 — Git Strategy

> Git branching, commit conventions, and release strategy.

## Branching Model

```
main ────┬────────┬────────┬────────┬────────┬────────┬────────►
         │        │        │        │        │        │
         ├────────┤        │        │        │        │
         │ feat/* │        │        │        │        │
         └────────┘        │        │        │        │
                  ├────────┤        │        │        │
                  │ fix/*  │        │        │        │
                  └────────┘        │        │        │
                           ├────────┤        │        │
                           │ chore/*│        │        │
                           └────────┘        │        │
                                    ├────────┤        │
                                    │ release│        │
                                    └────────┘        │
                                             ├────────┤
                                             │ hotfix  │
                                             └────────┘
```

## Branch Naming

| Branch Type | Pattern | Source |
|-------------|---------|--------|
| Feature | `feat/{short-description}` | main |
| Bug Fix | `fix/{short-description}` | main |
| Chore | `chore/{short-description}` | main |
| Release | `release/v{major}.{minor}.{patch}` | main |
| Hotfix | `hotfix/{short-description}` | main |

## Commit Conventions

```
feat(commercial): add lead scoring AI agent
 ^      ^               ^
 |      |               └── Description (imperative)
 |      └── Scope (module/domain)
 └── Type (feat, fix, chore, docs, test, refactor, perf, security)
```

## Release Process

1. Create `release/v{major}.{minor}.{patch}` branch from main
2. Run full test suite, build, and staging deploy
3. Create GitHub Release with auto-generated changelog
4. Merge release branch to main with version tag

See `03-GIT-STRATEGY/` for detailed git configuration.
