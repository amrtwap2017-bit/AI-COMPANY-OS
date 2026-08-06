## ENTERPRISE READINESS SCORE: 45/100

The platform suffers from critical architectural fragmentation where core entities like Work Orders and Purchase Requests exist in duplicate paths across different domains, creating confusion for enterprise users. Furthermore, essential CRUD capabilities are missing or inconsistent (e.g., Assets cannot be created via API), while soft delete logic relies on a mixed `is_active` vs `deleted_at` pattern that lacks standardization.

## TOP 10 P0 BLOCKERS
(items that block enterprise use today)

1. **Duplicate Entity Paths:** Purchase Orders and Work Orders exist in both `/supply-chain` (Enterprise) and `/inventory` or general `(app)` domains, causing routing conflicts and data duplication risks.
2. **Missing Create API for Assets:** The `/assets` resource lacks a `POST` endpoint entirely; users cannot add new assets via the standard REST flow without work orders as a proxy.
3. **No Edit Capability for Contracts:** While contract details exist (`/contracts/[id]`), there is no explicit edit route, forcing manual data entry or duplicate creation to modify terms.
4. **Inconsistent Soft Delete Logic:** The system uses mixed patterns (`is_active` boolean vs `deleted_at` timestamp) across modules without a unified standard, risking accidental hard deletion of financial records like Invoices and Contracts.
5. **Missing Supplier Management API:** There is no `/suppliers` plural list endpoint or consistent CRUD logic for suppliers in the provided snippet; vendor management relies on fragmented ID-based routes only.
6. **Read-Only Financial Records:** `invoices`, `contracts`, and `work_orders` rely heavily on boolean flags (`is_active`) rather than physical soft deletes, making data recovery difficult if a user bypasses the flag via direct API manipulation.
7. **No Create Form for Hotels:** The Enterprise Admin domain lists hotels but lacks an explicit `/hotels/new/page.tsx` or corresponding backend `POST /hotels`, blocking new property onboarding.
8. **Missing Detail Views for Key Entities:** Critical entities like Technicians and Sites have list views in Operations (`/ops/*`) but lack dedicated `[id]/page.tsx` detail pages, forcing users to rely on work-order associations for context.
9. **Orphaned Invoice Domain:** Invoices appear under `/invoices` without clear integration into the Supply Chain flow (RFQs -> POs), creating a silo that disconnects procurement from billing logic.
10. **Generic ID Routes Lack List Context:** Many resources (`/contracts`, `/quotes`, `/risks`) only expose generic `{id}` detail routes but lack plural list endpoints, making bulk management impossible via standard REST patterns.

## TOP 10 P1 GAPS
(high value — fix in next 8 sprints)

1. **Standardize Soft Delete Pattern:** Unify all modules to use a single `deleted_at` timestamp pattern (or consistent `is_active`) and remove legacy mixed-pattern queries from Service Requests and Work Orders.
2. **Consolidate Supply Chain & Inventory Domains:** Merge duplicate routes for Purchase Orders, RFQs, and Vendors into the Enterprise `/supply-chain` domain to eliminate routing conflicts and data redundancy.
3. **Implement Edit Routes for Core Entities:** Add explicit `PATCH /contracts/[id]`, `PUT /quotes/[id]`, and standard update logic for Work Orders to replace manual duplication workflows.
4. **Create Asset Management API:** Develop full CRUD endpoints (`POST/GET/PATCH/DELETE`) for `/assets` to allow direct asset lifecycle management independent of work orders.
5. **Add Supplier List Endpoint:** Create a functional `/suppliers/page.tsx` and corresponding `GET /api/suppliers` endpoint to enable catalog viewing before moving to ID-specific actions.
6. **Fix Technician Detail Views:** Build dedicated `[id]/page.tsx` routes in the Operations domain for Technicians and Sites to provide deep inspection history without relying on Work Order links.
7. **Enable Hotel Creation Flow:** Implement `/administration/hotels/new/page.tsx` and backend `POST /hotels` logic to allow direct property registration via UI/API.
8. **Integrate Invoices into Procurement Flow:** Establish a clear data flow from RFQs/Purchase Orders to the Invoice domain, ensuring invoices are generated automatically upon PO approval rather than as an orphaned entity.
9. **Add Bulk Management for Alerts/Notifications:** Implement `PATCH` and bulk action endpoints (`GET /notifications`) beyond simple "mark-as-read" logic to allow administrative management of notification queues.
10. **Standardize Risk & Renewal Views:** Add missing detail views (`GET /risks/[id]`, `GET /renewals/[id]`) and create/update capabilities for these high-value risk assessment entities currently exposed only via summary lists.

## TECHNICAL DEBT REGISTER
| # | Item | Audit Source | Effort | Priority |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Mixed Soft Delete Patterns (`is_active` vs `deleted_at`) | Backend Modules / API CRUD Gaps | High (Refactor DB Schema & Queries) | P0 |
| 2 | Duplicate Entity Routes (POs, RFQs, Work Orders in App/Enterprise) | Portal Duplicates | Medium (Route Redirection/Merge) | P0 |
| 3 | Missing Standard REST CRUD for Assets/Suppliers/Renewals | API CRUD Gaps | High (Backend Development) | P1 |
| 4 | Inconsistent Detail Page Architecture (`[id]` missing in Ops domain) | Portal Duplicates / List vs Detail | Medium (Frontend Routing) | P1 |
| 5 | Orphaned Invoice Domain Logic | Backend Modules / API CRUD Gaps | Low/Medium (Integration Work) | P2 |

## SPRINT PLAN (Sprint-055 to Sprint-062)

**Sprint-055:** Goal — Resolve Soft Delete Inconsistency & Standardize Pattern
*   **Deliverable:** Unified `deleted_at` column implementation across all core tables; removal of legacy `is_active` filters from Service Requests and Work Orders.
*   **Acceptance Criteria:** All queries for Financial, Contract, and Operational entities use consistent timestamp-based soft delete logic; no direct hard-delete endpoints exist without audit logging.

**Sprint-056:** Goal — Consolidate Supply Chain & Inventory Domains
*   **Deliverable:** Migration of Purchase Orders and RFQs from `/inventory` to unified `/supply-chain`; creation of canonical routes for Vendors/Suppliers.
*   **Acceptance Criteria:** Requests via legacy inventory paths redirect or fail gracefully; single source of truth exists in Enterprise domain only.

**Sprint-057:** Goal — Implement Missing CRUD APIs (Assets, Suppliers)
*   **Deliverable:** Full REST API support for `/assets` and `/suppliers`; creation forms added to frontend where applicable.
*   **Acceptance Criteria:** Users can POST new assets/suppliers via standard routes; PATCH/DELETE operations function correctly with audit trails.

**Sprint-058:** Goal — Fix Contract & Quote Edit Flows
*   **Deliverable:** Explicit `PATCH /contracts/[id]` and `PUT /quotes/[id]` endpoints added to backend; corresponding edit forms created in frontend.
*   **Acceptance Criteria:** Users can modify existing contract terms or quote values without creating duplicates via the UI/API.

**Sprint-059:** Goal — Enhance Operations Detail Views (Technicians, Sites)
*   **Deliverable:** Dedicated `[id]/page.tsx` routes for Technicians and Sites in Operations domain; removal of reliance on Work Order associations for basic viewing.
*   **Acceptance Criteria:** Users can view full history/profile details without navigating to a work order first.

**Sprint-060:** Goal — Enable Hotel Onboarding & Invoice Integration
*   **Deliverable:** Implementation of `/hotels/new` flow and backend logic; establishment of automated invoice generation trigger upon PO approval.
*   **Acceptance Criteria:** New hotels can be created via UI/API; invoices appear in system automatically when procurement is finalized.

**Sprint-061:** Goal — Bulk Management for Alerts & Notifications
*   **Deliverable:** Implementation of bulk `PATCH` endpoints and improved list views (`GET /notifications`) beyond simple read actions.
*   **Acceptance Criteria:** Admins can mark multiple notifications as processed/read via a single action; notification queues are manageable at scale.

**Sprint-062:** Goal — Risk & Renewal Entity Completion
*   **Deliverable:** Addition of detail views (`[id]`) and CRUD capabilities for `/risks` and `/renewals`; creation forms implemented.
*   **Acceptance Criteria:** Risks can be created, viewed individually, updated, or deleted; renewals are fully manageable via standard entity flows.

## DEPENDENCY MAP
X must be built before Y

1.  **Unified Soft Delete Logic** (Sprint-055) must complete before **Contract/Invoice Audit Trails** become reliable for compliance reporting.
2.  **Supply Chain Consolidation** (Sprint-056) is a prerequisite for accurate **Purchase Order to Invoice Integration** (Sprint-060).
3.  **Standard Asset CRUD APIs** (Spart-057) must exist before **Work Order Scope of Work definitions** can be fully automated via asset data injection.
4.  **Contract Edit Routes** (Sprint-058) depend on the completion of **Unified Soft Delete Logic** to ensure historical contract versions are preserved correctly upon update.
5.  **Operations Detail Views** (Sprint-059) rely on backend consistency established in **Soft Delete Standardization** to prevent data leakage issues when viewing deleted technician records.
