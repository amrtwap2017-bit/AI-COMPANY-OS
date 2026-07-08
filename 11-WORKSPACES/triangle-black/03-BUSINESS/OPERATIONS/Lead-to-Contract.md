# Lead-to-Contract — Full Sales Cycle

## Overview

The end-to-end process spanning marketing engagement, lead capture, qualification, opportunity development, proposal, quotation, negotiation, and contract execution. This is the primary revenue-generating workflow.

---

## BPMN Description

**Start Event:** Marketing campaign generates response OR inbound inquiry received

1. **Capture Lead** — Lead is created in CRM from any source (website, referral, event, cold outreach)
2. **Qualify Lead** — Lead is assessed against qualification criteria; scored and routed
3. **Convert to Opportunity** — Qualified lead becomes a sales opportunity with estimated value
4. **Develop Opportunity** — Gather requirements, understand scope, identify decision makers
5. **Request Site Survey** — If engineering scope requires physical inspection, schedule site survey
6. **Conduct Site Survey** — Surveyor inspects site, documents conditions, captures data
7. **Create Engineering Assessment** — Technical team evaluates requirements and designs solution
8. **Prepare Proposal** — Sales and engineering collaborate on proposal document
9. **Generate Quotation** — Pricing is calculated based on assessment, BoQ, and rate cards
10. **Send Quotation** — Quotation is delivered to client with proposal
11. **Negotiate** — Client reviews, requests adjustments; iterate on terms and pricing
12. **Accept Quotation** — Client formally accepts the quotation
13. **Draft Contract** — Legal and commercial teams draft contract from accepted quotation
14. **Review & Approve Contract** — Internal approval workflow based on contract value
15. **Client Signs Contract** — Client executes the contract
16. **Counter-Sign Contract** — Triangle Black signs to finalize
17. **Activate Contract** — Contract is marked active; project initiation triggered

**End Event:** Contract signed and activated

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Marketing User | Creates campaigns, generates leads | CRM, Marketing |
| Sales Rep | Qualifies leads, develops opportunities, sends quotations | CRM, Quotation |
| Sales Manager | Reviews quotations, approves discounts | CRM, Quotation |
| Site Surveyor | Conducts physical site inspections | Project |
| Engineer | Creates technical assessments and designs | Project |
| Proposal Specialist | Drafts proposal documents | Proposal, Document |
| Pricing Analyst | Calculates costs and margins | Quotation |
| Legal Counsel | Drafts and reviews contract terms | Contract |
| Director/CEO | Approves high-value contracts | Contract |
| Client | Receives documents, negotiates, signs | ClientPortal, Email |
| System | Automates notifications, scoring, document generation | All |

---

## Inputs

| Input | Source | Format |
|-------|--------|--------|
| Marketing campaign data | Marketing system | Structured data |
| Inbound inquiry | Website, email, phone | Lead record |
| Client requirements | Sales meetings, RFP document | Notes, documents |
| Site survey data | Site visit | Survey report |
| Engineering specifications | Engineering team | Technical document |
| Rate cards and price lists | Finance | Pricing data |
| Contract templates | Legal | Document templates |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Qualified lead | Lead with score and status | CRM |
| Sales opportunity | Opportunity with value and stage | CRM |
| Site survey report | Condition documentation | Project |
| Engineering assessment | Technical requirements | Project |
| Proposal document | Solution description | Client |
| Quotation | Priced offer | Client |
| Signed contract | Executed agreement | Contract, Document |
| Project initiation trigger | Event to start project | Project |

---

## Business Rules

- Lead score must be >= 50 for automatic qualification
- Site survey must be completed before quotation for projects > $50,000
- Quotations require director approval if margin < 15%
- Discounts > 10% require manager approval; > 20% require director approval
- Contracts > $100,000 require director signature; > $500,000 require CEO signature
- Quotation validity: 30 days standard
- Contract must be signed within 90 days of quotation acceptance

---

## Documents Involved

| Document | Created By | Used By |
|----------|-----------|---------|
| Lead record | CRM | Sales |
| Opportunity record | CRM | Sales, Management |
| Site survey report | Surveyor | Engineering, Sales |
| Engineering assessment | Engineer | Proposal, Quotation |
| Proposal document | Sales/Engineering | Client |
| Bill of Quantities | Estimator | Quotation |
| Quotation document | Pricing | Client, Sales |
| Contract draft | Legal | Client, Legal |
| Signed contract | All parties | Legal, Project |
| Non-disclosure agreement (if needed) | Legal | Client, Legal |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Lead-to-Opportunity conversion rate | > 25% | Opportunities / Qualified Leads |
| Opportunity-to-Won rate | > 35% | Won Opportunities / Total Opportunities |
| Average sales cycle length | < 90 days | Contract signed date - Lead created date |
| Quotation-to-Contract cycle | < 30 days | Contract date - Quotation accepted date |
| Quotation accuracy (margin variance) | < 5% variance | Actual margin vs quoted margin |
| Average deal size | > $100,000 | Total contract value / Won deals |
| Site survey turnaround | < 5 business days | Survey report date - Survey date |
| Pipeline coverage ratio | > 3x | Total pipeline value / Quarterly target |
