# Context Pack: Procurement

**Pack ID:** CP-Procurement
**Version:** 1.0
**Domain:** Procurement, Supplier Management
**Sprint:** 010, 011

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/03-Procurement/Procurement-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/03-Procurement/Purchase-Request.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Procurement-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Procurement-Rules.md` | Backend Lead AI |
| 5 | RFQ Process | `../02-DOMAIN-DOCS/03-Procurement/RFQ-Process.md` | Solution Architect AI |
| 6 | Purchase Order | `../02-DOMAIN-DOCS/03-Procurement/Purchase-Order.md` | Backend Lead AI |
| 7 | Goods Receipt | `../02-DOMAIN-DOCS/03-Procurement/Goods-Receipt.md` | Backend Lead AI |
| 8 | Supplier Management | `../02-DOMAIN-DOCS/03-Procurement/Supplier-Management.md` | Business Analyst AI |
| 9 | Supplier Qualification | `../02-DOMAIN-DOCS/03-Procurement/Supplier-Qualification.md` | Business Analyst AI |
| 10 | Supplier Performance | `../02-DOMAIN-DOCS/03-Procurement/Supplier-Performance.md` | Backend Lead AI |
| 11 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 12 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| PurchaseRequest | `proc_purchase_requests` | id, project_id, requester_id, department, status, total_estimated, approved_by, created_at | Database Architect AI |
| PurchaseRequestItem | `proc_pr_items` | id, pr_id, product_id, description, quantity, estimated_unit_price, required_date | Database Architect AI |
| RFQ | `proc_rfqs` | id, pr_id, number, status, issue_date, closing_date, awarded_supplier_id | Database Architect AI |
| RFQResponse | `proc_rfq_responses` | id, rfq_id, supplier_id, total_amount, currency, validity_date, status | Database Architect AI |
| PurchaseOrder | `proc_purchase_orders` | id, rfq_id, supplier_id, number, status, order_date, delivery_date, total_amount, approved_by | Database Architect AI |
| PurchaseOrderItem | `proc_po_items` | id, po_id, product_id, description, quantity, unit_price, total, received_quantity | Database Architect AI |
| GoodsReceipt | `proc_goods_receipts` | id, po_id, receipt_number, received_date, received_by, status, notes | Database Architect AI |
| GoodsReceiptLine | `proc_gr_lines` | id, goods_receipt_id, po_item_id, quantity_received, quantity_accepted, quantity_rejected | Database Architect AI |
| Supplier | `supp_suppliers` | id, name, code, tax_id, contact_info, status, category_id, created_at | Database Architect AI |
| SupplierQualification | `supp_qualifications` | id, supplier_id, qualification_date, expiry_date, status, score, assessed_by | Database Architect AI |
| SupplierPerformance | `supp_performance` | id, supplier_id, review_date, on_time_delivery, quality_score, compliance_score, overall_score | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/procurement/requests` | GET/POST | Purchase requests | Backend Lead AI |
| `/api/procurement/requests/{id}` | GET/PUT/DELETE | Request detail | Backend Lead AI |
| `/api/procurement/requests/{id}/submit` | POST | Submit for approval | Backend Lead AI |
| `/api/procurement/requests/{id}/approve` | POST | Approve/reject | Backend Lead AI |
| `/api/procurement/rfq` | GET/POST | RFQ management | Backend Lead AI |
| `/api/procurement/rfq/{id}` | GET/PUT | RFQ detail | Backend Lead AI |
| `/api/procurement/rfq/{id}/responses` | GET/POST | Supplier responses | Backend Lead AI |
| `/api/procurement/rfq/{id}/award` | POST | Award to supplier | Backend Lead AI |
| `/api/procurement/orders` | GET/POST | Purchase orders | Backend Lead AI |
| `/api/procurement/orders/{id}` | GET/PUT | PO detail | Backend Lead AI |
| `/api/procurement/orders/{id}/receive` | POST | Create goods receipt | Backend Lead AI |
| `/api/procurement/orders/{id}/receive/{gId}` | GET | Receipt detail | Backend Lead AI |
| `/api/suppliers` | GET/POST | Supplier list | Backend Lead AI |
| `/api/suppliers/{id}` | GET/PUT/DELETE | Supplier detail | Backend Lead AI |
| `/api/suppliers/{id}/qualification` | GET/POST/PUT | Qualification | Backend Lead AI |
| `/api/suppliers/{id}/performance` | GET/POST | Performance reviews | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/procurement/requests` | Purchase request list | Frontend Lead AI |
| `/procurement/requests/new` | Create purchase request | Frontend Lead AI |
| `/procurement/requests/{id}` | Request detail and approvals | Frontend Lead AI |
| `/procurement/rfq` | RFQ list | Frontend Lead AI |
| `/procurement/rfq/new` | Create RFQ from request | Frontend Lead AI |
| `/procurement/rfq/{id}` | RFQ detail with responses | Frontend Lead AI |
| `/procurement/orders` | Purchase order list | Frontend Lead AI |
| `/procurement/orders/new` | Create PO from RFQ | Frontend Lead AI |
| `/procurement/orders/{id}` | PO detail with items | Frontend Lead AI |
| `/procurement/orders/{id}/receive` | Goods receipt form | Frontend Lead AI |
| `/suppliers` | Supplier list | Frontend Lead AI |
| `/suppliers/new` | Register supplier | Frontend Lead AI |
| `/suppliers/{id}` | Supplier detail | Frontend Lead AI |
| `/suppliers/{id}/qualification` | Qualification status | Frontend Lead AI |
| `/suppliers/{id}/performance` | Performance history | Frontend Lead AI |

### Dependencies
- CP-Project-Delivery

### Output Checklist
- [ ] Backend module with 16+ endpoints
- [ ] Frontend pages with 15+ components
- [ ] Database migration (11 tables)
- [ ] Unit tests (75 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 16
- **Frontend files:** 18
- **Test files:** 28
- **Document files:** 5
- **Total sprint effort:** 26 days
