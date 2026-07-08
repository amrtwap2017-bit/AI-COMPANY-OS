# Client Portal

## Identity

| Field | Value |
|-------|-------|
| URL | portal.triangleblack.com |
| Purpose | Client transparency: project visibility, quotation approval, document access, service requests |
| Tone | Transparent, professional, supportive |
| Primary Action | Review project progress, approve quotations |

## User Roles & Access

| Role | Access | Description |
|------|--------|-------------|
| Client Admin | Full client portal | Hotel GM, owner, procurement manager — can approve quotations |
| Client User | Limited client portal | Chief Engineer, technical staff — view-only, no approval |

## Navigation

```
[Triangle Black Logo]  [Dashboard]  [Projects]  [Quotations]  [Documents]  [Requests]  [👤 Name ▾]
```

## Key Pages

| Page | URL | Components | Business Rules |
|------|-----|-----------|----------------|
| Dashboard | /portal | KpiCard (Active Projects, Pending Quotes, Open Requests), RecentActivity, QuickActions | BR-POR-01 (data isolation) |
| Project List | /portal/projects | DataTable, StatusBadge, ProgressBar | BR-POR-01 |
| Project Detail | /portal/projects/:id | ProjectHeader, Timeline, MilestoneList, FileList | BR-POR-01 |
| Quotation List | /portal/quotations | DataTable, StatusBadge | BR-POR-01 |
| Quotation Detail | /portal/quotations/:id | QuotationPreview, ApprovalPanel (Client Admin only) | BR-POR-04 (approval rights) |
| Documents | /portal/documents | DocumentGrid, FilterBar, SearchBar | BR-POR-03 (role-based docs) |
| Requests | /portal/requests | RequestList, StatusBadge | — |
| New Request | /portal/requests/new | RequestForm, FileUploader | BR-POR-07 (auto-acknowledge) |
| Profile | /portal/profile | ProfileForm, NotificationPreferences | — |

## Client Dashboard Widgets

| Widget | Data Source | Refresh |
|--------|-------------|---------|
| Active Projects (count) | Projects module | On page load |
| Pending Quotations (count) | Quotations module | On page load |
| Open Requests (count) | Service requests | On page load |
| Recent Activity | Activity log | On page load |
| Upcoming Milestones | Project milestones | On page load |
| Quick Actions | Static links | Static |

## Quotation Approval Flow

```
Client logs in → Dashboard shows pending quote badge
        │
        ▼
Clicks Quotations → List view (sorted by date)
        │
        ▼
Opens quotation detail → Line items, terms, total
        │
        ▼
Client Admin sees [Approve] and [Request Revision] buttons
        │
        ├── Approve → Confirm dialog → Status changes to "Client Approved"
        │             → Notification to Triangle Black sales team
        │
        └── Request Revision → Comment form → Status changes to "Revision Requested"
                              → Notification to Triangle Black sales team
```

## Service Request Flow

```
Client navigates to Requests > New Request
        │
        ▼
Selects type: [Maintenance, Procurement, General Inquiry, Emergency]
        │
        ▼
Fills form: Subject, Description, Priority, Attachments
        │
        ▼
Submits → Auto-acknowledgment (BR-POR-07)
        │
        ▼
Creates internal notification → Assigned by operations team
        │
        ▼
Status updates visible in Requests list
```

## Multi-Tenant Isolation

| Rule | Implementation |
|------|---------------|
| Client sees ONLY their data | Tenant context extracted from JWT |
| No cross-tenant data access | All queries filter by tenant_id |
| Document visibility by role | Client Admin > Client User permission set |
| Quotation approval limited | Only Client Admin role can approve |

## Out of Scope (V1)

| Item | Rationale | Target |
|------|-----------|--------|
| Real-time chat | Email/phone sufficient for V1 | V2 |
| Payment processing | Check/invoice payment works | V2 |
| Multi-property portfolio | Single hotel focus in V1 | V2 |
| Mobile app (native) | Responsive web sufficient | V2 |
