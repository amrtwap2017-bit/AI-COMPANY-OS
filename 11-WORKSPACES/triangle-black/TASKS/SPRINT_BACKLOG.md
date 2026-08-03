# SPRINT BACKLOG — Triangle Black

## SPRINT-001: CRM Portal (IN PROGRESS)

### Done
- [x] Leads list page (portal/app/(app)/leads/page.tsx)
- [x] Lead detail page (portal/app/(app)/leads/[id]/page.tsx)
- [x] Quotes list page (portal/app/(app)/quotes/page.tsx)

### Bugs to fix
- [ ] Lead detail 405: leadsApi.get() → tbFetch /api/v1/leads/{id}
- [ ] Leads field names: name/company not contact_name/company_name
- [ ] Sidebar duplicate key /settings/users

### Still needed
- [ ] Quote detail page: /quotes/[id]/page.tsx
      API: GET /api/v1/quotes/{id} (via quotesApi.get)
      Actions: approve, reject, send buttons
- [ ] Contracts list: /contracts/page.tsx
      API: GET /api/v1/contracts/?limit=100
- [ ] Contract detail: /contracts/[id]/page.tsx
- [ ] Lead create form: /leads/new/page.tsx
      API: POST /api/v1/actions/leads/create
- [ ] Pipeline summary widget on dashboard
      API: GET /api/v1/actions/pipeline/summary

## SPRINT-010: Procurement Portal

### Portal pages needed
- [ ] Purchase requests list: /supply-chain/purchase-requests/page.tsx
- [ ] Purchase request detail: /supply-chain/purchase-requests/[id]/page.tsx
- [ ] Purchase orders list: /supply-chain/purchase-orders/page.tsx
- [ ] Purchase order detail: /supply-chain/purchase-orders/[id]/page.tsx
- [ ] RFQ list: /supply-chain/rfqs/page.tsx

## SPRINT-016: Maintenance Portal

### Portal pages needed
- [ ] Work orders list: fix useMutation bug first
      File: portal/app/(app)/(enterprise)/operations/work-orders/page.tsx
      Bug: useMutation not imported (use useState + fetch instead)
- [ ] Work order detail
- [ ] PM Plans list

## WHAT IS MISSING FROM BACKEND

- [ ] HR domain (Sprint-019/020) — 0% implemented
- [ ] Financial GL (Sprint-015) — 0% implemented
- [ ] ETA e-invoicing integration
- [ ] Surveys module (Sprint-003)

## WHAT IS MISSING FROM PORTAL

- [ ] Most (app)/(enterprise)/ pages are placeholders
- [ ] Dashboard not connected to real data
- [ ] Mobile field technician views
- [ ] Supplier portal pages

## TEST COVERAGE GAPS

- [ ] auth module: unknown coverage
- [ ] purchase_orders: ~10%
- [ ] work_orders: ~10%
- [ ] All modules need tenant isolation tests

