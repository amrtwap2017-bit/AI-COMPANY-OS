# Dependency Graph

## Module Dependency Map

```
                    ┌──────────────────┐
                    │  Administration  │  ← Foundation module (no dependencies)
                    │  (Users, Roles,  │
                    │   Permissions)   │
                    └────────┬─────────┘
                             │ provides auth context
                             ▼
                    ┌──────────────────┐
                    │ Marketing Site   │  ← Independent, depends only on CRM for lead creation
                    │ (Public Website) │
                    └────────┬─────────┘
                             │ creates leads
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                        CRM                                   │
│  (Leads → Opportunities → Companies → Contacts → Activities) │
│                                                              │
│  Depends on: Administration (users, roles)                   │
│  Provides: Qualified opportunities → Quotations              │
│            Pipeline data → Executive Dashboard               │
│            Client data → Client Portal                       │
└──────────────────────┬───────────────────────────────────────┘
                       │ feeds opportunities
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     Quotations                                │
│  (RFQ → Quotation → Approval → Contract)                     │
│                                                              │
│  Depends on: CRM (opportunities), Administration (approvers) │
│  Provides: Signed contracts → Projects                       │
│            Revenue data → Executive Dashboard                │
│            Quotation data → Client Portal                    │
└──────────────────────┬───────────────────────────────────────┘
                       │ feeds contracts
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                      Projects                                 │
│  (Setup → Milestones → Site Survey → Assessment → Files)     │
│                                                              │
│  Depends on: Quotations (contracts), Administration (users), │
│              Document (file storage)                         │
│  Provides: Project data → Executive Dashboard                │
│            Project data → Client Portal                      │
└──────────────────────┬───────────────────────────────────────┘
                       │ feeds data
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  Client Portal                                │
│  (Projects view, Quotations view, Documents, Requests)       │
│                                                              │
│  Depends on: Projects (data), Quotations (data),             │
│              Documents (files), Administration (auth)        │
│  Provides: Client actions → Quotations (approvals)           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  Executive Dashboard                          │
│  (Pipeline, Revenue, Project Health, KPIs)                   │
│                                                              │
│  Depends on: CRM (pipeline), Quotations (revenue),           │
│              Projects (health), Administration (auth)        │
│  Provides: Decision support (read-only)                      │
└──────────────────────────────────────────────────────────────┘

Cross-Cutting Dependencies:
  Document Management ← All modules (file storage)
  Notification Engine ← CRM, Quotations, Projects, Client Portal (alerts)
  Audit Logging       ← Administration (all modules log through this)
```

## Dependency Rules

| Rule | Rationale |
|------|-----------|
| Administration has ZERO dependencies on business modules | Foundation must be deployable independently for tenant setup |
| Business modules may ONLY depend on Administration | No circular dependencies; clean layered architecture |
| CRM → Quotations → Projects is a strict chain | An opportunity must exist before a quotation; a contract before a project |
| Executive Dashboard reads from ALL modules but writes to NONE | Read-only aggregate views; no write-back to source modules |
| Client Portal reads from Projects, Quotations, Documents | Client data is a projection; no direct writes to core domains |
| Document Management is a utility (no business logic) | Passive storage; all business logic lives in consuming modules |
| Notification Engine listens to events; never queried | Fire-and-forget; no synchronous dependencies |

---

## Dependency Matrix

| Module → | Admin | Mktg | CRM | Quotes | Proj | Client | Exec | Doc | Notif |
|----------|-------|------|-----|--------|------|--------|------|-----|-------|
| Admin | — | — | — | — | — | — | — | — | — |
| Marketing | ✓ | — | ✓¹ | — | — | — | — | — | — |
| CRM | ✓ | — | — | — | — | — | — | — | — |
| Quotations | ✓ | — | ✓ | — | — | — | — | ✓² | — |
| Projects | ✓ | — | — | ✓ | — | — | — | ✓² | — |
| Client Portal | ✓ | — | — | ✓ | ✓ | — | — | ✓² | — |
| Executive | ✓ | — | ✓ | ✓ | ✓ | — | — | — | — |
| Document | — | — | — | — | — | — | — | — | — |
| Notification | — | — | — | — | — | — | — | — | — |

¹ Marketing → CRM: Lead creation from website form
² Document: File storage dependency

---

## Build Order (Implementation Sequence)

```
Sprint 1:  Administration (foundation: auth, users, roles)
          + Document Management (utility: file storage)

Sprint 2:  CRM (leads, companies, contacts)
          + Marketing Site (public pages + contact → lead)

Sprint 3:  CRM (opportunities, pipeline, activities)
          + Quotations (RFQ, quotation builder)

Sprint 4:  Quotations (approval workflow, PDF, contracts)
          + Projects (setup, milestones)

Sprint 5:  Projects (files, surveys, assessments)
          + Client Portal (auth, project view, quotation view)

Sprint 6:  Client Portal (documents, requests)
          + Executive Dashboard (pipeline, revenue, health)

Sprint 7:  Integration testing, UAT, deployment
```
