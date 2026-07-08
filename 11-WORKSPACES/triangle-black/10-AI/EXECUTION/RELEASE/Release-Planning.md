# Release Planning

## Purpose

Release planning ensures that every release has a clearly defined scope, timeline, and quality bar. It aligns development effort with business priorities and sets stakeholder expectations.

## Release Cadence

| Type | Cadence | Schedule |
|---|---|---|
| Major | Monthly | First week of every month |
| Minor | Biweekly | Second and fourth week of every month |
| Patch | As needed | Ad hoc, prioritized by severity |
| Hotfix | On demand | Emergency process (see Hotfix Process) |

## Release Scope Definition

### Scope Sources

Release scope is drawn from:

- **Epics and features**: Completed features that meet the Definition of Done.
- **Bug fixes**: Resolved bugs that are verified and ready for release.
- **Dependency updates**: Updated dependencies that require a release.
- **Technical debt**: Refactoring or infrastructure improvements.
- **Security patches**: Critical or high-severity security fixes.

### Scope Selection Criteria

Features and fixes are selected for a release based on:

1. **Priority**: P0 and P1 items take precedence.
2. **Dependencies**: Items that block other planned work.
3. **Risk**: Lower-risk items are preferred for early release cycles.
4. **Business value**: Items with the highest value-to-effort ratio.
5. **Commitment**: Items that were committed to stakeholders.

## Content Freeze

### Content Freeze Timeline

| Phase | Timeline | Restrictions |
|---|---|---|
| Soft Freeze | 3 days before release RC | Non-critical changes deferred |
| Hard Freeze | 1 day before release RC | Only release-blocker fixes allowed |
| Release Day | Day of deployment | No changes; only deployment verification |

- During soft freeze, only P0/P1 bug fixes and release preparation changes are accepted.
- During hard freeze, only release-critical fixes approved by the Release Manager are accepted.
- After hard freeze, all changes must be approved by Change Control.

## Release Candidate Creation

1. A release branch is created from the main branch at the freeze point.
2. The release candidate (RC) is built from the release branch.
3. RC naming: `v<major>.<minor>.<patch>-rc.<number>` (e.g., `v1.2.0-rc.1`).
4. The RC undergoes full verification: all automated and manual quality gates.
5. If issues are found, fixes are applied to the release branch and a new RC is created.
6. Multiple RCs may be produced until the release is stable.

## Release Planning Template

```
# Release Plan: v<version>

## Release Date
<date>

## Release Type
<major | minor | patch | hotfix>

## Scope
### Features
- [ ] Feature 1 (TICKET-123)
- [ ] Feature 2 (TICKET-456)

### Bug Fixes
- [ ] Bug 1 (TICKET-789)
- [ ] Bug 2 (TICKET-101)

### Dependencies
- [ ] Dependency updates (list)

### Known Issues (not addressed)
- Issue 1 (deferred to next release)
- Issue 2 (accepted risk)

## Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| ... | ... | ... | ... |

## Rollback Plan
- Rollback trigger conditions:
- Rollback procedure:
- Estimated rollback time:

## Stakeholders
- Notified: <date>
- Approvals needed: <list>

## Release Checklist
- [ ] Release candidate built
- [ ] Quality gates passed
- [ ] Security review passed
- [ ] Release notes complete
- [ ] Stakeholders notified
- [ ] Rollback plan confirmed
- [ ] Executive approval obtained
```

## Release Approval

Release approval follows a staged process:

1. **Engineering Lead**: Confirms technical readiness.
2. **QA Lead**: Confirms quality metrics are met.
3. **Product Owner**: Confirms business value is delivered.
4. **Security Lead**: Confirms security requirements are met.
5. **Release Manager**: Confirms all artifacts are complete.
6. **Executive Approver**: Authorizes deployment.

## Deferred Items

Items that do not make the current release:

- Are automatically considered for the next release cycle.
- Are communicated to stakeholders with the rationale.
- Are tracked in the backlog with updated priority.

## Release Calendar

A release calendar is maintained at the program level showing:

- Planned release dates for the next quarter.
- Freeze windows for each release.
- Stakeholder review dates.
- Deployment windows.
- Post-release monitoring periods.
