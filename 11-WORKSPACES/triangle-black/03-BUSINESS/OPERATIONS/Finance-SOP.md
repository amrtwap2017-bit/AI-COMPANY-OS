# Finance SOP — Standard Operating Procedure

## Purpose
Define financial operations processes including client invoicing, payment collection, supplier payments, budget tracking, and reconciliation to ensure cash flow stability and financial control.

## Scope
All financial transactions processed through or managed by Triangle Black.

## Actors
- Finance Controller — manages financial operations
- Accountant — performs day-to-day financial tasks
- Operations Director — approves financial decisions
- Client — receives invoices and makes payments
- Supplier — receives payments for goods/services

## Process Flow

### 1. Client Invoicing
| Step | Action | Owner |
|------|--------|-------|
| 1.1 | Invoice trigger: recurring retainer date, project milestone completion, or PO delivery | Platform / Finance Controller |
| 1.2 | Invoice generated from platform with line items, rates, taxes, and terms | Platform |
| 1.3 | Invoice reviewed for accuracy by Accountant | Accountant |
| 1.4 | Invoice approved by Finance Controller | Finance Controller |
| 1.5 | Invoice sent to client via email and client portal | Platform |
| 1.6 | Invoice recorded in accounts receivable ledger | Accountant |

### 2. Payment Collection
| Step | Action | Owner |
|------|--------|-------|
| 2.1 | Payment due date tracked per invoice terms | Platform |
| 2.2 | Payment reminder sent 7 days before due date | Platform |
| 2.3 | Payment received via bank transfer, credit card, or cheque | Client |
| 2.4 | Payment matched to invoice in system | Accountant |
| 2.5 | Invoice marked as Paid | Accountant |
| 2.6 | Overdue follow-up: Day 1, Day 7, Day 15, Day 30 escalated | Platform + Accountant |

### 3. Supplier Payment
| Step | Action | Owner |
|------|--------|-------|
| 3.1 | Approved invoices queued for payment run | Finance Controller |
| 3.2 | Payment run schedule: weekly (Thursday) | Finance Controller |
| 3.3 | Payment file generated (bank transfer instructions) | Accountant |
| 3.4 | Payment approved by Finance Controller | Finance Controller |
| 3.5 | Payment executed via banking platform | Finance Controller |
| 3.6 | Payment confirmation uploaded to platform | Accountant |
| 3.7 | Supplier invoice marked as Paid | Accountant |

### 4. Budget Tracking
| Step | Action | Owner |
|------|--------|-------|
| 4.1 | Annual budget created per property and department | Operations Director |
| 4.2 | Budget approved by CEO / Board | CEO |
| 4.3 | Budget loaded into platform with monthly breakdown | Finance Controller |
| 4.4 | Actual spend tracked against budget in real time | Platform |
| 4.5 | Budget alerts triggered at 75%, 90%, 100% of allocated amount | Platform |
| 4.6 | Budget variance report generated monthly | Accountant |
| 4.7 | Variance > 10% requires explanation and action plan | Department Head |

### 5. Reconciliation
| Step | Action | Owner |
|------|--------|-------|
| 5.1 | Bank statement downloaded monthly | Accountant |
| 5.2 | Platform transactions matched to bank statement | Accountant |
| 5.3 | Unmatched items investigated and resolved | Accountant |
| 5.4 | Client invoice aging report reviewed | Finance Controller |
| 5.5 | Supplier payment aging report reviewed | Finance Controller |
| 5.6 | Revenue vs forecast variance analyzed | Finance Controller |
| 5.7 | Monthly financial report prepared for management | Finance Controller |

## Business Rules
- No payment without approved invoice (client) or matched PO (supplier)
- Client payment terms: Net 30 (standard), Net 15 (preferred), Net 60 (by exception)
- Overdue accounts > 60 days trigger service suspension warning
- Supplier payments net 30 from approved invoice
- Petty cash: maximum EGP 10,000 per transaction, monthly reconciliation
- All financial transactions recorded in platform — no off-book entries

## Inputs / Outputs
| Inputs | Outputs |
|--------|---------|
| Client contract terms | Client invoice |
| Project milestone completion | Payment receipt |
| Supplier invoice (matched to PO) | Supplier payment |
| Budget allocation | Budget variance report |
| Bank statement | Monthly financial report |

## KPIs
| KPI | Target | Frequency |
|-----|--------|-----------|
| Invoicing accuracy | 100% | Monthly |
| On-time payment collection | > 90% | Monthly |
| Days Sales Outstanding (DSO) | < 45 days | Monthly |
| Supplier payment on-time | 100% | Monthly |
| Budget variance | < 10% | Monthly |
| Reconciliation completion | Within 15 days of month-end | Monthly |

## Exceptions
- Urgent supplier payment: Finance Controller can approve accelerated payment with written justification
- Client payment plan: Must be documented, approved by Operations Director, maximum 6-month term
- Disputed invoices: Escalated to Operations Director, resolved within 10 business days
