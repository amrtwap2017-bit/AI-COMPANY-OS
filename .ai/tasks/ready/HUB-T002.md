# HUB-T002 — ai-status: add live test count by running pytest in background

## Metadata
| Field | Value |
|-------|-------|
| ID | HUB-T002 |
| Sprint | SPRINT-HUB-001 |
| Status | READY |
| Risk | LOW |
| Created | 2026-08-26 |
| Updated | 2026-08-26 |

## Purpose
[One sentence: what does this task accomplish?]

## Files Likely Affected
- [list specific files, e.g. 11-WORKSPACES/triangle-black/api/...]
- [tests/...]

## Files Forbidden
- DO NOT TOUCH: [list protected files or directories]
- DO NOT TOUCH: authentication middleware
- DO NOT TOUCH: tenant isolation logic

## Dependencies
- [TASK-ID] must complete first, or NONE

## Implementation Steps
1. [READ] Inspect relevant files (no modifications)
2. [PLAN] Confirm understanding with human
3. [IMPLEMENT] Make only the listed change
4. [TEST] Run: bash scripts/ai/ai-verify
5. [REVIEW] Check diff: git diff
6. [COMMIT] Only after all gates pass

## Acceptance Criteria
- [ ] AC-001: [specific, testable criterion]
- [ ] AC-002: [specific, testable criterion]

## Tests Required
- [ ] Unit: [specific test file or function]
- [ ] Integration: [specific test]
- [ ] Regression: existing tests still pass

## Security Considerations
[N/A or specific security check this task requires]

## Expected Output
[Exactly what should be different when this task is done — be specific]

## Repair Limit
MAX_ATTEMPTS: 3
If 3 consecutive attempts fail → STOP → create failure report → wait for human

## Notes
[Any additional context, links to documentation, or warnings]
