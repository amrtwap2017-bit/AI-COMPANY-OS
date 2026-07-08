---
ID: 08-UX-02
Title: Information Architecture
Purpose: Define site structure, navigation hierarchy, and sitemap
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Information Architecture

## Site Structure Overview

The Triangle Black platform has two distinct surfaces:
1. **Public Website** — Unauthenticated, marketing-focused
2. **Application** — Authenticated, role-based, includes Portal + Dashboard + Admin

## Public Website Structure

```
Home (/)
├── Services (/services)
│   ├── Engineering Supply
│   ├── Engineering Contracting
│   ├── Design Services
│   ├── Project Management
│   └── Operational Partnership
├── About (/about)
│   ├── Company
│   └── Team
├── Case Studies (/case-studies)
│   └── [Case Study Detail] (/case-studies/:slug)
├── Blog (/blog)
│   └── [Post] (/blog/:slug)
├── Contact (/contact)
├── Privacy Policy (/privacy)
└── Terms of Service (/terms)
```

## Application Structure (Authenticated)

### A. Internal Application (Triangle Black Staff)

```
/app/dashboard                    — Executive Dashboard
/app/crm                          — CRM Root
├── /app/crm/leads                — Lead list + detail
├── /app/crm/opportunities        — Pipeline view + detail
├── /app/crm/companies            — Company list + detail
└── /app/crm/contacts             — Contact list + detail
/app/quotations                   — Quotations Root
├── /app/quotations/rfqs          — RFQ list + detail
├── /app/quotations/quotes        — Quotation list + detail
└── /app/quotations/contracts     — Contract list + detail
/app/projects                     — Projects Root
├── /app/projects/list            — Project list
└── /app/projects/:id             — Project detail (milestones, files, timeline)
/app/admin                        — Administration Root
├── /app/admin/users              — User management
├── /app/admin/roles              — Role management
├── /app/admin/companies          — Company/tenant management
├── /app/admin/settings           — System settings
└── /app/admin/audit              — Audit log
```

### B. Client Portal (Hotel Client Users)

```
/portal                           — Portal Dashboard
├── /portal/projects              — Project list
│   └── /portal/projects/:id      — Project detail
├── /portal/quotations            — Quotation list
│   └── /portal/quotations/:id    — Quotation detail + approve/reject
├── /portal/documents             — Document repository
├── /portal/requests              — Service request list
│   └── /portal/requests/new      — New request form
└── /portal/profile               — Profile + notification settings
```

## Navigation Hierarchy (Internal)

```
Level 1      Level 2        Level 3
─────────────────────────────────────
Dashboard    —              —
CRM          Leads          —
             Opportunities  —
             Companies      —
             Contacts       —
Quotations   RFQs           —
             Quotes         —
             Contracts      —
Projects     All Projects   —
             [Project]      Milestones
                           Deliverables
                           Files
                           Timeline
Admin        Users          —
             Roles          —
             Companies      —
             Settings       —
             Audit Log      —
```

## Navigation Hierarchy (Client Portal)

```
Level 1      Level 2        Level 3
─────────────────────────────────────
Dashboard    —              —
Projects     All Projects   —
             [Project]      Milestones
                           Deliverables
                           Files
Quotations   All Quotes      —
             [Quote]        Detail
                           Approve/Reject
Documents    —              (Filter by project/category)
Requests     My Requests    —
             New Request    —
Profile      —              —
```

## Sitemap Index

| Path | Surface | Auth Required | Roles |
|------|---------|---------------|-------|
| / | Public | No | All visitors |
| /services | Public | No | All visitors |
| /about | Public | No | All visitors |
| /contact | Public | No | All visitors |
| /blog | Public | No | All visitors |
| /app/dashboard | Internal | Yes | Admin, Manager |
| /app/crm/* | Internal | Yes | Admin, Manager |
| /app/quotations/* | Internal | Yes | Admin, Manager |
| /app/projects/* | Internal | Yes | Admin, Manager |
| /app/admin/* | Internal | Yes | Admin only |
| /portal | Portal | Yes | Client Admin, Client User |

## URL Conventions

| Convention | Pattern | Example |
|------------|---------|---------|
| List views | /{module} (plural) | /app/crm/leads |
| Detail views | /{module}/:id | /app/crm/leads/42 |
| Create forms | /{module}/new | /app/crm/leads/new |
| Edit forms | /{module}/:id/edit | /app/crm/leads/42/edit |
| Nested resources | /{parent}/:id/{child} | /app/projects/42/milestones |
| Portal routes | /portal/{module} | /portal/projects |
| Public pages | /{page-name} | /services |
