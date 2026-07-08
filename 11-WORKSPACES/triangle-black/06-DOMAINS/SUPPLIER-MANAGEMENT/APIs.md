# 04-SUPPLIER-MANAGEMENT — API Endpoints

```
POST   /api/v1/suppliers                     — Register supplier
GET    /api/v1/suppliers                     — List (filterable by status, tier, category)
GET    /api/v1/suppliers/:id                 — Detail with docs, rate cards
PATCH  /api/v1/suppliers/:id                 — Update
POST   /api/v1/suppliers/:id/approve        — Approve supplier
POST   /api/v1/suppliers/:id/suspend        — Suspend
POST   /api/v1/suppliers/:id/blacklist      — Blacklist
POST   /api/v1/suppliers/:id/documents      — Upload document
DELETE /api/v1/suppliers/:id/documents/:d    — Remove document
GET    /api/v1/suppliers/:id/rate-cards     — Rate cards
POST   /api/v1/suppliers/:id/rate-cards     — Add rate card item
POST   /api/v1/suppliers/:id/evaluations    — Create evaluation
GET    /api/v1/suppliers/:id/evaluations    — Evaluation history
```
