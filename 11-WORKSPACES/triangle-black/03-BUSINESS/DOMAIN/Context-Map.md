# Context Map

Relationships between bounded contexts in the Triangle Black ecosystem.

---

## Context Map Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────┐     ┌─────────────┐     ┌────────────┐     ┌──────────┐  │
│  │   CRM    │◄────│  Marketing  │     │ Quotation  │────►│  Contract │  │
│  │ (Core)   │────►│ (Supporting)│     │  (Core)    │     │  (Core)   │  │
│  └────┬─────┘     └─────────────┘     └─────┬──────┘     └────┬─────┘  │
│       │                                     │                 │        │
│       │                                     │                 │        │
│       └──────────────────┬──────────────────┘                 │        │
│                          │                                     │        │
│                   ┌──────▼──────┐                     ┌───────▼──────┐ │
│                   │   Project   │◄────────────────────│   Contract   │ │
│                   │   (Core)    │                     │              │ │
│                   └──┬───┬──┬──┘                     └──────────────┘ │
│                      │   │  │                                           │
│         ┌────────────┘   │  └────────────┐                             │
│         │                │               │                             │
│  ┌──────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐                      │
│  │ Procurement│  │   QA/QC    │  │  Handover   │                      │
│  │(Supporting)│  │(Supporting)│  │(Supporting) │                      │
│  └──┬──────┬──┘  └────────────┘  └──────┬──────┘                      │
│     │      │                            │                             │
│  ┌──▼──┐ ┌─▼──────┐              ┌──────▼──────┐                      │
│  │Inven│ │Supply  │              │ Maintenance │                      │
│  │tory │ │(Supp.) │              │(Supporting) │                      │
│  └─────┘ └────────┘              └─────────────┘                      │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Document │  │Client Portal │  │  Dashboard   │  │ Notification  │  │
│  │ (Generic)│  │ (Supporting) │  │  (Generic)   │  │  (Generic)    │  │
│  └──────────┘  └──────────────┘  └──────────────┘  └───────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Administration (Supporting)                     │  │
│  │         (Users, Roles, Permissions, Audit, Config)               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Types

| Relationship | Type | Description |
|-------------|------|-------------|
| C-L | Customer-Language | Downstream context uses the upstream language/model |
| C-L/ | Customer-Language with translation | Downstream translates upstream model for its own use |
| ACL | Anti-Corruption Layer | A layer protects the downstream from upstream changes |
| OHS | Open-Host Service | Upstream provides a published interface for consumption |
| PL | Published Language | Standardized data format for exchange |
| S | Shared Kernel | Shared subset of the model |
| CF | Conformist | Downstream conforms to the upstream model |

---

## Context Relationships

### CRM ↔ Marketing

| Direction | Relationship | Description |
|----------|-------------|-------------|
| CRM → Marketing | OHS (Customer-Language) | CRM exposes leads and contacts via API; Marketing consumes lead data for scoring and campaigns |
| Marketing → CRM | OHS (Customer-Language) | Marketing sends back lead scores and campaign response data |

**Integration Points:**
- Lead data synchronization (CRM as source of truth)
- Lead score updates flow from Marketing to CRM
- Campaign response data flows from Marketing to CRM

### CRM → Quotation

| Direction | Relationship | Description |
|----------|-------------|-------------|
| CRM → Quotation | OHS (Customer-Language) | CRM provides opportunity and account data needed for quotation creation |

**Integration Points:**
- Opportunity data is referenced when creating quotations
- Account billing information flows to quotations

### Quotation → Contract

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Quotation → Contract | C-L/ (Customer-Language with translation) | Accepted quotation data (line items, pricing, terms) is translated into contract structure |

**Integration Points:**
- Accepted quotation is the source for contract value and commercial terms
- Quotation line items become contract scope references
- Contract stores the accepted quotation ID

### Contract → Project

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Contract → Project | C-L/ (Customer-Language with translation) | Contract scope, timeline, and budget are translated into project plan |

**Integration Points:**
- Contract start/end dates define project timeline
- Contract value defines project budget
- Payment milestones become project milestones

### Project ↔ Procurement

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Project → Procurement | OHS (Customer-Language) | Project creates material and service requests consumed by Procurement |
| Procurement → Project | OHS (Customer-Language) | Procurement sends PO status and goods receipt data back to Project |

**Integration Points:**
- Material requests originate from project resource plans
- PO data updates project cost tracking
- Goods receipt confirms material availability for project

### Project ↔ Document

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Project → Document | OHS (Customer-Language) | Project generates documents (reports, specs, drawings) stored in Document |
| Document → Project | C-L (Customer-Language) | Document provides storage and retrieval service to Project |

**Integration Points:**
- Project stores deliverables in Document
- Document templates are used by Project for reports
- Document permissions controlled by Project context

### Procurement ↔ Document

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Procurement → Document | OHS | Procurement generates RFQs, POs, and contracts stored in Document |

**Integration Points:**
- RFQ documents, PO documents, and vendor contracts stored in Document
- Document templates used for procurement documents

### CRM ↔ ClientPortal

| Direction | Relationship | Description |
|----------|-------------|-------------|
| CRM → ClientPortal | ACL (Anti-Corruption Layer) | CRM provides client and contact data; ClientPortal translates for client-facing use without exposing internal CRM structure |

**Integration Points:**
- Client contact authentication (CRM as identity source)
- Project access permissions derived from CRM account/contact relationships

### Project ↔ ClientPortal

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Project → ClientPortal | OHS (Customer-Language) | Project provides status, milestones, and progress data for client view |
| ClientPortal → Project | C-L | Client actions (document access, message sending) are sent to Project |

**Integration Points:**
- Project status and milestones displayed on portal
- Client document access logged back to Project

### All Contexts ↔ Dashboard

| Direction | Relationship | Description |
|----------|-------------|-------------|
| All → Dashboard | C-L (Customer-Language) | Each context exposes data that Dashboard consumes for reporting |

**Integration Points:**
- Dashboard queries each context's read models or data views
- Events from all contexts update dashboard KPIs in near real-time

### All Contexts ↔ Notification

| Direction | Relationship | Description |
|----------|-------------|-------------|
| All → Notification | OHS (Customer-Language) | All contexts emit events that Notification consumes to dispatch alerts |

**Integration Points:**
- Domain events trigger notification dispatch
- Notification preferences from Administration determine channel routing

### All Contexts ↔ Administration

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Administration → All | OHS (Customer-Language) | Administration provides user authentication, authorization, and audit services to all contexts |

**Integration Points:**
- All contexts use Administration for user/role/permission checks
- All contexts push audit events to Administration

### Contract ↔ Renewals

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Contract → Renewals | OHS | Contract emits expiry approaching events to Renewals |
| Renewals → Contract | C-L/ | Renewals initiate contract amendments or new contracts |

### Project → QA/QC

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Project → QA/QC | OHS | Project defines inspection points and quality criteria |
| QA/QC → Project | C-L | QA/QC returns inspection results, defects, and non-conformances |

### Project → Handover

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Project → Handover | OHS | Project provides completion data, as-built docs, and punch list |
| Handover → Project | C-L | Handover confirms project closure and warranty start |

### Handover → Maintenance

| Direction | Relationship | Description |
|----------|-------------|-------------|
| Handover → Maintenance | OHS | Handover provides asset register, warranty info, and maintenance schedules |
| Maintenance → Contract | C-L | Maintenance records feed contract SLA compliance |

---

## Communication Patterns

| Pattern | Used Between | Technology |
|---------|-------------|------------|
| Domain Events (async) | All → Notification, All → Dashboard | Message broker (RabbitMQ/Kafka) / Event Bus |
| API Calls (sync) | CRM → Quotation, Project → Procurement | REST/gRPC |
| Event Carried State Transfer | CRM → Marketing, Project → ClientPortal | Event-sourced projections |
| CQRS Read Model | All → Dashboard | Shared database views / read stores |
| ACL/Facade | CRM → ClientPortal | Dedicated translation layer |
