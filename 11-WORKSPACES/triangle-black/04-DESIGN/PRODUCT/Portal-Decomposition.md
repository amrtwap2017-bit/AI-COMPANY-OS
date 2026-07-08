# Portal Decomposition

## Portal Overview

| Portal | Primary Users | Auth Required | V1 Priority | Business Capabilities Served |
|--------|--------------|---------------|-------------|------------------------------|
| Public Website | Prospects, General public | No | P0 — Launch | Marketing, Lead Generation |
| Operations Portal | Triangle Black staff | Yes (Internal) | P0 — Launch | CRM, Quotations, Projects, Administration |
| Executive Dashboard | CEO, COO, Dept Heads | Yes (Internal) | P1 — First client | Executive Intelligence, KPI, Forecasting |
| Client Portal | Hotel GM, Chief Engineer, Procurement, Finance | Yes (Client) | P1 — First client | Client Portal, Support, Renewals |

---

## Portal 1: Public Website

### Identity
- **URL:** `https://triangleblack.com`
- **Brand:** Triangle Black — Operational Engineering Partner
- **Tone:** Professional, technical, trustworthy

### User Types
| Type | Goal |
|------|------|
| Hotel GM/owner | Evaluates Triangle Black as a partner |
| Chief Engineer | Seeks technical credibility |
| Industry professional | Career opportunities |

### Navigation Tree
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
├── Case Studies (/case-studies/:slug)
├── Blog (/blog/:slug)
├── Contact (/contact) → Lead capture form
├── Privacy Policy (/privacy)
└── Terms of Service (/terms)
```

### Content Management
- Static pages built in Next.js (no CMS)
- Blog via markdown files or headless CMS (Strapi/Contentful — V2)
- Case studies curated by marketing team

### Key Integrations
| Integration | Purpose |
|-------------|---------|
| CRM Lead API | Contact form → Lead in CRM |
| Google Analytics | Traffic and conversion tracking |
| reCAPTCHA | Spam protection on forms |
| SEO metadata | Open Graph, Schema.org, meta tags |

---

## Portal 2: Operations Portal (Internal)

### Identity
- **URL:** `https://app.triangleblack.com`
- **Brand:** Internal tooling — Triangle Black Ops
- **Tone:** Functional, data-dense, efficient

### User Types
| Role | Access Level | Goal |
|------|-------------|------|
| Admin | Full system access | Configure, audit, manage |
| Manager | CRM + Quotations + Projects | Oversee operations, approve |
| Sales Rep | CRM + Quotations | Manage pipeline, close deals |
| Engineer | Projects (assigned) | Execute, update, report |
| Procurement (V2) | Procurement module | Source and purchase |

### Navigation Tree
```
/app/dashboard                    — Executive Dashboard (internal)
/app/crm                          — CRM Root
  /leads                          — Lead list
  /leads/new                      — Create lead
  /leads/:id                      — Lead detail
  /opportunities                  — Pipeline view
  /opportunities/:id              — Opportunity detail
  /companies                      — Company list
  /companies/:id                  — Company detail
  /contacts                       — Contact list
  /contacts/:id                   — Contact detail
/app/quotations                   — Quotations Root
  /rfqs                           — RFQ list
  /rfqs/:id                       — RFQ detail
  /quotes                         — Quotation list
  /quotes/new                     — Quotation builder
  /quotes/:id                     — Quotation detail
  /contracts                      — Contract list
  /contracts/:id                  — Contract detail
/app/projects                     — Projects Root
  /projects                       — Project list
  /projects/new                   — Create project
  /projects/:id                   — Project detail (tabs: Overview, Milestones, Files, Team)
/app/admin                        — Administration
  /users                          — User management
  /roles                          — Role & permissions
  /companies                      — Tenant management
  /settings                       — System settings
  /audit                          — Audit log viewer
```

### Portal Patterns
| Pattern | Implementation |
|---------|---------------|
| List → Detail | Click row → detail page |
| Create flow | "New" button → form → redirect to detail |
| Inline editing | Click-to-edit on detail fields |
| Batch actions | Select rows → bulk action bar |
| Search | Global search bar in top nav |
| Notifications | Bell icon with badge, dropdown list |

---

## Portal 3: Executive Dashboard

### Identity
- **URL:** `https://app.triangleblack.com/dashboard`
- **Brand:** Decision support — not reporting
- **Tone:** Analytical, concise, actionable

### User Types
| Role | Access Level |
|------|-------------|
| CEO | Full — all metrics, all clients |
| COO | Full — operations focus |
| Sales Director | Pipeline + revenue |
| Department Head | Team-specific KPIs |

### Navigation (Simplified)
```
/dashboard                        — Main dashboard
  /pipeline                       — Pipeline deep-dive
  /revenue                        — Revenue analysis
  /projects                       — Project health overview
  /clients                        — Client health scores
  /operations                     — Operations KPIs
```

### Decision Support Questions
| Question | Widget |
|----------|--------|
| Can we hire? | Revenue vs target, pipeline coverage, margin trend |
| Which hotel is most profitable? | Per-client profitability breakdown |
| Which supplier underperforms? | Supplier scorecard (V2) |
| Which project is at risk? | Project health heatmap, delayed milestones |
| Cash flow forecast? | Revenue forecast, AR aging |
| Contract renewal forecast? | Contract expiry calendar |
| Pipeline health? | Funnel value, win rate, velocity |
| Team capacity? | Workload distribution, open assignments |

---

## Portal 4: Client Portal

### Identity
- **URL:** `https://portal.triangleblack.com`
- **Brand:** Client-facing — Triangle Black Partnership Portal
- **Tone:** Transparent, professional, supportive

### User Types
| Role | Access Level |
|------|-------------|
| Client Admin (GM/owner) | Full — all projects, quotations, documents |
| Client User (Chief Engineer) | Projects, maintenance, technical documents |

### Navigation Tree
```
/portal                           — Dashboard
  /projects                       — Project list
  /projects/:id                   — Project detail (Overview, Milestones, Files)
  /quotations                     — Quotation list
  /quotations/:id                 — Quotation detail + approve/reject
  /documents                      — Document repository (filter by project/category)
  /requests                       — Service requests
  /requests/new                   — Submit request
  /profile                        — Profile, notification settings
  /login                          — Authentication
```

### Portal Differentiators
| Feature | Business Value |
|---------|---------------|
| Real-time project progress | Builds trust, reduces status calls |
| Quotation approve/reject | Accelerates sales cycle |
| Document repository | Self-service reduces admin overhead |
| Service request submission | Structured intake, SLA tracking |
| Mobile responsive | Hotel GMs check on mobile |
