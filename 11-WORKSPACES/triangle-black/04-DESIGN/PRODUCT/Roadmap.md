---
ID: 07-Product-06
Title: Product Roadmap
Purpose: Define V1, V2, V3 themes and timelines (not feature lists)
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Product Roadmap

This roadmap describes themes and capabilities per release. It intentionally avoids feature-level detail — those belong in Functional-Requirements.md.

## V1 — Foundation (Months 1-5)

**Theme: Replace chaos with clarity**

| Phase | Timeline | Focus | Capabilities |
|-------|----------|-------|--------------|
| Phase 0 | Month 1-2 | Foundation | Public website, CRM core, user authentication, admin panel |
| Phase 1 | Month 2-3 | Revenue-enabling | Complete CRM, quotation engine, project management |
| Phase 2 | Month 3-4 | Client-facing | Client portal, executive dashboard, reporting |
| Phase 3 | Month 4-5 | Polish & launch | Integration testing, security audit, documentation, deployment |

**Milestones:**
- M1: Website live + CRM accepting leads (Month 2)
- M2: First quotation generated in system (Month 3)
- M3: First project tracked with client visibility (Month 4)
- M4: Platform live with first paying client (Month 5)

## V2 — Intelligence (Months 6-14)

**Theme: Turn data into decisions**

| Theme | Timeline | Description |
|-------|----------|-------------|
| Procurement Optimization | Month 6-8 | Purchase orders, supplier management, consolidated buying |
| Maintenance Operations | Month 8-10 | Asset registry, work orders, preventive maintenance scheduling |
| AI-Powered Insights | Month 10-12 | Predictive maintenance signals, spend analytics, auto-reporting |
| Platform Maturity | Month 12-14 | Arabic localization, PWA improvements, advanced permissions |

**Key capabilities added:**
- Inventory and warehouse management
- Purchase order and supplier portal
- Asset registry with maintenance history
- Work order creation, assignment, and tracking
- AI-powered spend analysis and anomaly detection
- Automated monthly executive reporting
- Arabic language support
- Enhanced mobile experience (PWA)

## V3 — Ecosystem (Months 15-24)

**Theme: Network effects multiply value**

| Theme | Timeline | Description |
|-------|----------|-------------|
| Supplier Marketplace | Month 15-18 | Vetted supplier directory, auto-RFQ matching, bid comparison |
| Benchmarking Engine | Month 18-20 | Cross-property benchmarks, industry reports, cost indices |
| AI Agents | Month 20-22 | Autonomous procurement, predictive scheduling, anomaly resolution |
| Platform Expansion | Month 22-24 | Public API, SSO, multi-tenant self-serve, marketplace launch |

**Key capabilities added:**
- Supplier marketplace with automated RFQ distribution
- Cross-property benchmarking for spend, maintenance, compliance
- AI agents for routine procurement decisions
- Public REST API for third-party integration
- Self-serve tenant onboarding
- Single sign-on (SSO) with SAML/OAuth

## Post V3 — Scale (Year 3-5)

**Theme: Regional operating system for hospitality engineering**

- Geographic expansion module (multi-region, multi-currency, multi-language)
- IoT integration for real-time asset monitoring
- Advanced AI: natural language query for operations data
- Mobile native apps (iOS, Android)
- Platform licensing model for third-party operators
- Hospitality engineering data marketplace

## Release Cadence

| Release | Frequency | Scope |
|---------|-----------|-------|
| Patch | Weekly as needed | Bug fixes, minor improvements |
| Minor | Monthly | Features, non-breaking changes |
| Major | Per phase | New capabilities, potential breaking changes |

## Dependency Map

```
Website → CRM (lead capture)
CRM → Quotations (opportunity → quote)
Quotations → Projects (contract → project execution)
All modules → Client Portal (client visibility)
All modules → Executive Dashboard (internal visibility)
All modules → Administration (users, roles, config)
```
