# Domain Map

## Bounded Contexts

```
┌─────────────────────────────────────────────────────────────┐
│                  SHARED KERNEL (00)                          │
│  Master Data · Enums · Value Objects · Shared Events        │
│  Policies · Validation · Notifications · Reports            │
└─────────────────────────────────────────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   COMMERCIAL    │  │ PROJECT DELIVERY │  │   PROCUREMENT    │
│   (01)          │  │ (02)             │  │ (03)             │
│                 │  │                  │  │                  │
│ Leads           │  │ Projects         │  │ Purchase Requests│
│ Accounts        │  │ Milestones       │  │ RFQ              │
│ Contacts        │  │ Tasks            │  │ Supplier Compare │
│ Opportunities   │  │ Engineering      │  │ Purchase Orders  │
│ Site Surveys    │  │ Site Execution   │  │ Goods Receipt    │
│ Quotations      │  │ Variations       │  │ Returns          │
│ Contracts       │  │ Quality Control  │  │ Analytics        │
│ Customer Portal │  │ Close-Out        │  │ Spend Control    │
└────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    SUPPLIERS    │  │    INVENTORY     │  │ FINANCIAL CONTROL│
│    (04)         │  │    (05)          │  │    (06)          │
│                 │  │                  │  │                  │
│ Suppliers       │  │ Warehouses       │  │ Budgets          │
│ Qualification   │  │ Stock            │  │ Cost Control     │
│ Categories      │  │ Transfers        │  │ Invoices         │
│ Performance     │  │ Reservations     │  │ Payments         │
│ Compliance      │  │ Consumption      │  │ Revenue          │
│ Certificates    │  │ Adjustments      │  │ Profitability    │
│ Agreements      │  │ Cycle Count      │  │ Cashflow         │
│ Preferred       │  │ Analytics        │  │ Reports          │
└────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   MAINTENANCE   │  │ DOCUMENT MGMT    │  │   EXECUTIVE      │
│   (07)          │  │ (08)             │  │   INTELLIGENCE   │
│                 │  │                  │  │   (09)           │
│ Assets          │  │ Library          │  │                  │
│ Preventive      │  │ Templates        │  │ Dashboards       │
│ Corrective      │  │ Versioning       │  │ Operations       │
│ Work Orders     │  │ Approvals        │  │ Commercial       │
│ Checklists      │  │ Attachments      │  │ Procurement      │
│ Service History │  │ Metadata         │  │ Financial        │
│ SLA             │  │ OCR (future)     │  │ Engineering      │
│ Reports         │  │ Digital Sig      │  │ KPIs             │
└─────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   AI COPILOTS   │  │  INTEGRATIONS    │  │     MOBILE       │
│   (10)          │  │  (11)            │  │     (12)         │
│                 │  │                  │  │                  │
│ Executive       │  │ Accounting       │  │ Offline          │
│ Sales           │  │ Hotel PMS        │  │ Camera           │
│ Procurement     │  │ ERP              │  │ GPS              │
│ Engineering     │  │ Maps             │  │ Barcode          │
│ Projects        │  │ Email            │  │ QR               │
│ Suppliers       │  │ Messaging        │  │ Push             │
│ Knowledge       │  │ Payments         │  │ Sync             │
│ Maintenance     │  │ Future           │  │ Device Mgmt      │
└─────────────────┘  └──────────────────┘  └──────────────────┘
          │
          ▼
┌──────────────────┐
│ HUMAN RESOURCES  │
│   (13)           │
│                  │
│ Employees        │
│ Departments      │
│ Leave            │
│ Timesheets       │
│ Attendance       │
│ Payroll (V2)     │
│ Recruitment (V2) │
│ Performance (V2) │
└──────────────────┘
```

## Dependency Flow

```
No domain depends on a domain to its right or below.
Data flows left-to-right, top-to-bottom.
```

## Strategic Design

| Domain | Type | Priority |
|--------|------|----------|
| 00 Shared Kernel | Core | Critical |
| 01 Commercial | Core | Revenue |
| 02 Project Delivery | Core | Revenue |
| 03 Procurement | Supporting | Cost |
| 04 Supplier Management | Supporting | Cost |
| 05 Inventory | Supporting | Cost |
| 06 Financial Control | Core | Margin |
| 07 Maintenance | Supporting | Retention |
| 08 Document Management | Generic | All |
| 09 Executive Intelligence | Core | Decision |
| 10 AI Copilots | Enhancement | Future |
| 11 Integrations | Generic | Future |
| 12 Mobile | Supporting | Field |
| 13 Human Resources | Supporting | People |
