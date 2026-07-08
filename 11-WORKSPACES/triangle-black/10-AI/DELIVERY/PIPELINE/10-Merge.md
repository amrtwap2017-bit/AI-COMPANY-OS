# Stage 10: Merge

## Purpose

Validate all quality gates, resolve merge conflicts, and merge the feature branch into the main branch with a clean, traceable commit history.

## Agent Role

**Merge Controller AI** — Responsible for gate validation, conflict resolution, and merge execution.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Review Report | Review report with status `APPROVED` |
| Feature Branch | Feature branch exists with all implementation, tests, and docs |
| Main Branch | Main branch is up to date with latest changes |
| CI Pipeline | CI pipeline available for pre-merge validation |

## Process

### Step 1: Validate All Gates
Check every pipeline stage artifact is APPROVED:
- [x] Requirement (01)
- [x] Planning (02)
- [x] Architecture (03)
- [x] Database (04)
- [x] Backend (05)
- [x] Frontend (06)
- [x] Testing (07)
- [x] Documentation (08)
- [x] Review (09)

If any gate is not APPROVED, reject the merge and return to the offending stage.

### Step 2: Run Pre-Merge CI
- Trigger CI pipeline on the feature branch.
- Verify:
  - TypeScript compilation: passes
  - Linting: passes
  - Unit tests: all pass
  - Integration tests: all pass
  - Build: succeeds
  - Security scan: no critical findings

### Step 3: Resolve Merge Conflicts
- Pull latest main and rebase feature branch.
- If conflicts exist:
  - Analyze each conflict for semantic correctness.
  - Resolve in favor of the feature code when the feature intentionally changes behavior.
  - Resolve in favor of main when both branches made the same change.
  - Ensure no code is lost during conflict resolution.
  - Re-run tests after conflict resolution.

### Step 4: Create Merge Commit
- Use squash merge or rebase merge based on project policy.
- Write a descriptive merge commit message:
  ```
  feat(<scope>): <feature title> (#<PR number>)
  
  Pipeline stages: 01-09 all APPROVED
  Review: <link to review report>
  ```
- Ensure the merge commit references all relevant artifact IDs.

### Step 5: Verify Post-Merge
- Check that main branch build passes after merge.
- Verify all tests pass on main.
- Tag the merge commit if the feature is part of a release candidate.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Merged to Main | Feature branch code is on main branch |
| All Gates APPROVED | All pipeline stage artifacts verified |
| CI Passes | Pre-merge and post-merge CI passes |
| Clean Merge Commit | Descriptive merge commit with artifact references |
| Branch Cleaned Up | Feature branch is deleted (optional, policy-dependent) |

## Artifact Template

```markdown
# Merge: <Feature Title>

**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Gate Validation
| Stage | Artifact | Status |
|-------|----------|--------|
| 01 - Requirement | REQ-042 | ✅ APPROVED |
| 02 - Planning | SP-042 | ✅ APPROVED |
| 03 - Architecture | ARCH-042 | ✅ APPROVED |
| 04 - Database | DB-042 | ✅ APPROVED |
| 05 - Backend | BE-042 | ✅ APPROVED |
| 06 - Frontend | FE-042 | ✅ APPROVED |
| 07 - Testing | TEST-042 | ✅ APPROVED |
| 08 - Documentation | DOC-042 | ✅ APPROVED |
| 09 - Review | REVIEW-042 | ✅ APPROVED |

## Pre-Merge CI
- [x] TypeScript: no errors
- [x] Lint: clean
- [x] Unit tests: 101/101 passed
- [x] Integration tests: 18/18 passed
- [x] Build: successful
- [x] Security scan: clean

## Merge Details
- **Source Branch**: `feature/order-processing`
- **Target Branch**: `main`
- **Merge Strategy**: Squash merge
- **Commit Hash**: `a1b2c3d4e5f6...`

## Post-Merge CI
- [x] Main build: successful
- [x] Tests: all passed
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Gate not approved | Reject merge, notify the failing stage's AI agent |
| CI pipeline fails | Review failures, fix issues, re-run CI |
| Merge conflicts unresolvable by AI | Flag for human review with conflict details |
| Post-merge main build fails | Revert merge commit and investigate root cause |

## Cross-References

- All previous stage documents (01-09)
- [Pipeline README](./README.md)
