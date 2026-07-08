# 06-FINANCIAL-CONTROL — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| invoice.sent | Invoice sent to client | AR aging starts |
| invoice.paid | Payment received | Revenue recognition, project P&L update |
| invoice.overdue | Past due date | Notification workflow |
| supplier_invoice.matched | 3-way match complete | Payment scheduling |
| supplier_invoice.paid | Payment executed | PO status update, budget consumed |
| revenue.recognized | Payment received | GL entry, project profitability update |
