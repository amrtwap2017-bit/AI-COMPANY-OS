# Phase 03 — Screen Architecture

> Complete screen inventory across all business domains.

## Screen Inventory

| Domain | Screens | Route Prefix |
|--------|---------|-------------|
| Commercial | 8 | `/commercial/` |
| Project Delivery | 5 | `/projects/` |
| Procurement | 3 | `/procurement/` |
| Supplier Management | 2 | `/suppliers/` |
| Inventory | 3 | `/inventory/` |
| Financial Control | 4 | `/financial/` |
| Maintenance | 3 | `/maintenance/` |
| Document Management | 2 | `/documents/` |
| Executive Intelligence | 4 | `/reports/` |
| AI Copilots | 2 | `/ai/` |
| Mobile | 5 | `/mobile/` |
| **Total** | **41** | |

## Screen Template

Each screen specification includes:
- **Route**: URL path
- **Purpose**: Business objective
- **Access**: Required role/permission
- **Components**: UI components used
- **Data**: API endpoints consumed
- **Actions**: User actions available
- **States**: Loading, empty, error, edge cases

## Key Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Lead List | `/commercial/leads` | View, filter, manage leads |
| Lead Detail | `/commercial/leads/{id}` | Full lead profile + activity |
| Quotation Builder | `/commercial/quotations/new` | Multi-line quotation creation |
| Pipeline Board | `/commercial/pipeline` | Kanban opportunity pipeline |
| Project Timeline | `/projects/{id}` | Gantt-style milestone view |
| NCR Board | `/projects/{id}/ncrs` | NCR management |
| PO Form | `/procurement/purchase-orders/new` | PO creation |
| 3-Way Match | `/financial/three-way-match` | PO/GR/Invoice matching |
| Executive Dashboard | `/reports` | KPI overview |
| Mobile Site Survey | `/mobile/survey` | Field survey with photos |

See `12-Frontend/` in Phase 3 for complete screen specifications with wireframes.
