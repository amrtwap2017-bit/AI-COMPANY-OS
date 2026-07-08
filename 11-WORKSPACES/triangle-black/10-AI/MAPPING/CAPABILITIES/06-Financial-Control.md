# 06-Financial-Control — Capability Mapping

## Invoice Generation (AR-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Medium |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | Medium |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Invoice, InvoiceLineItem, InvoiceStatus, Contract, Milestone
**Dependencies:** Commercial (CTR-02), Project Delivery (PRJ-02)

## Invoice Lifecycle (AR-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Medium |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | High |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | Medium |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Invoice, InvoiceStatus, OverdueInvoice, InvoiceAging, DunningLetter
**Dependencies:** Invoice Generation (AR-01), Shared Kernel (SK-03, SK-05)

## Payment Tracking (AR-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | High |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Medium |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | High |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | Medium |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Payment, PaymentMethod, PaymentReference, AR_Aging, BankDeposit
**Dependencies:** Invoice Lifecycle (AR-02), Integrations (INT-02)

## Credit Notes (AR-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Low |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | Medium |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | Medium |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | Low |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | No | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** CreditNote, CreditNoteLine, Invoice, CreditReason, Refund
**Dependencies:** Invoice Lifecycle (AR-02)

## Supplier Invoice Matching (AP-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Medium |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | High |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | High |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** SupplierInvoice, MatchResult, PurchaseOrder, GoodsReceipt, MatchException
**Dependencies:** Procurement (PO-04, GR-01), Shared Kernel (SK-03, SK-08)

## Payment Scheduling (AP-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Medium |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | High |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | Medium |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** SupplierInvoice, PaymentSchedule, DueDate, PaymentTerm, AP_Aging
**Dependencies:** Supplier Invoice Matching (AP-01)

## Payment Execution (AP-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Low |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | High |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | Medium |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | No | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Payment, PaymentMethod, BankTransaction, PaymentStatus, Reconciliation
**Dependencies:** Payment Scheduling (AP-02), Integrations (INT-02)

## Revenue Recognition (REV-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Low |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | Medium |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | Medium |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Revenue, RevenueLine, RecognitionMethod, Milestone, PercentageOfCompletion
**Dependencies:** Invoice Generation (AR-01), Project Delivery (PRJ-02, PRJ-03)

## Deferred Revenue (REV-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | Medium |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Low |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | No | Low |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | No | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** DeferredRevenue, AmortizationSchedule, RevenueSchedule, Contract
**Dependencies:** Revenue Recognition (REV-01), GL (GL-01)

## Project P&L (PA-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | High |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | High |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | Medium |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | Yes | Medium |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | High |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, RevenueSummary, CostSummary, ProfitMargin, PnLReport
**Dependencies:** Cost Allocation (PA-02), Revenue Recognition (REV-01), Project Delivery (PRJ-01)

## Cost Allocation (PA-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Medium |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | No | Low |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | High |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | Yes | Medium |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** CostAllocation, CostCategory, AllocationRule, CostCenter, ProjectCost
**Dependencies:** Project Delivery (TIM-01, RES-01), Procurement (PO-04), Inventory (INV-02)

## Chart of Accounts (GL-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | Medium |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | Low |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | No | Low |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | No | Low |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | No | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Account, AccountType, AccountCategory, AccountCode, ChartOfAccounts
**Dependencies:** Shared Kernel (SK-01, SK-02, SK-07)

## Journal Entries (GL-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | High |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Medium |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | High |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | No | Low |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | No | Low |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | No | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** JournalEntry, JournalLine, Debit, Credit, AccountingPeriod
**Dependencies:** Chart of Accounts (GL-01), Shared Kernel (SK-08)

## Trial Balance (GL-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 06-FINANCIAL-CONTROL/Business-Overview.md | Yes | High |
| Business Capabilities | 06-FINANCIAL-CONTROL/Business-Capabilities.md | Yes | High |
| Workflows | 06-FINANCIAL-CONTROL/Workflows.md | Yes | Medium |
| Business Rules | 06-FINANCIAL-CONTROL/Business-Rules.md | Yes | High |
| Roles | 06-FINANCIAL-CONTROL/Roles.md | Yes | High |
| Permissions | 06-FINANCIAL-CONTROL/Permissions.md | Yes | High |
| Screens | 06-FINANCIAL-CONTROL/Screens.md | Yes | Low |
| Components | 06-FINANCIAL-CONTROL/Components.md | Yes | Low |
| Database | 06-FINANCIAL-CONTROL/Database.md | Yes | High |
| APIs | 06-FINANCIAL-CONTROL/APIs.md | Yes | High |
| Events | 06-FINANCIAL-CONTROL/Events.md | Yes | Low |
| Notifications | 06-FINANCIAL-CONTROL/Notifications.md | No | Low |
| Reports | 06-FINANCIAL-CONTROL/Reports.md | Yes | High |
| KPIs | 06-FINANCIAL-CONTROL/KPIs.md | Yes | Medium |
| AI Opportunities | 06-FINANCIAL-CONTROL/AI-Opportunities.md | No | Low |
| Testing | 06-FINANCIAL-CONTROL/Testing.md | Yes | High |
| Acceptance Criteria | 06-FINANCIAL-CONTROL/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** TrialBalance, AccountBalance, Period, DebitTotal, CreditTotal
**Dependencies:** Journal Entries (GL-02)
