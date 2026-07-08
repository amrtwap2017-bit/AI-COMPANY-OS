# Financial Control Module Map

## Scope
Budget planning and tracking, accounts receivable (invoicing, collections), accounts payable (bills, payments), 3-way matching, revenue recognition, general ledger, cost management, and cash flow management.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Budget Management | 5 | 240 |
| Accounts Receivable | 6 | 300 |
| Accounts Payable | 6 | 280 |
| 3-Way Match | 4 | 200 |
| Revenue Recognition | 5 | 220 |
| General Ledger | 6 | 260 |
| Cost Management | 4 | 180 |
| Cash Flow Management | 4 | 170 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/06-Financial-Control-Domain.md` — Full financial control domain spec
- `03-FEATURES/16-Financial-Control.md` — Financial control feature spec
- `03-FEATURES/17-Revenue-Recognition.md` — Revenue recognition feature spec
- `03-FEATURES/18-3-Way-Match.md` — 3-way match feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 8 |
| Frontend pages | Next.js pages | 20 |
| Database tables | Prisma models | 22 |
| API endpoints | REST routes | 50 |
| Test files | spec/test files | 70 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Budget | Budget | Budget with line items |
| Invoice | Invoice | AR invoice with line items |
| CreditNote | CreditNote | Credit note against invoice |
| Bill | Bill | AP bill from supplier |
| PaymentRun | PaymentRun | Batch payment execution |
| MatchRecord | MatchRecord | 3-way match record |
| RevenueSchedule | RevenueSchedule | Revenue recognition schedule |
| DeferredRevenue | DeferredRevenue | Deferred revenue balance |
| JournalEntry | JournalEntry | GL journal entry |
| Account | Account | Chart of accounts |
| CostCenter | CostCenter | Cost center for allocation |
| CashFlowEntry | CashFlowEntry | Cash flow transaction |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /budgets | GET/POST | List and create budgets |
| /budgets/:id/revision | POST | Create budget revision |
| /ar/invoices | GET/POST | List and create invoices |
| /ar/invoices/:id/send | POST | Send invoice to customer |
| /ar/invoices/:id/credit-note | POST | Issue credit note |
| /ap/bills | GET/POST | List and create bills |
| /ap/bills/:id/approve | POST | Approve bill for payment |
| /ap/payment-runs | GET/POST | Create payment run |
| /matching | GET/POST | List and create match records |
| /matching/:id/resolve | POST | Resolve match exception |
| /revenue/schedule | GET | Get revenue schedule |
| /gl/journal-entries | GET/POST | List and create journal entries |
| /gl/trial-balance | GET | Get trial balance |
| /costs/centers | GET/POST | List and create cost centers |
| /cash-flow/forecast | GET | Get cash flow forecast |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /financial/budgets | BudgetList, BudgetForm, BudgetVsActual | Budget management |
| /financial/ar/invoices | InvoiceList, InvoiceForm, AgingView | AR management |
| /financial/ap/bills | BillList, BillForm, AgingView | AP management |
| /financial/ap/payment-runs | PaymentRunForm, PaymentRunList | Payment processing |
| /financial/matching | MatchListView, ExceptionView | 3-way matching |
| /financial/revenue | RevenueScheduleView, RevenueRules | Revenue recognition |
| /financial/gl | JournalEntryForm, TrialBalanceView | General ledger |
| /financial/costs | CostCenterList, AllocationView | Cost management |
| /financial/cash-flow | CashFlowView, ForecastView | Cash flow management |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| BudgetForecastAI | Forecast budget utilization |
| PaymentPredictionAI | Predict payment timing |
| CashRequirementForecastAI | Forecast cash requirements |
| AutoMatchAI | Auto-match PO/invoice/receipt |
| RevenueForecastAI | Forecast revenue |
| AnomalyDetectionAI | Detect GL anomalies |
| CostPredictionAI | Predict cost overruns |
| CashFlowPredictionAI | Predict cash flow |

## Estimated Sprint Allocation: 5 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Procurement — Weak (PO → AP invoice)
- Project Delivery — Weak (project budgets)
- Commercial — Weak (contract → revenue)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 85%
- Playwright — E2E for invoice→payment flow
- Prisma — Schema validation
- SonarQube — Code quality gate
- OWASP — Security scanning (financial data)
