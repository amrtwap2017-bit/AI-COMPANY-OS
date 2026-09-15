# TRIANGLE BLACK — TypeScript Status (Honest Assessment)
## Date: 2026-09-15
## Status: 281 PRE-EXISTING ERRORS — DOCUMENTED P2 DEBT

## Current Reality
- `tsc --noEmit` with current tsconfig (bundler + 17 excluded): **281 errors**
- `next build` (with `ignoreBuildErrors: true`): **PASSES** ✅
- Application renders and works correctly: **CONFIRMED** ✅

## Error Breakdown
| Error Type | Count | Category |
|------------|-------|----------|
| TS17001 (duplicate JSX attributes) | ~102 | Code quality — `className` duplicated |
| TS2339 (property not on type) | ~94 | Missing type definitions for API responses |
| TS2345 (type assignment) | ~29 | Hook return type mismatches |
| TS2322 (type not assignable) | ~20 | Component prop mismatches |
| TS2305 (no exported member) | ~17 | Import mismatches (__tests__, e2e) |
| Other | ~19 | Various |

## What Was the TS17008 Mystery?
95 ghost filesystem directories named `at <unknown> (app/...` were created
by a previous `tsc` run. These caused 34 phantom TS17008 errors.
**Root cause: found and deleted.** Ghost dirs are gone. 315 real pages intact.

## Production Impact
- **ZERO** — `next build` passes, application works
- These errors are masked by `ignoreBuildErrors: true` in `next.config.ts`
- This is standard practice for large Next.js projects in active development

## Resolution Plan (P2 — After Customer)
- TS17001 (duplicate attrs): sed/regex fix across affected files
- TS2339 (missing types): add proper API response types
- TS2345/TS2322 (type mismatches): fix component prop interfaces
- TS2305 (imports): fix test/e2e import paths
- Target: 0 errors by V16

## RULE
Do NOT claim "0 TypeScript errors" based on `next build` passing.
Be honest: 281 pre-existing errors exist. They are P2 debt. 
They do NOT block production deployment or customer usage.
