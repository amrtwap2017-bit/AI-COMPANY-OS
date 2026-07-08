# Branching

| Field | Value |
|---|---|
| Document ID | 17-Engineering-03 |
| Document Purpose | Define branching strategy for the Triangle Black repository |
| Version | 1.0 |
| Status | Approved |

## Strategy

[Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) with simplified naming.

## Branches

| Branch | Source | Merge Target | Purpose |
|---|---|---|---|
| `main` | — | — | Production-ready code. Protected — no direct pushes. |
| `develop` | `main` | `main` via release | Integration branch for features. |
| `feat/<issue>-<description>` | `develop` | `develop` | New features. |
| `fix/<issue>-<description>` | `develop` | `develop` | Bug fixes. |
| `hotfix/<issue>-<description>` | `main` | `main` & `develop` | Urgent production fixes. |
| `release/<version>` | `develop` | `main` & `develop` | Release preparation. |

## Naming Convention

```
<type>/<issue-number>-<short-description>
```

Examples:

```
feat/42-user-registration
fix/87-invalid-date-format
hotfix/93-login-500-error
release/1.2.0
```

Types: `feat`, `fix`, `hotfix`, `chore`, `refactor`, `docs`, `release`

## Workflow

### Feature Development

1. Branch from `develop`: `feat/123-feature-name`
2. Commit using conventional commits (see [Git.md](Git.md))
3. Push branch, open PR to `develop`
4. After PR approval, **squash merge** with cleanup
5. Delete feature branch after merge

### Hotfix

1. Branch from `main`: `hotfix/456-critical-fix`
2. Fix and test
3. Open PR to `main` (urgent review bypass possible with lead approval)
4. Merge to `main`, then cherry-pick into `develop`
5. Tag with patch version bump

### Release

1. Branch from `develop`: `release/1.2.0`
2. No new features — only bug fixes, documentation, release tasks
3. Update version, changelog
4. Open PR to `main` and `develop`
5. Tag merge commit on `main` with version

## Branch Protection (main)

- Require pull request before merging
- Require at least 1 approval
- Require status checks to pass (CI lint, test, build)
- Require branches to be up to date
- Do not allow bypass — even admins

## Cleanup

- Delete source branch after merge
- Orphan branches older than 30 days may be archived or deleted
- `git fetch --prune` regularly

## Cross-References

- [Git.md](Git.md) — Commit conventions for branches
- [PR-Review.md](PR-Review.md) — PR process for merging
- [CI-CD.md](CI-CD.md) — CI runs per branch
