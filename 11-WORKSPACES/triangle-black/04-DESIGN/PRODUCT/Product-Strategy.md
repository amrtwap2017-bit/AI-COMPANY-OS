---
ID: 07-Product-03
Title: Product Strategy
Purpose: Define the revenue-first product development strategy
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Product Strategy

## Core Philosophy

**Revenue first. Everything else second.**

Triangle Black is a pre-revenue startup. Every product decision must be evaluated against its direct or indirect contribution to revenue generation. The platform exists to enable the business model — not the other way around.

## Revenue-Driven Product Prioritization

### Revenue Streams and Platform Enablers

| Revenue Stream | Platform Enabler | V1 Priority |
|----------------|-----------------|-------------|
| Engineering Supplies (margin) | CRM + Quotations → procurement pipeline | Critical |
| Contracting Services | Projects module → milestone tracking | Critical |
| Operational Partnership (retainer) | Client Portal + Dashboard → value demonstration | Critical |
| Design Services | Projects module + File sharing | High |
| Project Management | Projects + Quotations | High |
| Emergency Response | CRM + Client Portal | Medium |

### Product-Led Growth vs. Sales-Led

Triangle Black uses a **sales-led growth** model for V1 and V2. The platform is a tool that enables the sales process and demonstrates value. Direct sales to hotel owners and GMs drive adoption. The platform does not have a self-serve signup in V1.

## Build vs. Buy Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| CRM (core) | Build | Too customized to hospitality workflow to buy |
| Document generation | Use library | Integrate docx/pdf generation; don't build editor |
| File storage | Use library | Local disk or S3-compatible; don't build storage |
| Authentication | Use library | Passport/JWT; don't build auth from scratch |
| Notification engine | Build | Custom multi-channel (email, SMS, in-app) |
| Reporting engine | Build | Hospitality-specific reports require custom builder |
| Payment processing | Integrate | Stripe/PayPal/OPPO for invoice payments |
| Calendar/scheduling | Build | Custom to hotel engineering scheduling |

## Zero-Based Feature Budgeting

Every feature must answer:
1. **Which revenue stream does this support?** (If none, kill it.)
2. **Which client-facing capability does this unlock?** (If internal-only, defer it.)
3. **Can this wait until after first paying client?** (If yes, defer it.)

Features that survive this filter are then prioritized by:
- **Revenue impact** (direct vs. indirect vs. none)
- **Implementation cost** (hours × complexity)
- **Client perception** (will they notice if it's missing?)

## Phased Delivery Strategy

### Phase 0 — Foundation (Pre-revenue)
Build: Public Website, simple CRM, manual quotation workflow

### Phase 1 — First Client (Revenue-enabling)
Build: Complete CRM, Quotations, Projects, basic Client Portal

### Phase 2 — Retention (Revenue-securing)
Build: Executive Dashboard, Client Portal with reports, Administration

### Phase 3 — Efficiency (Revenue-margin-improving)
Build: Automation, templates, batch operations, integrations

## Metric Targets

| Metric | V1 Target | V2 Target |
|--------|-----------|-----------|
| Platform uptime | 99.5% | 99.9% |
| Page load time (dashboard) | < 3s | < 1.5s |
| Quote generation time | < 5 min | < 1 min |
| Client onboarding time | < 5 days | < 2 days |
| Active users per hotel | 3-5 | 8-12 |
| Monthly active use rate | 80%+ of clients | 95%+ of clients |
