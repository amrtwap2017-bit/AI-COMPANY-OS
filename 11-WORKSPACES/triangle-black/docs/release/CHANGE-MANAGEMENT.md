# Change Management Policy — Triangle Black

## Change Categories

| Category | Definition | Approval Required |
|---|---|---|
| Standard | Bug fix, test addition, doc update | Self-approved by engineer |
| Significant | New endpoint, schema change, new module | Architect review |
| Critical | Database migration, auth change, tenant logic | Architect + PM sign-off |

## Pre-Change Checklist

- [ ] Changes documented in sprint task
- [ ] No direct production database SQL
- [ ] Tests cover the change
- [ ] Build Guard passes
- [ ] Alembic migration safe (if applicable)
- [ ] No hardcoded secrets

## Post-Change Verification

- [ ] Backend health check returns 200
- [ ] Affected tests pass
- [ ] No new console errors in portal
- [ ] Commit message follows convention: `feat|fix|docs|refactor(scope): description`
