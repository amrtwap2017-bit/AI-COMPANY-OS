# TRIANGLE BLACK — ENGINEERING RULES

## The Absolute Rules (never break)

### Python / Backend
1. Use uv not pip: uv pip install --python .venv/bin/python <pkg>
2. Never use Base.metadata.create_all — Alembic handles schema
3. New tables: CREATE TABLE via raw SQL → manual alembic_version update
4. All models import Base from src.core.base ONLY
5. DB sessions: ALWAYS use get_db() from src.core.database
6. Business endpoints go in src/core/actions.py using `router` variable
7. Domain CRUD goes in src/commercial/<name>/router.py
8. New models MUST be imported in src/main.py before registration
9. Actions.py uses `router` not `actions_router` (common mistake!)
10. Always export TRIANGLE_BLACK_DB_URL and PYTHONPATH before running

### ZSH Shell
1. ALWAYS quote bracket paths: 'portal/app/(app)/quotes/[id]/page.tsx'
2. NEVER use inline # comments — zsh treats # as comment
3. NEVER paste Python code directly — use heredoc or temp file
4. For JSX files: write to /tmp/file.js then run node /tmp/file.js
5. Python writer: .venv/bin/python - << 'PYEOF' ... PYEOF
6. Must be in triangle-black/ directory for .venv to exist

### Frontend
1. API base: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"
2. Token: localStorage.getItem("tb_token") for ops/admin
3. Token: localStorage.getItem("client_token") for client portal
4. Array safety: const safe = (d) => Array.isArray(d) ? d : d?.items ?? []
5. Always use Array.isArray() guard before .map() — API may return object
6. PDF downloads: use fetch() not axios for blob handling
7. New nav items: add to Sidebar.tsx navItems array as objects (not JSX)
8. WSL browser: use 172.28.186.138:3200 not localhost:3200
9. Clear .next cache when bundler errors: rm -rf .next

## Naming Conventions
- Models:    PascalCase class names matching tablename
- Tables:    snake_case plural (inventory_items, work_orders)
- Routes:    kebab-case (/work-orders, /purchase-requests)
- Files:     snake_case for Python, kebab-case for TSX pages
- Numbers:   TB-{TYPE}-YYYYMM-XXXX (TB-PR-202607-0001)

## Test Rules
- Use real PostgreSQL (not SQLite mocks)
- Login fresh in each test helper (_admin, _manager, _agent)
- Array returns: always use safe() guard
- Required request bodies: always send json={} for POST actions
- Quote generation: send json={"contract_months": 12}
- All QuoteActionIn endpoints: send json={} body

## Commit Pattern
git add -A
git commit -m "feat: Sprint X — description vY.Z.0"
git tag -a vY.Z.0 -m "vY.Z.0 — description"
git push && git push --tags
