# Hotfix Process

## Purpose

The Hotfix Process defines an accelerated path for addressing critical production issues that cannot wait for the next scheduled release. It balances speed with quality by reducing but not eliminating quality gates.

## When to Use Hotfix

A hotfix is appropriate when:

**Must meet ALL criteria:**

- The issue is in production (not staging or development).
- The issue is critical (P0 or P1 severity).
- The issue requires immediate resolution (cannot wait for next release).

**Must meet AT LEAST ONE:**

- Users are actively blocked or unable to use the system.
- Data loss or corruption is occurring.
- Revenue is being impacted.
- Security vulnerability is being actively exploited.
- Regulatory compliance is at risk.

## Hotfix Workflow

```
Identify → Assess → Approve → Fix → Review → Deploy → Verify
```

### 1. Identify

- Issue is reported through monitoring, user reports, or automated alerts.
- On-call engineer triages and confirms severity.

### 2. Assess

- Impact assessment: Which users are affected? How severely?
- Root cause identification (at minimum, a theory).
- Fix scope: What needs to change?
- Risk assessment: What is the risk of the fix vs. the risk of not fixing?

### 3. Approve

- Hotfix request is submitted to the Release Manager.
- Hotfix must be approved by:
  - Engineering Lead (technical feasibility)
  - Product Owner (business justification)
  - Release Manager (process authorization)
- Approval is expedited (target: < 1 hour).

### 4. Fix

- Developer creates a fix on a hotfix branch (branched from the production tag).
- Fix is minimal — only the changes necessary to resolve the issue.
- No refactoring, no unrelated improvements.
- Fix includes a regression test for the bug.

### 5. Review

Expedited quality gates (reduced but not eliminated):

| Gate | Requirement | Time |
|---|---|---|
| Code Review | Single reviewer, focused on correctness | < 30 min |
| Automated Tests | Unit + integration for affected area | < 15 min |
| Security Scan | Automated scan only | < 10 min |
| Architecture Review | Not required (unless fix is complex) | N/A |
| Documentation | Jira ticket updated with fix details | Minimal |

Full quality gates are not required but the following are never skipped:
- Security scan (automated)
- Automated tests
- At least one human code reviewer

### 6. Deploy

- Hotfix is deployed directly to production (bypassing staging if necessary).
- Deployment window: Immediate (any time of day).
- Database migrations: Only if absolutely necessary and reversible.
- Feature flags: Preferred over code rollback if the issue can be toggled.

### 7. Verify

- Post-deployment health checks are run immediately.
- The specific issue is verified as resolved.
- Key user journeys are tested in production.
- Monitoring is watched for 30-60 minutes after deployment.

## Hotfix Branching

```
main:        ...---A---B---C
                       \
hotfix-1.2.1:           \---D (fix)
```

1. Branch from the production tag (the specific version in production).
2. Apply the fix.
3. Create a hotfix release (patch version bump).
4. Merge the hotfix branch back to main.
5. Ensure the fix is included in the next regular release.

## Hotfix Documentation Requirements

The following documentation is required for every hotfix:

1. **Jira/Issue Ticket**: Updated with the hotfix description, root cause, and resolution.
2. **Release Notes**: Brief entry in the hotfix release notes.
3. **Post-Mortem**: Root cause analysis within 24 hours (may be brief).

## Hotfix Release Versioning

Hotfixes increment the PATCH version:

- Current version: `1.2.0`
- Hotfix version: `1.2.1`

If multiple hotfixes are needed for the same version:

- First hotfix: `1.2.1`
- Second hotfix: `1.2.2`

## Hotfix Post-Mortem

Within 24 hours of hotfix completion, a post-mortem is conducted:

1. What was the root cause?
2. Why wasn't this caught by existing quality gates?
3. What can be done to prevent similar issues in the future?
4. Are follow-up changes needed to the regular process?
5. Action items are created and assigned.

## Hotfix Limitations

- Hotfixes should not introduce new features.
- Hotfixes should not include changes outside the direct fix scope.
- No more than 3 hotfixes per release cycle without a process review.
- Hotfixes are not a replacement for proper release planning.
