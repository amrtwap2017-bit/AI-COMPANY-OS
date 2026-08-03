# AGENT HANDOFF — Triangle Black
Date: August 2026

## WHAT IS WORKING
- Server: localhost:8030 (bash START.sh)
- Login: amr@triangleblack.com / admin123
- Tests: 126 passing, 0 failing
- Leads API: /api/v1/leads/?limit=100 returns array
- Quotes API: /api/v1/quotes/?limit=100 returns array
- Contracts API: /api/v1/contracts/?limit=100 returns array
- Git: 45+ commits on main, pushed to origin

## WHAT WE BUILT THIS SESSION
1. AI Software Factory (72 governance files in AI_MEMORY/ agents/ PROMPTS/ etc)
2. Security fix: ai_scheduling router now uses Depends(get_hotel_id)
3. Test suite: 40 → 126 passing
4. Portal pages: leads/page.tsx, leads/[id]/page.tsx, quotes/page.tsx

## KNOWN BUGS TO FIX
1. /leads/[id] returns 405 Method Not Allowed
   - leadsApi.get() calls /api/v1/actions/leads/{id} but that route does not exist
   - Real route is /api/v1/leads/{id} (direct route)
   - Fix: change leadsApi.get() or use tbFetch directly

2. work-orders/page.tsx uses useMutation which is not imported
   - Not our code, pre-existing bug

3. EnterpriseSidebar has duplicate key /settings/users
   - Pre-existing bug in nav config

4. Leads page field names: API returns name/company not contact_name/company_name
   - Already fixed in last commit, verify it works

## ARCHITECTURE FACTS
- Entry: src/main.py via uvicorn src.main:app
- hotel_id = tenant identifier (923 uses across codebase)
- get_hotel_id in src/core/tenant.py extracts hotel_id from JWT
- DEFAULT_HOTEL = tb-default-hotel-000000000001 (fallback only)
- Rate limit: RATE_LIMIT_MAX=10000 in src/main.py
- Token key: tb_access_token in localStorage/sessionStorage

## API ENDPOINTS VERIFIED WORKING
GET  /api/v1/leads/?limit=100           → array of leads
GET  /api/v1/leads/{id}                 → single lead object
POST /api/v1/actions/leads/{id}/qualify → returns {ok, score, grade}
GET  /api/v1/quotes/?limit=100          → array of quotes
GET  /api/v1/contracts/?limit=100       → array of contracts
GET  /api/v1/notifications/?limit=100  → array of notifications
GET  /api/v1/work-orders/?limit=100     → array of work orders

## HOW TO START SERVER
bash /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/START.sh

## HOW TO RUN TESTS
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
.venv/bin/python -m pytest tests/ -q --tb=no 2>&1 | tail -3
