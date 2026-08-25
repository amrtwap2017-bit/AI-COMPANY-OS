# DISCOVERY-001 — Pre-existing TypeScript Bugs in portal/

Discovered: 2026-08-25
Session: AI Engineering OS bootstrap
Classification: KNOWN_ISSUE — pre-existing, non-blocking

## Files Affected
- 11-WORKSPACES/triangle-black/portal/components/ui/GlobalSearch.tsx (line 91-92)
- 11-WORKSPACES/triangle-black/portal/components/ui/icons.tsx (line 236)

## Errors
- TS1109: Expression expected
- TS1128: Declaration or statement expected
- TS1434: Unexpected keyword or identifier
- TS1435: Unknown keyword or identifier (Did you mean 'const'?)

## Impact
TypeScript compilation fails for portal/ only.
admin-portal and triangle-black-frontend pass tsc cleanly.

## Disposition
Non-blocking for current work. Treat as WARN (not FAIL) in ai-verify.
Add to next available sprint backlog.
Sprint backlog entry: "Fix pre-existing TS syntax errors in portal components"

## Do Not
Do not modify these files without a dedicated task.
Do not let ai-verify block commits because of these pre-existing errors.
