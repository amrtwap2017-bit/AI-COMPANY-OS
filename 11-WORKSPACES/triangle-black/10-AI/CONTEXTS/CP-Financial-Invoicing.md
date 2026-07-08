# Context Pack: Financial Invoicing

**Pack ID:** CP-Financial-Invoicing
**Version:** 1.0
**Domain:** Financial Control
**Sprint:** 013, 014, 015

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/05-Financial-Control/Financial-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/05-Financial-Control/Customer-Invoicing.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Financial-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Financial-Rules.md` | Backend Lead AI |
| 5 | Revenue Recognition | `../02-DOMAIN-DOCS/05-Financial-Control/Revenue-Recognition.md` | Business Analyst AI |
| 6 | Payment Tracking | `../02-DOMAIN-DOCS/05-Financial-Control/Payment-Tracking.md` | Backend Lead AI |
| 7 | 3-Way Matching | `../02-DOMAIN-DOCS/05-Financial-Control/3-Way-Matching.md` | Backend Lead AI |
| 8 | Payment Runs | `../02-DOMAIN-DOCS/05-Financial-Control/Payment-Runs.md` | Solution Architect AI |
| 9 | General Ledger | `../02-DOMAIN-DOCS/05-Financial-Control/General-Ledger.md` | Database Architect AI |
| 10 | Chart of Accounts | `../02-DOMAIN-DOCS/05-Financial-Control/Chart-of-Accounts.md` | Database Architect AI |
| 11 | Financial Reporting | `../02-DOMAIN-DOCS/05-Financial-Control/Financial-Reporting.md` | Business Analyst AI |
| 12 | ETA Integration | `../02-DOMAIN-DOCS/05-Financial-Control/ETA-Integration.md` | Integration AI |
| 13 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 14 | Integration Standards | `../04-STANDARDS/Integration-Standards.md` | Integration AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| CustomerInvoice | `fin_customer_invoices` | id, contract_id, project_id, number, status, invoice_date, due_date, total_amount, paid_amount, created_at | Database Architect AI |
| InvoiceLineItem | `fin_invoice_line_items` | id, invoice_id, description, quantity, unit_price, total, tax_rate, tax_amount | Database Architect AI |
| RevenueRecognition | `fin_revenue_recognition` | id, invoice_id, amount, recognized_date, method, period_start, period_end | Database Architect AI |
| Payment | `fin_payments` | id, invoice_id, amount, payment_date, method, reference, status, reconciled_at | Database Architect AI |
| SupplierInvoice | `fin_supplier_invoices` | id, po_id, supplier_id, number, status, invoice_date, due_date, total_amount, paid_amount | Database Architect AI |
| MatchResult | `fin_match_results` | id, supplier_invoice_id, po_id, gr_id, status, difference, matched_at | Database Architect AI |
| PaymentRun | `fin_payment_runs` | id, number, status, run_date, total_amount, approved_by, executed_at | Database Architect AI |
| ChartOfAccount | `fin_chart_of_accounts` | id, code, name, type, category, is_active, balance | Database Architect AI |
| JournalEntry | `fin_journal_entries` | id, entry_number, description, entry_date, status, posted_by, posted_at | Database Architect AI |
| JournalLine | `fin_journal_lines` | id, journal_entry_id, account_id, debit_amount, credit_amount, description | Database Architect AI |
| ETATransaction | `fin_eta_transactions` | id, invoice_id, submission_id, status, submitted_at, response_code, response_message | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/financial/invoices` | GET/POST | Customer invoices | Backend Lead AI |
| `/api/financial/invoices/{id}` | GET/PUT/DELETE | Invoice detail | Backend Lead AI |
| `/api/financial/invoices/{id}/send` | POST | Send invoice | Backend Lead AI |
| `/api/financial/invoices/{id}/payments` | GET/POST | Record payment | Backend Lead AI |
| `/api/financial/invoices/{id}/credit-note` | POST | Credit note | Backend Lead AI |
| `/api/financial/revenue-recognition` | GET | Revenue schedule | Backend Lead AI |
| `/api/financial/revenue-recognition/recognize` | POST | Run recognition | Backend Lead AI |
| `/api/financial/supplier-invoices` | GET/POST | Supplier invoices | Backend Lead AI |
| `/api/financial/supplier-invoices/{id}/match` | POST | Run 3-way match | Backend Lead AI |
| `/api/financial/payment-runs` | GET/POST | Payment runs | Backend Lead AI |
| `/api/financial/payment-runs/{id}/execute` | POST | Execute payment run | Backend Lead AI |
| `/api/financial/accounts` | GET/POST | Chart of accounts | Backend Lead AI |
| `/api/financial/journal-entries` | GET/POST | Journal entries | Backend Lead AI |
| `/api/financial/journal-entries/{id}/post` | POST | Post journal entry | Backend Lead AI |
| `/api/financial/reports/trial-balance` | GET | Trial balance | Backend Lead AI |
| `/api/financial/reports/profit-loss` | GET | P&L statement | Backend Lead AI |
| `/api/financial/reports/balance-sheet` | GET | Balance sheet | Backend Lead AI |
| `/api/financial/eta/invoice` | POST | Submit to ETA | Backend Lead AI |
| `/api/financial/eta/status/{id}` | GET | ETA status | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/financial/invoices` | Invoice list | Frontend Lead AI |
| `/financial/invoices/new` | Create invoice | Frontend Lead AI |
| `/financial/invoices/{id}` | Invoice detail | Frontend Lead AI |
| `/financial/invoices/{id}/payments` | Payment history | Frontend Lead AI |
| `/financial/revenue-recognition` | Revenue schedule | Frontend Lead AI |
| `/financial/supplier-invoices` | Supplier invoice list | Frontend Lead AI |
| `/financial/supplier-invoices/{id}/match` | 3-way match result | Frontend Lead AI |
| `/financial/payment-runs` | Payment run list | Frontend Lead AI |
| `/financial/payment-runs/{id}` | Run detail | Frontend Lead AI |
| `/financial/accounts` | Chart of accounts | Frontend Lead AI |
| `/financial/journal-entries` | Journal entry list | Frontend Lead AI |
| `/financial/reports/trial-balance` | Trial balance | Frontend Lead AI |
| `/financial/reports/profit-loss` | P&L statement | Frontend Lead AI |
| `/financial/reports/balance-sheet` | Balance sheet | Frontend Lead AI |
| `/financial/eta` | ETA integration dashboard | Frontend Lead AI |

### Dependencies
- CP-CRM-Contracts
- CP-Project-Delivery
- CP-Procurement

### Output Checklist
- [ ] Backend module with 19+ endpoints
- [ ] Frontend pages with 15+ components
- [ ] Database migration (11 tables)
- [ ] Unit tests (90 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 18
- **Frontend files:** 20
- **Test files:** 32
- **Document files:** 6
- **Total sprint effort:** 30 days
