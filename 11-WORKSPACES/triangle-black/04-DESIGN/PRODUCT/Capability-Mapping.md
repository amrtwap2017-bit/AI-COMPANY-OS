# Capability Mapping

## Business Capability → Module Traceability

Every feature and module traces to a documented business capability from Business-Capability-Matrix.md.

### Business Development

| Capability | Module | V1 Features | Portal |
|------------|--------|-------------|--------|
| Marketing | Marketing Site | WEB-001 through WEB-008 | Public Website |
| CRM (Lead Management) | CRM | CRM-001, CRM-004, CRM-005, CRM-006, CRM-007, CRM-008, CRM-009 | Operations Portal |
| CRM (Opportunities) | CRM | CRM-002, CRM-003 | Operations Portal |
| Quotations | Quotations | QTN-001 through QTN-009 | Operations Portal |
| Contracts | Quotations | QTN-007 (contract generation) | Operations Portal |

### Engineering Delivery

| Capability | Module | V1 Features | Portal |
|------------|--------|-------------|--------|
| Site Survey | Projects | PRJ-007 | Operations Portal |
| Engineering Design | Projects | PRJ-008 | Operations Portal |
| Procurement | (V2) Procurement | — | Operations Portal |
| Supply | (V2) Procurement | — | Operations Portal |
| Contracting | Projects | PRJ-001 through PRJ-006 | Operations Portal |
| Installation | Projects | PRJ-001 through PRJ-006 | Operations Portal |
| QA/QC | Projects | PRJ-003, PRJ-004 | Operations Portal |
| Handover | Projects | PRJ-003, PRJ-004 | Operations Portal |

### Client Success

| Capability | Module | V1 Features | Portal |
|------------|--------|-------------|--------|
| Client Portal | Client Portal | POR-001 through POR-010 | Client Portal |
| Reports | Executive Dashboard | DSH-001 through DSH-007 | Executive Dashboard |
| Support | Client Portal | POR-007 | Client Portal |
| Renewals | (V2) Procurement/CRM | — | Operations Portal |

### Internal Operations

| Capability | Module | V1 Features | Portal |
|------------|--------|-------------|--------|
| Finance | (V2) | — | Operations Portal |
| HR | (V2) | — | Operations Portal |
| Knowledge | (V2) | — | Operations Portal |
| Documents | Cross-cutting | File upload, version control | All portals |
| Administration | Administration | ADM-001 through ADM-007 | Operations Portal |

### Executive Intelligence

| Capability | Module | V1 Features | Portal |
|------------|--------|-------------|--------|
| KPI | Executive Dashboard | DSH-001 through DSH-007 | Executive Dashboard |
| Forecasting | Executive Dashboard | DSH-002 | Executive Dashboard |
| Risk | Executive Dashboard | DSH-003 | Executive Dashboard |
| Strategy | Executive Dashboard | (V2) | Executive Dashboard |

---

## Module → Capability Traceability (Inverse)

| Module | Capabilities Served | Coverage |
|--------|-------------------|----------|
| Marketing Site | Marketing, Lead Generation | V1 |
| CRM | CRM (Lead Management), CRM (Opportunities) | V1 |
| Quotations | Quotations, Contracts | V1 |
| Projects | Site Survey, Engineering Design, Contracting, Installation, QA/QC, Handover | V1 |
| Client Portal | Client Portal, Support | V1 |
| Executive Dashboard | KPI, Forecasting, Risk | V1 |
| Administration | Administration | V1 |
| Procurement (V2) | Procurement, Supply | V2 |
| Maintenance (V2) | Maintenance, Asset Management | V2 |

---

## Capability Heat Map (V1 Coverage)

```
Marketing         ████████████████░░  80%
CRM (Leads)       ████████████████░░  80%
CRM (Opps)        ████████████████░░  80%
Quotations        █████████████████░  90%
Contracts         ██████░░░░░░░░░░░░  35%  (basic generation only)
Site Survey       ████████████░░░░░░  60%
Engineering Design████░░░░░░░░░░░░░░  20%  (basic assessment only)
Procurement       ░░░░░░░░░░░░░░░░░░   0%  (V2)
Contracting       ██████████░░░░░░░░  50%
Installation      ██████████░░░░░░░░  50%
QA/QC             ██████░░░░░░░░░░░░  30%  (file-based only)
Handover          ██████░░░░░░░░░░░░  30%  (file-based only)
Client Portal     ████████████████░░  80%
Support           ██████████░░░░░░░░  50%
Administration    ██████████████████ 100%
Executive KPI     ████████████████░░  80%
```
