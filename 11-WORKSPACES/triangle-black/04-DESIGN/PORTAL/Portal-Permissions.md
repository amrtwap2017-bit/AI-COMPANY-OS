# Portal Permissions

## Role Definitions

| Role | Level | Type | Description |
|------|-------|------|-------------|
| SUPER_ADMIN | 100 | Internal | Full system access, all tenants |
| ADMIN | 90 | Internal | System administration, configuration |
| MANAGER | 70 | Internal | Operational oversight, approvals |
| SALES_REP | 50 | Internal | Pipeline management, quotations |
| ENGINEER | 40 | Internal | Project execution, surveys |
| VIEWER | 30 | Internal | Read-only access |
| CLIENT_ADMIN | 20 | Client | Portal admin: approve quotations, view all |
| CLIENT_USER | 10 | Client | Portal user: view only, submit requests |

## Permission Matrix

### Module: Public Website
| Action | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | ENGINEER | VIEWER | CLIENT_ADMIN | CLIENT_USER |
|--------|-------------|-------|---------|-----------|----------|--------|--------------|-------------|
| View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### Module: CRM
| Action | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | ENGINEER | VIEWER | CLIENT_ADMIN | CLIENT_USER |
|--------|-------------|-------|---------|-----------|----------|--------|--------------|-------------|
| View Leads | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Create Lead | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Edit Lead | ✓ | ✓ | ✓ | Own | — | — | — | — |
| Delete Lead | ✓ | ✓ | — | — | — | — | — | — |
| View Opportunities | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Create Opp | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Edit Opp | ✓ | ✓ | ✓ | Own | — | — | — | — |
| Delete Opp | ✓ | ✓ | — | — | — | — | — | — |
| View Companies | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Create Company | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| View Contacts | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Create Contact | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Log Activity | ✓ | ✓ | ✓ | ✓ | — | — | — | — |

### Module: Quotations
| Action | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | ENGINEER | VIEWER | CLIENT_ADMIN | CLIENT_USER |
|--------|-------------|-------|---------|-----------|----------|--------|--------------|-------------|
| View RFQs | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — |
| Create RFQ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — |
| View Quotes | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| Create Quote | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Edit Quote | ✓ | ✓ | ✓ | Own | — | — | — | — |
| Approve Quote | ✓ | ✓ | ✓¹ | — | — | — | ✓² | — |
| Reject Quote | ✓ | ✓ | ✓¹ | — | — | — | ✓² | — |
| Delete Quote | ✓ | ✓ | — | — | — | — | — | — |
| Generate Contract | ✓ | ✓ | ✓ | — | — | — | — | — |
| View Contracts | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |

¹ MANAGER approves up to EGP 50,000; above requires ADMIN/SUPER_ADMIN (BR-QTN-05)
² CLIENT_ADMIN approves client-side; internal approval chain independent

### Module: Projects
| Action | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | ENGINEER | VIEWER | CLIENT_ADMIN | CLIENT_USER |
|--------|-------------|-------|---------|-----------|----------|--------|--------------|-------------|
| View Projects | ✓ | ✓ | ✓ | ✓ | Assigned | ✓ | ✓ | ✓ |
| Create Project | ✓ | ✓ | ✓ | — | — | — | — | — |
| Edit Project | ✓ | ✓ | ✓ | — | Assigned | — | — | — |
| Manage Milestones | ✓ | ✓ | ✓ | — | Assigned | — | — | — |
| Approve Milestone | ✓ | ✓ | ✓ | — | — | — | — | — |
| Upload Files | ✓ | ✓ | ✓ | — | ✓ | — | — | — |
| Download Files | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Site Survey | ✓ | ✓ | — | — | ✓ | — | — | — |
| Delete Project | ✓ | ✓ | — | — | — | — | — | — |

### Module: Client Portal
| Action | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | ENGINEER | VIEWER | CLIENT_ADMIN | CLIENT_USER |
|--------|-------------|-------|---------|-----------|----------|--------|--------------|-------------|
| Access Portal | — | — | — | — | — | — | ✓ | ✓ |
| View Dashboard | — | — | — | — | — | — | ✓ | ✓ |
| View Projects | — | — | — | — | — | — | ✓ | ✓ |
| View Quotes | — | — | — | — | — | — | ✓ | ✓ |
| Approve Quote | — | — | — | — | — | — | ✓ | — |
| View Documents | — | — | — | — | — | — | ✓ | ✓ |
| Submit Request | — | — | — | — | — | — | ✓ | ✓ |
| Manage Profile | — | — | — | — | — | — | ✓ | ✓ |

### Module: Administration
| Action | SUPER_ADMIN | ADMIN | MANAGER | SALES_REP | ENGINEER | VIEWER | CLIENT_ADMIN | CLIENT_USER |
|--------|-------------|-------|---------|-----------|----------|--------|--------------|-------------|
| Manage Users | ✓ | ✓ | — | — | — | — | — | — |
| Manage Roles | ✓ | ✓ | — | — | — | — | — | — |
| Manage Tenants | ✓ | ✓ | — | — | — | — | — | — |
| View Audit Log | ✓ | ✓ | — | — | — | — | — | — |
| System Settings | ✓ | ✓ | — | — | — | — | — | — |

## Permission Enforcement Points

| Layer | Enforcement | Mechanism |
|-------|-------------|-----------|
| API | Authorization guard | @Roles decorator checks user role against endpoint requirements |
| UI | Conditional rendering | Navigation items hidden/shown based on user.role |
| Data | Query filtering | Tenant ID filter on all queries; ownership filter on assigned entities |
| Client Portal | Tenant isolation | JWT contains tenant_id; all queries scoped to tenant |

## Role Inheritance

```
SUPER_ADMIN (100) → inherits all
    ↓
ADMIN (90) → inherits all below
    ↓
MANAGER (70) → inherits SALES_REP + ENGINEER + VIEWER
    ↓
SALES_REP (50) → inherits VIEWER
    ↓
ENGINEER (40) → inherits VIEWER
    ↓
VIEWER (30) → read-only
    ↓
CLIENT_ADMIN (20) → inherits CLIENT_USER
    ↓
CLIENT_USER (10) → client read-only
```

## Permission Verification

| ID | Rule | Implementation |
|----|------|---------------|
| PERM-001 | Role hierarchy enforced | Permission check compares user role level to required level |
| PERM-002 | Own-data access | SALES_REP can edit own leads/opportunities only |
| PERM-003 | Tenant isolation | All queries include tenant_id filter |
| PERM-004 | Client admin approval | Approval action checks for CLIENT_ADMIN role |
| PERM-005 | Admin exclusion | Manager and below cannot access /app/admin/* routes |
| PERM-006 | Engineer project access | Only assigned projects visible |
