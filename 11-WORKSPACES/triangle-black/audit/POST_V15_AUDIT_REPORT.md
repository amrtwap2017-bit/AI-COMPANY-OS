# Triangle Black — Post-V15.0 Audit Report
## Generated: 2026-09-19 06:15
## HEAD: 14a55a48
## Tests: 3,854 / 0 failing

## AUDIT FINDINGS

### 🔴 CRITICAL (Must fix before first real customer)

| # | Finding | Evidence | Fix |
|---|---|---|---|
| C1 | CustomerDataScope has 0 production consumers | grep result | Enforce in dashboard/WO/rec endpoints |
| C2 | Debug/demo routes active in production | /debug/executive /demo/seed active | Remove or gate behind admin flag |
| C3 | Dev credentials in git history | ai123 admin123 in tracked files | Rotate + add .gitignore / pre-commit |
| C4 | Client-controlled registration role | payload.get("role") | Whitelist or remove from registration |

### 🟡 HIGH (Fix before scaling beyond first customer)

| # | Finding | Evidence | Fix |
|---|---|---|---|
| H1 | Pilot baseline recalculates live | capture_baseline() on every request | Persist immutable PilotBaseline snapshots |
| H2 | Startup validation non-fatal | logs WARN but app continues | Make fail-fast for critical routes |
| H3 | Token revocation stateless | logout doesn't invalidate JWT | Add token blacklist (Redis) |
| H4 | Header tenant fallback | X-Hotel-ID accepted | JWT-only for customer paths |

### 🟠 MEDIUM (V15.1 after pilot feedback)

| # | Finding | Evidence | Fix |
|---|---|---|---|
| M1 | 736 source routes not mounted | 961 decorators vs 225 active | Audit + mount or deprecate |
| M2 | main.py 9,000 lines | God file | Progressive extraction |
| M3 | Evidence DDL outside Alembic | _ensure_table() at service init | Migrate to proper Alembic |
| M4 | OpenAPI AddNoteIn error | app.openapi() fails | Resolve Pydantic forward ref |

### ✅ ALREADY GOOD (No action needed)

- 3,854 tests / 0 failing
- Build Guard PASS
- All 10 gaps from V15.0 closed
- Recommendation governance (reject/defer)
- SLA event history
- Import batch tracking + dedup
- Adoption health score
- Notification delivery lifecycle
- PDF 3 sections added
- Request correlation X-Request-ID
- Backup scripts + DR documentation

## RECOMMENDED NEXT ACTIONS

### Before First Hotel (P0)
1. Gate debug/demo routes behind ENVIRONMENT check
2. Enforce CustomerDataScope in top 5 customer endpoints
3. Fix registration role to whitelist only
4. Rotate dev credentials + pre-commit hook

### During Pilot (P1)
5. Immutable PilotBaseline snapshots
6. Fail-fast startup validation
7. Token revocation (Redis blacklist)
8. OpenAPI fix (AddNoteIn)

### Post-Pilot V15.1 (P2)
9. Route audit (736 unmounted)
10. main.py extraction
11. Evidence Alembic migration
