# Git Workflow

## Overview

This document defines the standard Git workflow for all development teams. Consistent Git practices ensure a clean, auditable history, predictable collaboration, and reliable automated pipelines.

## Standard Workflow

### Step 1: Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/PROJ-123-add-user-auth
```

Always branch from the latest `main` to minimize merge conflicts.

### Step 2: Make Changes

- Commit early and often in small, logical units.
- Each commit should represent a single, coherent change.
- Never commit directly to `main` or protected branches.

### Step 3: Commit Regularly

Use **Conventional Commits** format (see below). Push at least once per day to ensure your work is backed up and visible to the team.

```bash
git add <files>
git commit -m "feat(auth): add user authentication endpoint"
git push origin feature/PROJ-123-add-user-auth
```

### Step 4: Keep Branch Updated

Rebase your feature branch on `main` regularly to stay current and reduce merge conflicts:

```bash
git checkout feature/PROJ-123-add-user-auth
git fetch origin main
git rebase origin/main
```

**Never merge `main` into your feature branch** — always rebase.

### Step 5: Open Pull Request

- Write a clear, descriptive title and description.
- Reference the ticket or issue number.
- Add the type of change (feature, bugfix, refactor, etc.).
- Select reviewers appropriate to the changed areas.
- Ensure all CI checks pass before requesting review.

### Step 6: Code Review

- Respond to reviewer comments promptly.
- Address all feedback before merging.
- Avoid force-pushing after a review has started — push additional commits instead.

### Step 7: Squash Merge to Main

```bash
# Done through the PR interface — never manually.
```

Use squash merge to produce a single, clean commit on `main`. The commit message should follow the Conventional Commits format.

### Step 8: Delete Feature Branch

Delete the feature branch after merge. Most hosting platforms offer an automatic delete option after PR merge.

## Commit Message Format: Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code restructuring (no feature or fix) |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration changes |
| `chore` | Maintenance, tooling, configuration |

### Scope

The scope is a noun describing the area of the codebase affected. Examples: `auth`, `api`, `database`, `ui`, `pipeline`.

### Examples

```
feat(auth): add OAuth2 login flow
fix(api): handle null response from payment gateway
docs(readme): update installation instructions
refactor(database): extract query builder into separate module
ci(pipeline): add dependency vulnerability scan stage
test(api): add integration tests for user endpoints
```

### Breaking Changes

Add a `!` after the type/scope and include a `BREAKING CHANGE` footer:

```
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: The v1 API endpoints have been removed. Migrate to v2.
```

## Pull Request Size Limits

- **Maximum 400 lines changed** (excluding whitespace, comments, and generated files).
- Larger changes must be decomposed into multiple PRs merged behind feature flags.
- Exceptions require written approval from the engineering lead.

### Why 400 Lines?

- Smaller PRs are reviewed faster and more thoroughly.
- Review quality degrades significantly above 400 lines (research shows defect detection drops by 60%+).
- Smaller PRs reduce merge conflicts and deployment risk.

## Preventing Common Issues

| Issue | Prevention |
|-------|-----------|
| Large PRs | Enforce 400-line limit with CI check |
| Merge commits in history | Use squash merges only |
| Stale branches | Auto-delete after merge; flag branches inactive >14 days |
| Diverged branches | Rebase onto main before opening PR |
| Broken main | Require all CI checks to pass before merge |
| Committed secrets | Pre-commit hook with secret scanning; post-commit revoke on detection |

## Pre-Commit Hooks

All repositories should configure pre-commit hooks to:

1. Check for accidentally committed secrets
2. Run linters on changed files
3. Validate commit message format
4. Check for large binary files

## CI/CD Integration

- CI runs on every push to any branch.
- Full pipeline (build, lint, test, security scan) runs on PRs targeting `main`.
- Status checks must pass before merge.
- Deployment to staging happens automatically after merge to `main`.
- Deployment to production requires manual approval.
