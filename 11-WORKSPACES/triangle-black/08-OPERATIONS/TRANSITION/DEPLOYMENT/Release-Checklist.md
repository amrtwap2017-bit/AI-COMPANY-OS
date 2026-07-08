# 02 — Release Checklist

> Pre-flight checklist for every production release.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | CI-CD.md | CI/CD process |
| Phase 9 | 01-Release-Governance.md | Release governance |

## Pre-Release Checklist

### Code Readiness
- [ ] PR approved by at least 1 reviewer
- [ ] All CI checks pass (build, lint, test)
- [ ] No merge conflicts
- [ ] Branch is up to date with main

### Testing
- [ ] Unit tests pass (coverage ≥ 80%)
- [ ] Integration tests pass
- [ ] API tests pass
- [ ] E2E tests pass (critical paths)

### Staging
- [ ] Deployed to staging
- [ ] Smoke tests pass on staging
- [ ] Migration tested (if applicable)
- [ ] Feature flag verified (staging = expected)

### Documentation
- [ ] Release notes written
- [ ] CHANGELOG updated
- [ ] API docs updated (if API changed)
- [ ] User guides updated (if UI changed)

### Operations
- [ ] Deployment window confirmed (Mon-Thu, 9-15 CAT)
- [ ] Rollback plan confirmed
- [ ] Monitoring active
- [ ] Team notified (Slack #releases)
- [ ] Support team aware

## Post-Release Checklist

- [ ] Deployment successful
- [ ] Smoke tests pass on production
- [ ] Monitoring green (15 min)
- [ ] No errors in logs
- [ ] Customer-facing features work
- [ ] Release declared successful
- [ ] Rollback plan de-activated
- [ ] Team notified of completion

## Release Log

```
─────────────────────────────────────────────
RELEASE LOG
─────────────────────────────────────────────

Date: _____________
Version: _____________ (from CHANGELOG)

Deployed by: _____________
Approved by: _____________

Changes:
- [Change 1]
- [Change 2]

Pre-release checks: [ ] All passed
Post-release checks: [ ] All passed
Rollback required: [ ] Yes [ ] No

Notes:
_______________________________________________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT RELEASED
