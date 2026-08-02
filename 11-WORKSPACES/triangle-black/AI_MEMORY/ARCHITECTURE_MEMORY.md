# AI_MEMORY/ARCHITECTURE_MEMORY.md

## 1. Architecture Pattern
Modular Monolith → Microservices ready  
DDD + Clean Architecture + Hexagonal ports

## 2. Backend Architecture
src/commercial/{module}/  
  ├── router.py     (FastAPI routes = primary adapter)  
  ├── service.py    (application/domain logic)  
  ├── models.py     (SQLAlchemy ORM = infrastructure)  
  └── schemas.py    (Pydantic = DTOs)

## 3. Multi-Tenant Architecture
- Tenant ID on every table  
- tb-{hotel-id}-{uuid} ID pattern  
- Row-level isolation (NOT schema-level)  
- ChromaDB collections per tenant

## 4. Event Architecture
- workflow_engine/ handles state machines  
- procurement_events/ domain events  
- sse_notifications/ real-time push  
- Event catalog: [04-DESIGN/EVENTS/Event-Catalog.md](04-DESIGN/EVENTS/Event[58D[K
[04-DESIGN/EVENTS/Event-Catalog.md](04-DESIGN/EVENTS/Event-Catalog.md)

## 5. AI Architecture
- ChromaDB: agent/.chromadb/ (RAG live)  
- Knowledge graph: src/commercial/knowledge_graph/  
- Digital twin: src/commercial/digital_twin/  
- Predictive maintenance: src/commercial/predictive_maintenance/  
- AI constitution: [10-AI/DELIVERY/FOUNDATION/AI-CONSTITUTION.md](10-AI/DEL[56D[K
[10-AI/DELIVERY/FOUNDATION/AI-CONSTITUTION.md](10-AI/DELIVERY/FOUNDATION/AI[10-AI/DELIVERY/FOUNDATION/AI-CONSTITUTION.md](10-AI/DELVERY/FOUNDATION/AI-CONSTITUTION.md)

## 6. Key Architecture Decisions (ADRs)
[List all 10 ADRs from 00-ARCHITECT/DECISIONS/ with 1-line summary]

## 7. Architecture Anti-Patterns to AVOID
[What must never be done]

## 8. Performance Architecture
- Global search: src/commercial/global_search/  
- Caching: src/commercial/cache/  
- Pagination: src/commercial/pagination/

## Navigation Patterns

### Pattern 1: Top Navigation Bar (All Authenticated Portals)
```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Item 1]  [Nav Item 2 ▾]  [Nav Item 3]  [🔔]  [👤] │
├──────────────────────────────────────────────────────────────────┤
│ Breadcrumb > Current Section > Page Name                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Page Content                                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---------|----------|
| Logo | Links to home/dashboard for portal |
| Nav Items | Active section highlighted; dropdown for sub-items |
| Notification Bell | Badge count; click opens dropdown list |
| User Menu | Profile, Settings, Logout dropdown |
| Breadcrumb | Located below nav; shows current location |

### Pattern 2: Tab Navigation (Detail Pages)
Used on detail pages to organize related sub-sections:
```
┌──────────────────────────────────────────────────────────────────┐
│ Project: Hilton Sharm HVAC Upgrade                     [Actions ▾]│
│                                                                  │
│ [Overview]  [Milestones]  [Files]  [Team]  [Activity]           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tab Content                                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Pattern 3: Side Navigation (Admin Only)
```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  [Dashboard]  [CRM]  [Quotes]  [Projects]  [🔔]  [👤]   │
├──────────┬───────────────────────────────────────────────────────┤
│ Admin    │                                                       │
│ ──────── │  Page Content                                         │
│ ■ Users  │                                                       │
│ ■ Roles  │                                                       │
│ ■ Co's   │                                                       │
│ ■ Config │                                                       │
│ ■ Audit  │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

## Mobile Navigation

### Bottom Tab Bar (≤768px)
```
┌──────────────────────────────────────────────┐
│                                              │
│              Page Content                    │
│                                              │
├──────────────────────────────────────────────┤
│  [📊]  [📋]  [📄]  [🔧]  [⚙️]              │
│ Dash   CRM   Quotes  Proj   More             │
└──────────────────────────────────────────────┘
```

| Tab | Icon | Content |
|-----|------|---------|
| Dashboard | 📊 | Main dashboard |
| CRM | 📋 | Lead list (default CRM view) |
| Quotes | 📄 | Quotation list |
| Projects | 🔧 | Project list |
| More | ⚙️ | Menu with remaining sections |

## Breadcrumb Convention
`{Module} > {Sub-module} > {Entity Name} > {Action}`

| Example | Breakdown |
|---------|-----------|
| CRM > Leads > Sarah Johnson | Module > List > Detail |
| Quotations > Quotes > QTN-2026-00142 > Approve | Module > List > Detail >[1D[K
> Action |
| Projects > Hilton Sharm > Milestones | Module > Detail > Tab |
| Admin > Users > Create New User | Module > List > Action |

Rules:
- Last item is current page (not linked)
- Each parent segment links to its list/detail view
- Breadcrumbs truncated with ellipsis on mobile
- `>` separator with appropriate spacing

