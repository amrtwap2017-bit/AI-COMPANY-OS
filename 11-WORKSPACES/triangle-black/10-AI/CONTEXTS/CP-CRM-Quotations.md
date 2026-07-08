# Context Pack: Quotation Management

**Pack ID:** CP-CRM-Quotations
**Version:** 1.0
**Domain:** Commercial
**Sprint:** 004

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/01-Commercial/CRM-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/01-Commercial/Quotation-Process.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Quotation-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Pricing-Rules.md` | Backend Lead AI |
| 5 | BOQ Structure | `../02-DOMAIN-DOCS/01-Commercial/BOQ-Structure.md` | Solution Architect AI |
| 6 | Pricing Rules | `../02-DOMAIN-DOCS/01-Commercial/Pricing-Rules.md` | Backend Lead AI |
| 7 | Approval Workflows | `../02-DOMAIN-DOCS/01-Commercial/Approval-Workflows.md` | Solution Architect AI |
| 8 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 9 | Coding Standards | `../04-STANDARDS/Coding-Standards.md` | All Agents |
| 10 | UI Patterns | `../04-STANDARDS/UI-Patterns.md` | Frontend Lead AI |
| 11 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |
| 12 | PDF Templates | `../04-STANDARDS/PDF-Templates.md` | Document AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Quotation | `crm_quotations` | id, opportunity_id, version, status, total_amount, discount, tax, grand_total, valid_until, approved_by, created_at | Database Architect AI |
| QuotationLineItem | `crm_quotation_line_items` | id, quotation_id, product_id, description, quantity, unit_price, discount, total | Database Architect AI |
| QuotationVersion | `crm_quotation_versions` | id, quotation_id, version_number, data, created_by, created_at | Database Architect AI |
| BillOfQuantities | `crm_boq` | id, name, project_type_id, version, status | Database Architect AI |
| BOQLineItem | `crm_boq_line_items` | id, boq_id, section, code, description, unit, quantity, unit_price | Database Architect AI |
| PricingRule | `crm_pricing_rules` | id, name, type, conditions, discount_percent, priority, is_active | Database Architect AI |
| ProductCatalog | `crm_products` | id, name, sku, category, unit, base_price, tax_rate, is_active | Database Architect AI |
| ApprovalRequest | `crm_approval_requests` | id, quotable_type, quotable_id, status, requested_by, approved_by, comments, created_at | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/quotations` | GET/POST | Quotation list and create | Backend Lead AI |
| `/api/quotations/{id}` | GET/PUT/DELETE | Quotation detail | Backend Lead AI |
| `/api/quotations/{id}/versions` | GET/POST | Version management | Backend Lead AI |
| `/api/quotations/{id}/versions/{vId}` | GET | Version detail | Backend Lead AI |
| `/api/quotations/{id}/pdf` | GET | Generate PDF | Backend Lead AI |
| `/api/quotations/{id}/approve` | POST | Submit for approval | Backend Lead AI |
| `/api/quotations/{id}/approve/action` | POST | Approve/reject | Backend Lead AI |
| `/api/boq` | GET/POST | BOQ management | Backend Lead AI |
| `/api/boq/{id}` | GET/PUT | BOQ detail | Backend Lead AI |
| `/api/boq/{id}/line-items` | GET/POST | BOQ line items | Backend Lead AI |
| `/api/pricing/rules` | GET/POST | Pricing rule config | Backend Lead AI |
| `/api/pricing/calculate` | POST | Calculate quotation price | Backend Lead AI |
| `/api/products` | GET/POST | Product catalog | Backend Lead AI |
| `/api/products/{id}` | GET/PUT/DELETE | Product detail | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/quotations` | Quotation list with status filters | Frontend Lead AI |
| `/quotations/new` | Create quotation from opportunity | Frontend Lead AI |
| `/quotations/{id}` | Quotation detail with line items | Frontend Lead AI |
| `/quotations/{id}/edit` | Edit quotation | Frontend Lead AI |
| `/quotations/{id}/preview` | PDF preview | Frontend Lead AI |
| `/quotations/{id}/approvals` | Approval workflow view | Frontend Lead AI |
| `/boq` | BOQ list | Frontend Lead AI |
| `/boq/new` | Create BOQ | Frontend Lead AI |
| `/boq/{id}` | BOQ detail with line items | Frontend Lead AI |
| `/products` | Product catalog | Frontend Lead AI |
| `/products/new` | Create product | Frontend Lead AI |
| `/products/{id}` | Product detail | Frontend Lead AI |
| `/pricing/rules` | Pricing rules config | Frontend Lead AI |

### Dependencies
- CP-CRM-Opportunities
- CP-CRM-Leads

### Output Checklist
- [ ] Backend module with 14+ endpoints
- [ ] Frontend pages with 13+ components
- [ ] Database migration (8 tables)
- [ ] Unit tests (70 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 14
- **Frontend files:** 16
- **Test files:** 25
- **Document files:** 5
- **Total sprint effort:** 24 days
