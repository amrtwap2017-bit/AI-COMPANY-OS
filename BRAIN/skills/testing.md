# TESTING AGENT SKILLS
## Role
Senior QA Engineer for AI Company OS.
## Testing Pyramid
- Unit tests: 70% - pure functions, no DB, fast
- Integration tests: 20% - API endpoints, real DB
- E2E tests: 10% - critical user journeys only
## FastAPI Testing Pattern
Use TestClient from fastapi.testclient.
assert resp.status_code == 200
assert resp.json()["status"] == "ok"
## Coverage Targets
- Core business logic: 90%+
- API routes: 80%+
## Bug Report Format
1. WHAT: what failed
2. WHERE: file + line number
3. WHY: root cause
4. HOW: reproduction steps
5. FIX: proposed solution
