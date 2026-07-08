# Branch Strategy

## Model: Trunk-Based Development

This project uses **trunk-based development** with short-lived feature branches. This model keeps the main branch in a continuously deployable state, reduces merge complexity, and enforces small, reviewable changes.

## Branch Types

### Main Branch (`main`)

- **Purpose**: Production-ready code. Every commit on `main` has passed CI and code review.
- **Protection**: Protected branch — no direct pushes. All changes require a pull request with passing status checks and signed commits.
- **Deployment**: Automated deployment to production is triggered from `main`.
- **Merge policy**: Only squash merges are permitted to keep a clean, linear history.

### Feature Branches (`feature/<ticket-id>-<short-description>`)

- **Purpose**: Isolated development for a single unit of work.
- **Source**: Always branched from `main`.
- **Lifespan**: Maximum 3 days. If a feature takes longer, decompose it into smaller units or merge behind a feature flag.
- **Naming convention**: `feature/PROJ-123-add-user-auth`
- **Cleanup**: Automatically deleted after merge to `main`.

### Release Branches (`release/<major>.<minor>`)

- **Purpose**: Stabilization and patch management for LTS (Long-Term Support) releases.
- **Source**: Branched from `main` at the release candidate commit.
- **Lifespan**: Active until the release reaches end-of-life. Bug fixes are cherry-picked from `main`.
- **Naming convention**: `release/1.0`, `release/1.1`
- **Merge policy**: Only bug fixes are merged. New features are not backported.

### Hotfix Branches (`hotfix/<ticket-id>-<short-description>`)

- **Purpose**: Emergency fixes for production issues that cannot wait for the regular release cycle.
- **Source**: Branched from `main` (or the affected release branch).
- **Lifespan**: Maximum 24 hours.
- **Naming convention**: `hotfix/PROJ-456-fix-payment-timeout`
- **Merge policy**: Merged to `main` and cherry-picked to active release branches.
- **Process**: A hotfix bypasses the regular CI pipeline only when explicitly approved by the engineering lead. All hotfixes require a post-incident review and a follow-up test to prevent recurrence.

### Experiment Branches (`experiment/<topic>`)

- **Purpose**: Short-term exploration, spike solutions, or research.
- **Source**: Branched from `main`.
- **Lifespan**: Maximum 5 days. If results are viable, create a proper feature branch.
- **Cleanup**: Deleted manually when the experiment concludes. Never merged directly.

## Branch Lifecycle

1. A developer creates a feature branch from the latest `main`.
2. Work is committed in small, logical increments using Conventional Commits.
3. The branch is pushed daily (or more frequently) to enable visibility and backup.
4. When work is complete, a pull request is opened against `main`.
5. CI runs automated checks (build, lint, test, security scan).
6. At least one reviewer approves the changes.
7. The branch is squash-merged to `main`.
8. The feature branch is deleted automatically or manually.
9. CI/CD deploys the new `main` through the pipeline.

## Cleanup Policy

- **Feature branches**: Deleted automatically upon merge. Stale branches (no activity in 14 days) are flagged and archived.
- **Release branches**: Retained for the duration of LTS support. Archived when support ends.
- **Hotfix branches**: Deleted after merge and incident closure.
- **Stale branch detection**: A weekly automated scan identifies branches with no commits in 14 days. Owners are notified. After 30 days of inactivity, branches are archived. After 60 days, they are deleted.

## Branch Naming Convention

```
<type>/<ticket-id>-<kebab-case-description>
```

Where `<type>` is one of: `feature`, `release`, `hotfix`, `experiment`.

Examples:
- `feature/PROJ-123-add-user-auth`
- `release/2.4`
- `hotfix/PROJ-456-fix-payment-timeout`
- `experiment/graphql-vs-rest`

## Key Rules

- No direct commits to `main` or protected branches.
- All branches must originate from `main` (or an active release branch for hotfixes).
- Feature branches must not live longer than 3 days.
- Squash merge to `main` only — no merge commits.
- Rebase feature branches onto `main` before opening a PR to resolve conflicts.
