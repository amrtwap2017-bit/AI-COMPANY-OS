# TRIANGLE BLACK — CURRENT BACKLOG
# Ordered by business impact

## SPRINT CANDIDATES

### Sprint A — Stock Balance Engine (HIGH VALUE)
Problem: stock_movements table records movements but stock_balances
         is never updated automatically
Fix:     After every GRN receive / issue / adjustment:
         UPDATE stock_balances SET qty_on_hand, avg_cost, total_value
Impact:  Inventory dashboard will show real stock levels

### Sprint B — Multi-Tenancy (CRITICAL for production)
Problem: All data uses DEFAULT_HOTEL = "tb-default-hotel-000000000001"
         Real hotel isolation not enforced
Fix:     get_hotel_id() must return the authenticated user's hotel_id
         from the JWT, not a hardcoded default
Impact:  Required before any real client deployment

### Sprint C — Client Service Requests Portal
Missing: client-portal/app/(client)/service/ pages
         Clients can't submit maintenance requests
Files:   client-portal/app/(client)/service/requests/page.tsx
         client-portal/app/(client)/service/requests/new/page.tsx

### Sprint D — Service Dashboard (Ops Portal)
Missing: portal/app/(app)/service-dashboard/page.tsx
         Work order calendar view
         Overdue alerts

### Sprint E — TB Agent Verification
Problem: ./tb-agent status works but index/analyze not tested
Fix:     .venv/bin/python agent/cli.py index
         Check ChromaDB at agent/.chromadb/

### Sprint F — SMTP Configuration
Problem: SMTP_ENABLED=false in .env
Fix:     Set real SMTP credentials, test quote email sending

### Sprint G — Rate Limiting
Problem: No rate limiting on API endpoints
Fix:     slowapi or FastAPI middleware

### Sprint H — Production Deployment
Files exist: docker-compose.production.yml, nginx.conf, Dockerfile.api
Missing:     Real domain setup, SSL certs, .env.production values
             Portal next.config.js with output: "standalone"

### Sprint I — Webhook Firing Logic  
Problem: webhookconfigs table exists, zero firing logic
Fix:     After key events, POST to configured webhook URLs

## KNOWN BUGS
1. "Agent" key duplicate in Sidebar.tsx (cosmetic warning, not breaking)
2. stock_balances never auto-updated (movements recorded only)
3. Token expiry: tokens last ~8 hours, tests need fresh tokens
4. WSL localhost: must use 172.28.186.138:3200 not localhost in browser
