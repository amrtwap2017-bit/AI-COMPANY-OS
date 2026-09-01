
## TRAP-004: Python String Injection Into Class/Function Bodies
**Confirmed incidents:** 3 (V7-009 engine.py, V8-004 router.py, V8-G026 cascade)
**Pattern:** `text.replace(old_anchor, new_code)` blindly injects into wrong scope
**Symptoms:** IndentationError, SyntaxError, AttributeError at runtime
**Rule:** NEVER use str.replace() to inject multi-line Python into existing files
**Safe alternatives:**
  1. Write the complete new file content
  2. Use line-number targeted sed (verify line first)
  3. Use ast module for code analysis before modification
  4. Insert at module level only (top of file, before first function)

## TRAP-005: datetime Module vs Class Shadowing
**Confirmed incident:** V8-G026 cascade (37 files affected)
**Pattern:** `import datetime` (module) + later `from datetime import datetime` (class)
         → datetime.datetime.utcnow() fails: AttributeError
**Rule:** Pick ONE style per file. Prefer: `from datetime import datetime as _dt`
**Detection:** `grep -rn "datetime.datetime.utcnow" src/` → 0 results = clean

## TRAP-006: Redundant Middleware Layers
**Confirmed incident:** Sprint 302 _TB302AuthMiddleware blocked valid tokens
**Pattern:** Multiple auth layers that each run decode_token() independently
         → Same token accepted by FastAPI but rejected by middleware
**Rule:** ONE auth mechanism only. FastAPI Depends(get_current_user) is sufficient.
         Never add middleware-level auth on top of Depends auth.

## TRAP-007: Test Files That Test Their Own Infrastructure
**Confirmed incident:** test_sprint_c002 checked middleware.ts existence
         → File deleted in V8 → test fails on valid production state
**Rule:** Tests must test behavior, not file existence of implementation artifacts.
         If testing infrastructure, use abstract checks (proxy OR middleware exists).

## TRAP-009: Never commit claiming success without verifying server starts
**Confirmed incidents:** 2 (V8-S05, V8-recovery commit)
**Pattern:** git commit message says "Server starts ✅" but curl health check was never run
**Rule:** Before EVERY commit that touches main.py, any router, or any import:
  curl -s http://localhost:8030/api/v1/health/live | python3 -m json.tool
  Must show {"status": "live"} — if not → DO NOT COMMIT → fix first

## TRAP-010: datetime injection creates multi-module imports
**Confirmed incident:** pdf_export, procurement_intake
**Pattern:** 'from datetime import datetime as _dt\n' inserted before existing import
         creates combined line: 'from datetime import datetime as _dt, io'
         Python reads this as importing 'io' from 'datetime' → ImportError
**Rule:** When injecting imports, always scan the FULL resulting import line
         Verify: from datetime import X → X must be a datetime module member
**Detection:** grep -rn "from datetime import.*," src/ | grep -v "timedelta\|timezone"
