# Renewals — Contract Renewal and Expansion Process

## Overview

The renewals process manages the proactive renewal and expansion of client contracts, ensuring continuity of service and identifying opportunities to grow the relationship through additional services or scope expansion.

---

## BPMN Description

**Start Event:** Contract approaching expiry (90 days before end date)

1. **Identify Contracts for Renewal** — System flags contracts expiring within 90 days
2. **Review Contract Performance** — Analyze service history, SLA compliance, financial performance
3. **Review Client Relationship** — Assess satisfaction, open issues, relationship health
4. **Prepare Renewal Strategy** — Define renewal approach: standard renewal, upsell, renegotiation
5. **Compile Renewal Package** — Gather performance data, value summary, and proposal
6. **Schedule Renewal Meeting** — Book meeting with client decision-makers
7. **Present Renewal Proposal** — Discuss renewal terms, pricing, and opportunities
8. **Negotiate Terms** — Discuss changes to scope, pricing, or commercial terms
9. **Identify Expansion Opportunities** — Assess additional services or projects
10. **Prepare Expansion Proposal** — Separate proposal for additional scope (if applicable)
11. **Client Reviews** — Client evaluates renewal and expansion proposals
12. **Client Accepts** — Client agrees to renewal terms
13. **Draft Renewal Contract** — Create contract amendment or new contract
14. **Internal Approval** — Route through approval chain per contract value
15. **Client Signs** — Client executes renewal contract
16. **Counter-Sign** — Triangle Black signs to finalize
17. **Update Contract Records** — Extend contract end date, update terms
18. **Communicate to Teams** — Notify project, maintenance, support teams
19. **Schedule Transition** — Plan for continued or expanded service delivery
20. **Celebrate and Follow Up** — Client appreciation and onboarding for new scope

**End Event:** Contract renewed or expansion confirmed

### Exit Path (Non-Renewal)
1. **Client Declines Renewal** — Client decides not to renew
2. **Document Reason** — Capture exit reason and feedback
3. **Plan Transition** — Plan for service cessation or handover
4. **Execute Transition** — Transfer systems, documents, and knowledge
5. **Close Contract** — Formal contract termination
6. **Archive Records** — Archive for future reference

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Account Manager | Owns client relationship, leads renewal | CRM |
| Sales Manager | Reviews renewal strategy and pricing | CRM, Quotation |
| Project Manager | Provides project performance data | Project |
| Service Manager | Provides maintenance performance data | Maintenance |
| Client Decision-Maker | Approves renewal | Email, Meetings |
| Legal Counsel | Drafts renewal contract | Contract |
| Finance | Reviews pricing and payment terms | Finance |
| Operations Team | Prepares for continued service delivery | Operations |

---

## Inputs

| Input | Source |
|-------|--------|
| Contract expiry data | Contract |
| Contract performance history | Project, Maintenance |
| SLA compliance records | Maintenance, QA/QC |
| Client satisfaction data | Client Support, Surveys |
| Financial performance | Finance, Project |
| Service history and KPIs | Maintenance, Support |
| Client feedback | Surveys, Account Management |
| Previous renewal terms | Contract |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Renewal strategy | Approach and terms for renewal | Account Management |
| Renewal proposal | Proposed terms for client | Client |
| Expansion proposal | Additional services proposal | Client |
| Renewal contract | Signed renewal agreement | Contract |
| Contract amendment | Updated terms document | Contract |
| Transition plan | Service continuity plan | Operations |
| Non-renewal record | Exit documentation | Contract, CRM |
| Client feedback record | Exit survey / feedback | CRM |

---

## Business Rules

- Renewal process starts 90 days before contract expiry
- Renewal proposal must be presented at least 60 days before expiry
- Price escalation: standard annual increase of CPI + 2% (unless otherwise contracted)
- Multi-year renewals (2+ years) may offer discounted pricing
- SLA improvement requests must be evaluated for cost impact
- Renewal requires same approval chain as new contracts of equivalent value
- Non-renewal must be documented with reason code and exit plan
- Contract amendments for renewals follow standard amendment workflow

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Renewal notification | System-triggered alert |
| Contract performance report | Service delivery data |
| Renewal proposal | Proposed renewal terms |
| Expansion proposal | Additional scope proposal |
| Renewal contract / amendment | Signed renewal document |
| Price escalation schedule | Updated pricing |
| Exit plan (non-renewal) | Transition documentation |
| Client feedback form | Renewal experience feedback |
| Internal approval form | Renewal authorization |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Renewal rate | > 85% | Contracts renewed / Contracts expiring |
| Renewal initiated (90-day trigger) | 100% | Initiated on time / Total expiring |
| Renewal cycle time | < 60 days | Initiation - Signed renewal |
| Expansion revenue (upsell) | > 10% of renewal value | Expansion value / Renewal value |
| Price escalation achieved | CPI + 2% | Actual increase / Target |
| Client retention rate | > 90% | Retained clients / Total clients |
| Non-renewal rate | < 15% | Non-renewed / Total expiring |
| Renewal without negotiation | > 60% | Auto-renewed / Total renewals |
| Client satisfaction (renewal survey) | > 4.0 / 5.0 | Survey score |
| Renewal approval turnaround | < 5 business days | Submit - Approval |
