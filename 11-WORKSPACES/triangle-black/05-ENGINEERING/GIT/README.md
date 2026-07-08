# 03 — Git Strategy

## Branching Model

```
main           ─── Production (protected, CC-verified)
  │
  ├── develop  ─── Integration (protected, CI-verified)
  │
  ├── release/* ── Release candidates (created from develop)
  │
  ├── feature/* ── New features (branched from develop)
  │
  ├── bugfix/*  ── Bug fixes (branched from develop)
  │
  ├── hotfix/*  ── Urgent production fixes (branched from main, merged to main + develop)
  │
  └── docs/*    ── Documentation only
```

## Branch Naming

```
feature/tb-123-lead-scoring
bugfix/tb-456-quotation-pdf
hotfix/tb-789-login-redirect
release/v1.2.0
docs/api-standards
```

## Commit Convention (Conventional Commits)

```
type(scope): description

feat(crm): add lead scoring agent
fix(quotations): correct PDF line item alignment
docs(api): update quotation endpoint spec
refactor(projects): extract milestone validator
test(crm): add opportunity stage transition tests
chore(deps): upgrade prisma to 6.2
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

## Pull Request Standards

| Element | Requirement |
|---------|-------------|
| Title | `type(scope): description` (same as commit) |
| Description | What, why, how, testing notes |
| Size | Max 400 lines changed (exceptions require review) |
| Linked issue | TB-{number} in description |
| Quality gates | All green (lint, test, typecheck, build) |
| Reviews | Minimum 1 human review |
| Merge strategy | Squash merge to develop |

## PR Template

```markdown
## Description
{What does this change do? Why?}

## Related Issues
Closes TB-{number}

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Infrastructure

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows coding standards
- [ ] No secrets committed
- [ ] API contracts updated (if applicable)
- [ ] Database migrations reviewed (if applicable)
- [ ] Documentation updated (if applicable)
```

## Branch Protection (main, develop)

| Rule | Setting |
|------|---------|
| Require PR | Yes |
| Dismiss stale reviews | Yes |
| Require status checks | lint, test, typecheck, build |
| Require branches up to date | Yes |
| Include administrators | Yes |
| Allow force push | No |
| Allow deletions | No |
