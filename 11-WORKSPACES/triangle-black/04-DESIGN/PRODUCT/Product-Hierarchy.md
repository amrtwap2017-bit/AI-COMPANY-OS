# Product Hierarchy

## Ecosystem Overview

```
Triangle Black Digital Operations Ecosystem
│
├── PORTAL: Public Website
│   ├── MODULE: Marketing Site
│   │   ├── FEATURE: Company Profile
│   │   ├── FEATURE: Services Catalog
│   │   ├── FEATURE: Case Studies
│   │   ├── FEATURE: Blog
│   │   └── FEATURE: Contact & Lead Capture
│   └── Shared: SEO, Analytics, Cookie Consent
│
├── PORTAL: Operations Portal (Internal Staff)
│   ├── MODULE: CRM
│   │   ├── FEATURE: Lead Management
│   │   ├── FEATURE: Opportunity Pipeline
│   │   ├── FEATURE: Company Records
│   │   ├── FEATURE: Contact Management
│   │   └── FEATURE: Activity Logging
│   ├── MODULE: Quotations
│   │   ├── FEATURE: RFQ Management
│   │   ├── FEATURE: Quotation Builder
│   │   ├── FEATURE: Approval Workflow
│   │   ├── FEATURE: PDF Generation
│   │   ├── FEATURE: Contract Generation
│   │   └── FEATURE: Revision History
│   ├── MODULE: Projects
│   │   ├── FEATURE: Project Setup
│   │   ├── FEATURE: Milestone Tracking
│   │   ├── FEATURE: Deliverable Management
│   │   ├── FEATURE: File Repository
│   │   ├── FEATURE: Site Survey
│   │   └── FEATURE: Engineering Assessment
│   ├── MODULE: Procurement (V2)
│   │   ├── FEATURE: Purchase Requisitions
│   │   ├── FEATURE: Supplier Management
│   │   ├── FEATURE: RFQ & Vendor Selection
│   │   ├── FEATURE: Purchase Orders
│   │   ├── FEATURE: Goods Receipt
│   │   └── FEATURE: Inventory (V2)
│   ├── MODULE: Maintenance (V2)
│   │   ├── FEATURE: Asset Registry
│   │   ├── FEATURE: Work Order Management
│   │   ├── FEATURE: Preventive Scheduling
│   │   └── FEATURE: Spare Parts
│   └── MODULE: Administration
│       ├── FEATURE: User Management
│       ├── FEATURE: Role & Permissions
│       ├── FEATURE: Company / Tenant Config
│       ├── FEATURE: System Settings
│       └── FEATURE: Audit Log
│
├── PORTAL: Executive Dashboard
│   ├── MODULE: Business Intelligence
│   │   ├── FEATURE: Pipeline Health
│   │   ├── FEATURE: Revenue Tracking
│   │   ├── FEATURE: Project Health
│   │   ├── FEATURE: Team Workload
│   │   ├── FEATURE: Client Health
│   │   └── FEATURE: KPI Cards
│   └── MODULE: Reporting
│       ├── FEATURE: Sales Reports
│       ├── FEATURE: Project Reports
│       ├── FEATURE: Financial Reports
│       └── FEATURE: Export & Scheduling
│
├── PORTAL: Client Portal
│   ├── MODULE: Client Dashboard
│   │   ├── FEATURE: Project Progress View
│   │   ├── FEATURE: Quotation Review
│   │   ├── FEATURE: Document Access
│   │   ├── FEATURE: Invoice View
│   │   ├── FEATURE: Service Requests
│   │   └── FEATURE: Notifications
│   └── Shared: Authentication, Profile, Preferences
│
└── CROSS-CUTTING
    ├── Authentication & Authorization (RBAC)
    ├── Notification Engine (Email + In-App)
    ├── Document Management
    ├── Audit Logging
    └── Multi-Tenancy Infrastructure
```

## Hierarchy Rules

| Level | Definition | Example |
|-------|------------|---------|
| **Ecosystem** | The complete digital platform | Triangle Black Digital Operations Ecosystem |
| **Portal** | A distinct user-facing application with its own navigation and authentication | Operations Portal, Client Portal |
| **Module** | A functional domain grouping within a portal | CRM, Quotations, Projects |
| **Feature** | A specific user-capability within a module | Lead Management, Quotation Builder |
| **Component** | A reusable UI element shared across features | DataTable, StatusBadge, FileUploader |

## V1 Scope (Frozen)

| Portal | Modules in V1 | Modules in V2+ |
|--------|---------------|----------------|
| Public Website | Marketing Site | — |
| Operations Portal | CRM, Quotations, Projects, Administration | Procurement, Maintenance |
| Executive Dashboard | Business Intelligence | Reporting (advanced) |
| Client Portal | Client Dashboard | Multi-property portfolio |
| Cross-cutting | Auth, Notifications, Documents, Audit | AI Agents, Public API |
