# 07 — Release Management

> Release management process for software deployments.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | CI-CD.md | CI/CD pipeline |
| PHASE-06 | Release-Architecture.md | Release strategy |

## Release Types

| Type | Frequency | Version Bump | Approval | Notes |
|------|-----------|-------------|----------|-------|
| Major | Quarterly | x+1.0.0 | CTO + COO | Breaking changes |
| Minor | Bi-weekly | x.y+1.0 | DevOps Lead | Features, enhancements |
| Patch | As needed | x.y.z+1 | DevOps | Bug fixes |
| Hotfix | Emergency | x.y.z+1 | CTO | Production bugs |

## Release Process

```
Code Freeze ─► Build ─► Test ─► Stage ─► Approve ─► Prod ─► Verify
   │          │        │        │         │          │        │
   Cut        GH      CI/CD    Staging   Signoff    Deploy  Smoke
   branch     Actions  pass     deploy    required            test
```

## Release Artifacts

- Release notes (CHANGELOG.md)
- Docker images (ghcr.io/ determined-black/*)
- Migration scripts (Prisma migrations)
- Environment variable changes
- Configuration changes

## Rollback Plan

- `git revert <tag>` + PR + deploy
- Database migration reversal (if non-trivial, manual SQL)
- Immediate rollback window: 30 min post-deploy

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT DOCUMENTED
