# 05-INVENTORY — Notifications

| Event | Recipient | Channel | Message |
|-------|-----------|---------|---------|
| Low stock alert | Storekeeper, Procurement | In-app, Email | "{item} below minimum level ({qty} remaining)" |
| Stock adjustment | Inventory Manager | In-app | "Adjustment requested: {item} ({qty}) — {reason}" |
| Transfer completed | Both warehouses | In-app | "Transfer {item} ({qty}) from {from} to {to}" |
