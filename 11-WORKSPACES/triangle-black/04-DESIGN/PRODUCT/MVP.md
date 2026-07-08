---
ID: 07-Product-04
Title: MVP Scope Definition
Purpose: Define strict V1 scope with justification for each module
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# MVP — Minimum Viable Product (V1)

## Scope Rule

**Nothing enters V1 unless it directly enables a revenue stream or is a prerequisite for a module that does.**

Every module below has passed the zero-based feature budgeting test.

## V1 Modules

### 1. Public Website

| Field | Value |
|-------|-------|
| Priority | P0 — Launch gate |
| Revenue Link | Lead generation for all revenue streams |
| Justification | Without a website, there is no digital presence. Hotels evaluate partners online before engaging. The website is the primary lead capture mechanism. |
| Scope | Company information, services overview, contact form, case studies (placeholder), blog |
| Out of Scope | E-commerce, self-serve booking, multi-language (English-only V1) |

### 2. CRM (Leads, Opportunities, Companies, Contacts)

| Field | Value |
|-------|-------|
| Priority | P0 — Launch gate |
| Revenue Link | Pipeline management → closed deals → all revenue streams |
| Justification | Without CRM, leads from the website and sales efforts have no home. Every deal needs tracking from first contact to signed contract. CRM is the engine that feeds all downstream modules. |
| Scope | Lead capture from website, manual lead entry, opportunity pipeline stages, company and contact management, activity logging, email integration |
| Out of Scope | Marketing automation, mass email campaigns, complex workflow automation |

### 3. Quotations (RFQ → Proposal → Quotation → Contract)

| Field | Value |
|-------|-------|
| Priority | P0 — Launch gate |
| Revenue Link | Converts opportunities into revenue via signed contracts |
| Justification | The core transaction of the business is converting a client need into a priced offer. Without quotation management, the business operates on email and spreadsheets — the exact problem the platform exists to solve. |
| Scope | RFQ creation and tracking, proposal generation from templates, quotation with line items, approval workflow, contract generation and e-sign (basic), document history |
| Out of Scope | Advanced pricing engine, supplier RFQ broadcast, automated margin optimization |

### 4. Projects (Milestones, Deliverables, Files)

| Field | Value |
|-------|-------|
| Priority | P0 — Launch gate |
| Revenue Link | Project-based revenue streams (contracting, PM, design) |
| Justification | Engineering projects are a primary revenue driver. Clients need visibility into project progress. Internal teams need structured milestone tracking. Without project management, the platform is just a quoting tool. |
| Scope | Project creation, milestone definition, deliverable upload, file storage per project, status tracking, client-visible project timeline |
| Out of Scope | Gantt charts, resource leveling, time tracking, sub-contractor management |

### 5. Client Portal

| Field | Value |
|-------|-------|
| Priority | P1 — First client gate |
| Revenue Link | Retention → recurring revenue (retainers, repeat business) |
| Justification | The portal is the primary differentiator. Hotels are used to opaque vendor relationships. A transparent portal where they can see project status, quotations, and reports in real time creates stickiness and justifies premium pricing. |
| Scope | Secure client login, project view, quotation history, document downloads, report viewer, ticket/request submission |
| Out of Scope | Real-time chat, payment processing, multi-property portfolio view |

### 6. Executive Dashboard

| Field | Value |
|-------|-------|
| Priority | P1 — First client gate |
| Revenue Link | Retention, upsell, client proof-of-value |
| Justification | Executives (GMs, owners) do not want to dig through reports. A dashboard showing pipeline, active projects, revenue metrics, and client KPIs is essential for internal management and for quarterly business reviews with clients. |
| Scope | Pipeline summary, active project count, revenue YTD, client KPI cards, upcoming milestones |
| Out of Scope | Custom report builder, predictive analytics, AI insights |

### 7. Administration

| Field | Value |
|-------|-------|
| Priority | P0 — Launch gate (prerequisite) |
| Revenue Link | Indirect — enables all other modules |
| Justification | Without administration, users cannot be created, roles cannot be assigned, and settings cannot be configured. This is the foundation upon which all other modules depend. |
| Scope | User management (CRUD), role-based access control (RBAC), basic settings (company profile, system config), audit log |
| Out of Scope | Advanced permission matrix, SSO, tenant self-service provisioning |

## V1 Exclusions — Explicitly NOT in Scope

| Feature | Rationale for Exclusion |
|---------|-------------------------|
| Inventory Management | Complex, requires physical warehouse process; V2 |
| Purchase Orders | Requires supplier onboarding; V2 |
| Asset Management | Requires baseline data collection; V2 |
| Maintenance Work Orders | Requires asset registry; V2 |
| Mobile App (Native) | PWA sufficient for V1; native in V2 |
| Payment Gateway | Check/invoice payment works for V1 clients |
| Multi-language | Arabic support in V2; English-only V1 |
| Advanced Reporting | Static reports + dashboard sufficient for V1 |
| Supplier Portal | Requires supplier critical mass; V3 |
| AI Features | No historical data to train on; V2+ |
| Self-Serve Onboarding | Sales-led model; no self-serve V1 |
| Public API | Only internal API for SPA; public API in V2 |

## Justification Summary

```
Revenue streams requiring platform support: 6
Modules required to enable them:            7
Modules excluded as out-of-scope:           10
Build vs. buy (custom vs. library):         70% build, 30% library
Estimated V1 delivery:                       4-5 months from first commit
```
