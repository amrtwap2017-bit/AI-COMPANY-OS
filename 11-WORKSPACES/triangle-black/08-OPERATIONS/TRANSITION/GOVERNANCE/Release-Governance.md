# 01 — Release Governance

> Governance for production releases during the transition.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | CI-CD.md | Deployment pipeline |
| Phase 5 | DevOps-Foundation.md | Release workflow |
| Phase 8 | 07-OPERATIONS/Release.md | Release management |

## Release Authority

| Environment | Deploy Authority | Approval | Window |
|-------------|-----------------|----------|--------|
| Development | Any developer | None | Any time |
| Staging | DevOps Lead | Peer review | Any time |
| Production | CTO + DevOps Lead | Both sign | Mon-Thu 9-15 CAT |

## Release Frequency (Production)

| Phase | Frequency | Notes |
|-------|-----------|-------|
| Pre-launch | As needed | Preparing for go-live |
| Hypercare (first 2 weeks) | Daily hotfixes | Low risk, high urgency |
| Stabilize (weeks 3-4) | 2-3 per week | Moderate risk |
| BAU (post-hypercare) | 1-2 per week | Standard risk |

## Release Checklist

- [ ] Code reviewed (PR approved)
- [ ] CI/CD pipeline green (build, lint, test)
- [ ] Staging deployment successful
- [ ] Smoke tests pass on staging
- [ ] Migration script tested (if applicable)
- [ ] Rollback plan confirmed
- [ ] Release notes written
- [ ] Deployment window confirmed
- [ ] Monitoring verified as active
- [ ] Team notified (Slack #releases)
- [ ] Deploy to production
- [ ] Smoke tests pass on production
- [ ] Monitoring green (15 min post-deploy)
- [ ] Release declared successful
- [ ] CHANGELOG updated

## Emergency Release

For SEV-1 incidents, bypass standard process:
1. CTO authorizes emergency release
2. Hotfix branch created from main
3. Minimal fix committed
4. Skip staging (deploy directly to prod with monitoring)
5. Postmortem required within 24 hours

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT APPROVED
