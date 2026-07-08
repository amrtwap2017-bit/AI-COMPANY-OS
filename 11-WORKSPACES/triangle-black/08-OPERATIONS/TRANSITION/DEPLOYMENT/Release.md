# Release

| Field | Value |
|---|---|
| Document ID | 18-Deployment-04 |
| Document Purpose | Define the release process, versioning, and release approval |
| Version | 1.0 |
| Status | Approved |

## Versioning

All releases follow [Semantic Versioning 2.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Increment | When | Example |
|---|---|---|
| MAJOR | Breaking API changes, breaking DB schema changes | `1.0.0` -> `2.0.0` |
| MINOR | New features, backward-compatible additions | `1.0.0` -> `1.1.0` |
| PATCH | Bug fixes, performance improvements, backward-compatible | `1.0.0` -> `1.0.1` |

Pre-release versions: `1.0.0-alpha.1`, `1.0.0-beta.1`, `1.0.0-rc.1`

## Release Process

### Step 1: Create Release Branch

```bash
git checkout develop
git pull
git checkout -b release/1.2.0
```

### Step 2: Prepare Release

- Update version in `package.json` files
- Update `CHANGELOG.md`
- Run full test suite
- Fix any release blockers (no new features)

### Step 3: Deploy to Staging

- Push release branch
- CI/CD deploys to staging automatically
- QA performs smoke tests
- Performance benchmarks run

### Step 4: Release Approval

| Approver | Criteria |
|---|---|
| QA Lead | All smoke tests pass, no P1/P2 bugs |
| Tech Lead | Code freezes respected, no regressions |
| Product Owner | Features verified, business value validated |

### Step 5: Merge to Main

```bash
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags
```

### Step 6: Deploy to Production

- CI/CD detects tag push, builds Docker image with semver tag
- Runs database migrations
- Deploys containers (blue-green)
- Runs verification smoke tests

### Step 7: Merge Back to Develop

```bash
git checkout develop
git merge --no-ff release/1.2.0
git push origin develop
```

## Release Notes

Release notes are generated from commit history and documented in `CHANGELOG.md`.

```markdown
## [1.2.0] - 2026-06-30

### Added
- feat(api): user registration endpoint (#42)
- feat(web): booking calendar widget (#44)

### Fixed
- fix(api): correct date validation on checkout (#47)
- fix(web): responsive layout on mobile booking (#48)

### Changed
- refactor(api): extract pricing logic to service (#45)
- chore(deps): upgrade prisma to 5.10.0 (#46)
```

## Release Cadence

| Type | Cadence | Process |
|---|---|---|
| Major | Quarterly | Full release cycle, breaking change review |
| Minor | Bi-weekly | Standard release process |
| Patch | As needed | Expedited, hotfix process possible |
| Hotfix | Immediate | Emergency approval bypass |

## Cross-References

- [17-Engineering/Branching.md](../17-Engineering/Branching.md) — Release branches
- [17-Engineering/PR-Review.md](../17-Engineering/PR-Review.md) — Release PR approval gates
- [18-Deployment/Staging.md](Staging.md) — Staging verification
- [18-Deployment/Production.md](Production.md) — Production deploy
- [CHANGELOG.md](../../CHANGELOG.md) — Release history
