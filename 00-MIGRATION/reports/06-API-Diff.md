# 06 — API Diff

## Legacy API Routes (/api/v1/)
Source: /home/amr/AI/projects/ai-company-os/apps/api/app/api/v1/routes/
- /agents — Agent list, detail, department
- /analytics — Overview, metrics
- /auth — JWT auth, API keys, RBAC
- /benchmarks — Benchmark runs
- /chat — Chat with AI
- /collaborate — Multi-agent collaboration
- /dag — DAG execution
- /decisions — Decision engine
- /documents — Document management
- /enterprise — Enterprise routes
- /graph — Knowledge graph
- /health — Health check
- /integrations — GitHub, Slack
- /knowledge — Knowledge ingestion, search, hybrid search
- /learning — Learning insights
- /memory — Memory CRUD, vector search
- /messages — Messaging
- /models — AI model management
- /projects — Project management
- /prompts — Prompt management
- /real_time — SSE real-time events
- /reflections — Reflection engine
- /scheduler — Platform scheduler
- /self_improvement — Self-improvement engine
- /software_builder — Software builder
- /tasks — Background tasks
- /tools — Tool execution
- /workflows — Workflow engine

## Enterprise API Routes (/api/v1/)
Source: /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial/
- /leads — Lead management
- /agents (CRM) — Sales agent management (NOT AI agents)
- /pipeline — Pipeline dashboard
- /activities — Activity tracking
- /search — Search filters
- /webhooks — Webhook notifications
- /quotations — Quotation management
- /auth — JWT auth
- /reports — Reporting
- /contracts — Contract management
- /notifications — Notifications
- /invoices — Invoice management
- /hotels — Hotel management
- /cache — Cache management
- /pagination — Pagination utilities
- /email — Email notifications + service
- /technicians — Technician management
- /sites — Site management
- /assets — Asset management
- /work-orders — Work order management
- /service-requests — Service requests
- /service-reports — Service reports
- /inventory-items — Inventory
- /warehouses — Warehouse management
- /inventory-vendors — Vendor management
- /stock-movements — Stock movements
- /purchase-requests — Purchase requests
- /purchase-orders — Purchase orders
- /goods-receipts — Goods receipts
- /payment-tracking — Payment tracking
- /projects (business) — Business projects
- /dashboard — Commercial dashboard
- /documents — Documents
- /pdf — PDF generation
- /system-notifications — System notifications
- /vendor-portal — Vendor portal
- /executive-intelligence — Executive intelligence
- /analytics-platform — Analytics KPIs

## Name Collision — CRITICAL
| Route Name | Legacy Meaning | Enterprise Meaning | Risk |
|-----------|---------------|-------------------|------|
| /agents | AI agents (developer, planner, reviewer) | CRM sales agents | COLLISION |
| /projects | AI code projects | Hotel engineering projects | COLLISION |
| /analytics | AI usage analytics | Business KPI analytics | COLLISION |
| /documents | AI knowledge documents | Business documents | COLLISION |
| /notifications | (none) | Business notifications | SAFE |
| /auth | JWT for AI OS | JWT for SaaS | MERGE |
| /health | AI OS health | None | SAFE |

## API Architecture Gap
| Feature | Legacy | Enterprise | Action |
|---------|--------|------------|--------|
| Versioning | /api/v1/ via router module | /api/v1/ inline | LEGACY PATTERN — KEEP |
| Rate limiting | slowapi per route | None | ADD from Legacy |
| Request ID | Middleware | None | ADD from Legacy |
| SSE | /real_time route | None | MIGRATE from Legacy |
| WebSocket | None | None | NOT YET |
| Background jobs | task_queue | None | ADD from Legacy |
| Auth middleware | RBAC + API keys | JWT only | ENHANCE from Legacy |
| OpenAPI | /docs (prod disabled) | /docs always on | LEGACY PATTERN — SAFER |

## Recommendation
Separate AI OS API and Business API under different prefixes:
- /api/v1/ai/ — all AI OS routes (agents, memory, knowledge, tools, etc.)
- /api/v1/ — all business routes (unchanged)
This prevents all name collisions.
