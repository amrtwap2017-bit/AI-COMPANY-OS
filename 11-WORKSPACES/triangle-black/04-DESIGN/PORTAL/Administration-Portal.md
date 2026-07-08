# Administration Portal

## Identity

| Field | Value |
|-------|-------|
| URL | app.triangleblack.com/admin |
| Purpose | System configuration: users, roles, tenants, settings, audit |
| Tone | Functional, precise, compliance-oriented |
| Access | Admin role only (Super Admin for user management) |

## Navigation

```
Administration
├── Users           — User CRUD with role assignment
├── Roles           — Role definition with permission matrix
├── Companies       — Tenant/company management
├── Settings        — System-wide configuration
└── Audit Log       — Searchable audit trail
```

## Key Pages

### User Management

| Field | Detail |
|-------|--------|
| List Columns | Name, Email, Role, Company, Last Login, Status |
| Create Fields | Name, Email, Password (auto-generate option), Role, Company, Status |
| Edit | Change role, deactivate, reset password |
| Rules | BR-ADM-01 (role hierarchy), BR-ADM-02 (min 2 admins), BR-ADM-03 (no self-deactivation), BR-ADM-07 (email uniqueness) |
| Search | By name, email, role, company |

### Role & Permission Management

| Field | Detail |
|-------|--------|
| List Columns | Role Name, User Count, Permissions Count |
| Create Fields | Name, Description, Permission set |
| Permission UI | Permission tree: Module → Action (Create, Read, Update, Delete, Approve) |
| Rules | BR-ADM-01 (hierarchy: Admin > Manager > Client Admin > Client User) |

### Company/Tenant Management

| Field | Detail |
|-------|--------|
| List Columns | Company Name, Slug, Status, User Count, Created |
| Create Fields | Name, Slug, Domain, Status, Default Currency, Timezone |
| Config | Branding (logo, colors), Default settings per tenant |

### System Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Default Currency | Select | EGP | System-wide currency |
| Tax Rate | Decimal | 14% | Default VAT rate |
| Date Format | Select | DD/MM/YYYY | Display format |
| Timezone | Select | Africa/Cairo | Default timezone |
| Quote Validity | Number | 30 | Quotation validity in days |
| Approval Thresholds | JSON | 50k/200k EGP | Approval limits |

### Audit Log

| Field | Detail |
|-------|--------|
| Columns | Timestamp, User, Action, Entity, Entity ID, IP Address |
| Filters | Date range, User, Action type, Entity type |
| Retention | 365 days (BR-ADM-04) |
| Export | CSV export of filtered results |

## Business Rules Enforced

| Rule | Implementation |
|------|---------------|
| BR-ADM-01 | Role dropdown filtered by hierarchy; Admin can assign any role below Admin |
| BR-ADM-02 | Deactivation blocked if it would leave < 2 active admins |
| BR-ADM-03 | "Deactivate" button hidden on own user record |
| BR-ADM-04 | Audit log UI never shows delete option; archive after 365 days |
| BR-ADM-05 | Password policy validated on create and reset |
| BR-ADM-06 | Password history stored in user preferences |
| BR-ADM-07 | Email uniqueness enforced by database constraint + API check |
| BR-ADM-08 | Tenant isolation on all data queries |
