# 06-FINANCIAL-CONTROL — Notifications

| Event | Recipient | Channel | Message |
|-------|-----------|---------|---------|
| Invoice sent | Client | Email | "Invoice {number} from Triangle Black" |
| Invoice overdue (7d) | Client | Email | "Reminder: Invoice {number} due in 7 days" |
| Invoice overdue (30d) | Finance Manager | In-app | "Invoice {number} is 30 days overdue" |
| Invoice overdue (60d) | Management | In-app | "Escalation: Invoice {number} is 60+ days overdue" |
| Payment received | Finance Clerk | In-app | "Payment received for invoice {number}" |
| Supplier invoice matched | Finance Clerk | In-app | "3-way match complete for PO {number}" |
| Supplier invoice due (7d) | Finance Clerk | In-app | "Supplier invoice {number} due in 7 days" |
