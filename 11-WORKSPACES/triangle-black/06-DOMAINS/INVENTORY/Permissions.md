# 05-INVENTORY — Permissions

| Permission | Action | Roles |
|------------|--------|-------|
| inventory:receive | Stock in | STOREKEEPER, INVENTORY_MANAGER |
| inventory:issue | Stock out | STOREKEEPER, PROJECT_MANAGER |
| inventory:transfer | Transfer | STOREKEEPER |
| inventory:adjust | Adjust | STOREKEEPER*, INVENTORY_MANAGER *with approval |
| inventory:read | View | All inventory roles |
| inventory:configure | Settings | INVENTORY_MANAGER |
