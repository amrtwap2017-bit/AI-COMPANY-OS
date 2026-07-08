# Pull Request Review

| Field | Value |
|---|---|
| Document ID | 17-Engineering-04 |
| Document Purpose | Define the pull request process, template, and review requirements |
| Version | 1.0 |
| Status | Approved |

## PR Template

```markdown
## Description

[What does this PR do? Link to issue if applicable.]

## Type of Change

- [ ] feat: new feature
- [ ] fix: bug fix
- [ ] chore: maintenance
- [ ] refactor: code restructuring
- [ ] test: test changes
- [ ] docs: documentation
- [ ] perf: performance improvement

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manually tested in dev environment
- [ ] No regression introduced

## Checklist

- [ ] Code follows coding standards
- [ ] Tests added/updated for changes
- [ ] Documentation updated (if needed)
- [ ] No new warnings or lint errors
- [ ] Commit messages follow conventional commits

## Screenshots (if UI change)
```

## Process

1. Create feature/fix branch per [Branching.md](Branching.md)
2. Push branch and open PR against `develop` (or `main` for hotfixes)
3. Fill out template completely
4. Request review from at least one peer
5. CI must pass before review
6. Address all review comments
7. Squash merge after approval

## Review Requirements

### Minimum Reviewers

| PR Type | Minimum Approvals |
|---|---|
| Feature (`feat`) | 1 |
| Fix (`fix`) | 1 |
| Hotfix (`hotfix`) | 1 (lead may bypass) |
| Refactor/chore | 0 (lead review optional) |
| Release (`release`) | 2 (including lead) |

### Review Focus Areas

- **Correctness**: Does the code do what it claims?
- **Security**: Are inputs validated? Auth checked? Secrets exposed?
- **Performance**: Any N+1 queries? Unnecessary allocations?
- **Test coverage**: Are edge cases covered?
- **Consistency**: Follows coding standards? Matches existing patterns?
- **Readability**: Is intent clear? Appropriate naming?

### Review Rules

- Review within 1 business day
- Comments are suggestions unless marked **BLOCKING**
- All blocking comments must be resolved before merge
- No self-approval
- No bypassing protection (even for leads — use separate PR)

## Approval Gates

```
[PR Created]
  |
  v
[CI Checks] — lint, test, build must pass
  |
  v
[Code Review] — minimum approvals met
  |
  v
[Branch Up-to-Date] — rebased on target
  |
  v
[Squash Merge]
  |
  v
[Delete Source Branch]
```

## Merge Rules

- **Squash merge** for feature/fix branches into `develop`
- **Merge commit** for `release` into `main` (preserves history)
- **No rebase merge** — use squash or merge commit
- PR must be up to date with target branch before merge
- Delete source branch after merge

## Cross-References

- [Branching.md](Branching.md) — Branch naming and workflow
- [Coding-Standards.md](Coding-Standards.md) — Code quality expectations
- [Testing.md](Testing.md) — Test requirements
- [CI-CD.md](CI-CD.md) — CI checks before review
