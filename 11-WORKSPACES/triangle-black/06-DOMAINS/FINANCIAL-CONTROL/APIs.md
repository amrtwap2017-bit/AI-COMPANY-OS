# 06-FINANCIAL-CONTROL — API Endpoints

```
POST   /api/v1/finance/invoices               — Create invoice
GET    /api/v1/finance/invoices               — List
GET    /api/v1/finance/invoices/:id           — Detail
POST   /api/v1/finance/invoices/:id/send     — Send to client
POST   /api/v1/finance/invoices/:id/pay      — Record payment
POST   /api/v1/finance/invoices/:id/credit   — Create credit note
GET    /api/v1/finance/invoices/aging         — AR aging report
POST   /api/v1/finance/supplier-invoices     — Enter supplier invoice
GET    /api/v1/finance/supplier-invoices     — List
POST   /api/v1/finance/supplier-invoices/:id/match  — Run 3-way match
GET    /api/v1/finance/revenue/project/:id   — Project revenue & costs
GET    /api/v1/finance/revenue/recognized    — Revenue recognized (period)
GET    /api/v1/finance/gl/trial-balance      — Trial balance
GET    /api/v1/finance/gl/entries            — Journal entries
```
