# Phase 03 — Portal Architecture

> Multi-tenant portal architecture for Triangle Black.

## Portal Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    PORTAL APPLICATION                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Public Area  │  │   Auth Area  │  │  App Dashboard │     │
│  │  (Landing,    │  │  (Login,     │  │  (All Business │     │
│  │   Pricing,    │  │   Register,  │  │   Functions)   │     │
│  │   Docs)       │  │   Reset)     │  │                │     │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├──────────────────────────────────────────────────────────────┤
│                    TENANT ROUTING                             │
│  Subdomain: {tenant}.triangleblack.com                        │
│  Schema resolution at connection time                         │
├──────────────────────────────────────────────────────────────┤
│                    DOMAIN SHELL                               │
│  Navigation │ Tenant Switcher │ Profile │ Notifications      │
└──────────────────────────────────────────────────────────────┘
```

## Navigation Structure

```
Dashboard
├── Commercial
│   ├── Leads
│   ├── Opportunities
│   ├── Site Surveys
│   ├── Quotations
│   └── Contracts
├── Projects
│   ├── Active Projects
│   ├── Milestones
│   ├── NCRs
│   └── Handover
├── Procurement
│   ├── Requisitions
│   ├── Purchase Orders
│   └── Goods Receipt
├── Inventory
│   ├── Stock
│   ├── Warehouses
│   └── Transfers
├── Financial
│   ├── Invoices
│   ├── Revenue
│   ├── 3-Way Match
│   └── Reports
├── Maintenance
│   ├── Service Requests
│   └── Contracts
├── Reports
│   ├── Dashboards
│   └── Custom Reports
└── Settings
    ├── Users & Roles
    ├── Company Profile
    └── Integrations
```

## Page Types

| Type | Description | Examples |
|------|-------------|----------|
| List | Tabular view with filters, search, actions | Lead List, Project List |
| Detail | Single entity view with related information | Lead Detail, Project Detail |
| Form | Data entry with validation | Lead Create, Quotation Builder |
| Dashboard | Aggregated KPIs and charts | Executive Dashboard |
| Wizard | Multi-step process | Quotation Approval, UAT |

See `04-Portal/` and `12-Frontend/` for detailed specifications.
