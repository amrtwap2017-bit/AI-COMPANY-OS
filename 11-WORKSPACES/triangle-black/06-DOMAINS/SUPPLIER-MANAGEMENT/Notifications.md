# 04-SUPPLIER-MANAGEMENT — Notifications

| Event | Recipient | Message |
|-------|-----------|---------|
| Supplier registered | Procurement | "New supplier registration: {name}" |
| Supplier approved | Supplier | "Your registration with Triangle Black is approved" |
| Supplier rejected | Supplier | "Your registration has been reviewed and not approved" |
| Document expiring (30d) | Procurement, Supplier | "Document {type} for {supplier} expires in 30 days" |
| Evaluation completed | Supplier | "Your Q{period} evaluation score: {score}" |
