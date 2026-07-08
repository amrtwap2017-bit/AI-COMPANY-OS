# 04-SUPPLIER-MANAGEMENT — Permissions

| Permission | Action | Resource | Roles |
|------------|--------|----------|-------|
| supplier:register | Self-register | Supplier | SUPPLIER (external) |
| supplier:create | Create | Supplier | PROCUREMENT_OFFICER, PROCUREMENT_MANAGER |
| supplier:approve | Approve | Supplier | PROCUREMENT_MANAGER |
| supplier:suspend | Suspend/blacklist | Supplier | PROCUREMENT_MANAGER |
| supplier:read | View | Supplier | PROCUREMENT_OFFICER, PROCUREMENT_MANAGER |
| rate-card:manage | CRUD | Rate Card | PROCUREMENT_OFFICER, SUPPLIER |
| evaluation:create | Create | Evaluation | PROCUREMENT_OFFICER |
| evaluation:approve | Finalize | Evaluation | PROCUREMENT_MANAGER |
