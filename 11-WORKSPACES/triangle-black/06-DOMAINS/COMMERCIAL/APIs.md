# 01-COMMERCIAL — API Endpoints

## Leads
```
POST   /api/v1/crm/leads                    — Create lead
GET    /api/v1/crm/leads                    — List (paginated, filterable)
GET    /api/v1/crm/leads/:id                — Get with timeline
PATCH  /api/v1/crm/leads/:id                — Update
DELETE /api/v1/crm/leads/:id                — Soft delete
POST   /api/v1/crm/leads/:id/convert        — Convert to opportunity
POST   /api/v1/crm/leads/bulk/assign        — Bulk assign
GET    /api/v1/crm/leads/stats              — Pipeline stats
```

## Opportunities
```
POST   /api/v1/crm/opportunities              — Create
GET    /api/v1/crm/opportunities              — List (pipeline view)
GET    /api/v1/crm/opportunities/:id          — Get with relations
PATCH  /api/v1/crm/opportunities/:id          — Update stage/value
DELETE /api/v1/crm/opportunities/:id          — Soft delete
GET    /api/v1/crm/opportunities/forecast     — Pipeline forecast
GET    /api/v1/crm/opportunities/win-loss     — Win/loss analysis
```

## Companies
```
POST   /api/v1/crm/companies                 — Create
GET    /api/v1/crm/companies                 — List
GET    /api/v1/crm/companies/:id             — Get with contacts + opps
PATCH  /api/v1/crm/companies/:id             — Update
DELETE /api/v1/crm/companies/:id             — Soft delete
```

## Site Surveys
```
POST   /api/v1/surveys                       — Create (schedule)
GET    /api/v1/surveys                       — List
GET    /api/v1/surveys/:id                   — Get with findings
PATCH  /api/v1/surveys/:id                   — Update findings
POST   /api/v1/surveys/:id/submit            — Submit for approval
POST   /api/v1/surveys/:id/approve           — Approve
POST   /api/v1/surveys/:id/reject            — Reject
POST   /api/v1/surveys/:id/photos            — Upload photos
```

## Quotations
```
POST   /api/v1/quotations                    — Create from opportunity
GET    /api/v1/quotations                    — List
GET    /api/v1/quotations/:id                — Get with line items
PATCH  /api/v1/quotations/:id                — Update (draft only)
POST   /api/v1/quotations/:id/submit         — Submit for approval
POST   /api/v1/quotations/:id/approve        — Internal approve
POST   /api/v1/quotations/:id/reject         — Internal reject
POST   /api/v1/quotations/:id/send           — Send to client
POST   /api/v1/quotations/:id/client-approve — Client approves
POST   /api/v1/quotations/:id/client-reject  — Client rejects
POST   /api/v1/quotations/:id/clone          — Create revision
GET    /api/v1/quotations/:id/pdf            — Download PDF
```

## Contracts
```
POST   /api/v1/contracts                     — Create from quotation
GET    /api/v1/contracts                     — List
GET    /api/v1/contracts/:id                 — Get with details
PATCH  /api/v1/contracts/:id                 — Update
POST   /api/v1/contracts/:id/sign            — Sign
POST   /api/v1/contracts/:id/activate        — Activate
POST   /api/v1/contracts/:id/terminate       — Terminate
POST   /api/v1/contracts/:id/variation       — Create variation order
```
