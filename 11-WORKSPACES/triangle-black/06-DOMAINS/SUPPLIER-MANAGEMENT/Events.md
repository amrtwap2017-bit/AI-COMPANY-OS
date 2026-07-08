# 04-SUPPLIER-MANAGEMENT — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| supplier.registered | Supplier self-registers | NotificationService (procurement team) |
| supplier.approved | Supplier approved | NotificationService (supplier email), PO module (enable) |
| supplier.suspended | Supplier suspended | NotificationService, PO module (block new POs) |
| supplier.blacklisted | Supplier blacklisted | PO module (block all), NotificationService |
| supplier.evaluated | Evaluation finalized | Supplier score updated, tier may change |
