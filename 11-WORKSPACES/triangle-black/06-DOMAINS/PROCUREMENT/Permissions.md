# 03-PROCUREMENT — Permissions

| Permission | Action | Resource | Roles |
|------------|--------|----------|-------|
| requisition:create | Create | Requisition | SITE_ENGINEER, PROJECT_MANAGER |
| requisition:approve | Approve | Requisition | PROJECT_MANAGER, PROCUREMENT_MANAGER |
| po:create | Create | PO | PROCUREMENT_OFFICER, PROCUREMENT_MANAGER |
| po:approve | Approve | PO | PROCUREMENT_MANAGER, FINANCE_CONTROLLER |
| po:send | Send | PO | PROCUREMENT_OFFICER |
| goods:receive | Receive | Goods Receipt | STOREKEEPER |
| goods:inspect | Inspect | Goods Receipt | STOREKEEPER, QUALITY_INSPECTOR |
