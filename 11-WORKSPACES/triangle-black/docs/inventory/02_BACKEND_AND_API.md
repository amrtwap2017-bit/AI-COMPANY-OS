# Backend and API Inventory

## Runtime composition

- Primary app: `src.main:app` (FastAPI), currently 7,619 lines.
- API surface: 590 endpoint decorators across `src`; 111 have explicit response models; 121 accept untyped dictionary payloads.
- Composition: routers are mounted from `src/commercial`, `src/core`, specialized modules and extensive direct routes in `main.py`.
- Data access: 742 raw SQL execution sites and 157 `create_engine` occurrences; router/service/repository separation is inconsistent.

## Commercial module catalog

| Context family | Modules discovered |
|---|---|
| Commercial | lead_management, agent_management, pipeline_dashboard, activity_tracking, quotation, contracts, sales_pipeline, customer360, customer_success, reporting, invoices, payment_tracking |
| Operations/Maintenance | service_requests, work_orders, service_reports, technicians, sites, assets, maintenance_enterprise, predictive_maintenance, maintenance scheduling, SLA dashboard, warranty, digital_twin |
| Supply/Inventory | inventory_items, warehouses, inventory_vendors, stock_movements, inventory_alerts, purchase_requests, purchase_orders, goods_receipts, RFQs, procurement_intake, scope_of_work, supplier/vendor portals, warehouse intelligence |
| Platform | auth, hotels, cache, pagination, documents, search_filters, global_search, audit_log, tenant_audit, user_preferences, bulk_operations, webhooks, exports, scheduler |
| Workflow/notifications | approval_center, approval_chain, approval_requests, notifications, system_notifications, notification_engine, SSE notifications, email_notifications, email_alert, email_service |
| Executive/analytics | dashboard, executive_dashboard, executive_kpi, executive_intelligence, analytics_kpi, analytics_platform, performance_audit |
| AI/knowledge | ai_assistant, ai_mentor, ai_scheduling, ai_signals, knowledge_graph |

## Application, domain and infrastructure artifacts

`src/application/services`, `src/domain`, and `src/infrastructure/repositories` contain a small set of invoice, maintenance, project and commercial artifacts. Root-level `application`, `domain`, `infrastructure` and `api` contain parallel lead/assignment/workload implementations. They remain intact for compatibility but are not a coherent dependency structure.

## Repositories, services, DTOs and schemas

The strongest repeatable module shape is `models.py`, `schemas.py`, `repository.py`, `router.py`, used by lead, auth, contract, inventory, purchase, asset, work-order and related CRUD modules. Many later modules are router-only and use inline SQL/dictionaries. No universal command/query DTO, application-service port, pagination, problem-details or authorization contract currently governs the entire API.

## Background jobs, queues and cron

- `src/commercial/scheduler/jobs.py` is the identified scheduler/job artifact.
- No active queue broker, worker service, dead-letter queue, or job durability configuration is present in the production compose topology.
- Long-running exports, PDFs, emails, notifications, AI calls and data projections currently require a future job abstraction.

## API compatibility inventory

Existing `/api/v1/*` URLs are compatibility contracts. New canonical APIs must retain paths, request fields and response adapters until consumers migrate. Known deviations include list shapes (`[]`, `items`, `data`, `results`), direct/raw responses, inconsistent trailing slashes, untyped body dictionaries and locally-created tables in request paths.

## Route ownership requirement

Every endpoint must be registered in a generated route catalog with: route/method, bounded context, command/query classification, schema version, authorization policy, tenant scope, workflow transition, idempotency, cache policy, rate limit and deprecation state.

