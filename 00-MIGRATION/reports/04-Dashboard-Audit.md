# 04 — Dashboard Audit

## Dashboard Inventory

### Legacy Dashboard — /home/amr/AI/projects/ai-company-os/apps/dashboard/
Status: FULL AI OS DASHBOARD — NOT IN ENTERPRISE
Pages:
- / (Overview) — StatCards for agent calls, conversations, projects, avg response, workflows, events, agents, status + agent roster
- /agents — Agent management
- /analytics — Analytics
- /chat — Chat interface
- /knowledge — Knowledge management
- /memory — Memory viewer
- /models — Model management
- /projects — Project management
- /reflections — Reflection viewer
- /register — Registration
- /settings — Settings
- /tools — Tool management
- /workflows — Workflow management
- /profile — User profile
- /login — Authentication

Backend: api.get("/analytics/overview") + api.get("/agents") — live data from AI engine
Auth: JWT-based useAuth hook
Components: Sidebar, StatCard

### Hub Dashboard — /home/amr/AI-COMPANY-OS/hub/dashboard/
Status: MINIMAL — 4 pages only
Pages:
- / — Home (exists in .next build artifacts only — no source app/ folder found)
- /collections — Collections
- /memory — Memory
- /projects/[id] — Project detail
- /search — Search
Backend: hub API
Status: INCOMPLETE — source pages missing or in build only

### Enterprise Portal — /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal/
Status: LARGEST — 200+ pages — NO AI ENGINE BEHIND IT
Key pages:
- /dashboard — Basic dashboard
- /executive/* — Executive intelligence (7 pages)
- /commercial/* — Commercial module (7 pages)
- /operations/* — Operations with workflows, work orders, technicians, calendar, dispatch (20+ pages)
- /maintenance/* — Maintenance with assets, PM plans, schedule (15+ pages)
- /supply-chain/* — Supply chain with procurement, inventory, vendors (25+ pages)
- /projects-center/* — Projects (6 pages)
- /engineering/* — Engineering (5 pages)
- /analytics/scorecards, /analytics/sla — Analytics
- /graph — Enterprise graph navigator
- /inbox, /inbox/presets — Inbox
- /alerts — Alerts
- /approvals — Approvals
- /recommendations — AI recommendations (no backend)
Backend: 40+ API files in lib/ — pointing to triangle-black API
Components: 70+ workspace components (CommandPalette, EntityShell, EnterpriseGraphNavigator, etc.)

### Admin Portal — /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/admin-portal/
Pages: dashboard, users, agents, contracts, system, login

### Client Portal — /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/client-portal/
Pages: dashboard, contracts, invoices, quotes, activities

## Missing From Enterprise — Must Migrate From Legacy
1. AI agent dashboard (live agent calls, analytics stats)
2. Chat interface connected to AI engine
3. Knowledge management UI
4. Memory explorer connected to vector store
5. Model management page
6. Reflections viewer
7. Tools management page
8. AI analytics with cost tracking

## Dashboard Gap Summary
Enterprise has business dashboards. It has zero AI OS dashboards.
Legacy has AI OS dashboards. It has zero business dashboards.
Goal: Unified dashboard with both layers.
