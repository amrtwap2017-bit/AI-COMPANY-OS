# Proposal — Creating and Delivering Engineering Proposals

## Overview

The proposal process covers the creation, review, approval, and delivery of engineering proposals to prospective clients. Proposals include the technical solution, scope of work, approach, timeline, and commercial terms.

---

## BPMN Description

**Start Event:** Opportunity identified requiring a formal proposal

1. **Review Client Requirements** — Analyze RFP, RFQ, or client brief
2. **Assemble Proposal Team** — Assign proposal manager, technical writer, engineers
3. **Develop Technical Approach** — Define solution methodology and approach
4. **Draft Scope of Work** — Detailed description of deliverables and activities
5. **Create Project Timeline** — Milestone schedule with key dates
6. **Request Quotation Input** — Engage pricing team for cost data
7. **Develop Commercial Section** — Pricing summary, payment terms, commercial conditions
8. **Add Company Credentials** — Company profile, experience, case studies
9. **Review Proposal Draft** — Quality review for accuracy, completeness, compliance
10. **Incorporate Feedback** — Revise based on review comments
11. **Obtain Internal Approvals** — Management approval per authorization matrix
12. **Format and Brand** — Apply company templates and branding
13. **Deliver to Client** — Submit via email, portal, or physical delivery
14. **Confirm Receipt** — Follow up to confirm client received the proposal
15. **Track Response** — Monitor for client feedback, questions, or decision

**End Event:** Proposal delivered to client

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Proposal Manager | Owns proposal process and timeline | Proposal, Project |
| Technical Writer | Drafts proposal content | Proposal, Document |
| Design Engineer | Provides technical input | Project |
| Sales Rep | Provides client context, delivers proposal | CRM |
| Pricing Analyst | Provides cost and pricing data | Quotation |
| Legal Counsel | Reviews legal and commercial terms | Contract |
| Sales Manager | Approves proposal | CRM, Quotation |
| Graphics/Design | Creates diagrams and visuals | Document |
| Client | Receives and evaluates proposal | Email, ClientPortal |

---

## Inputs

| Input | Source |
|-------|--------|
| Client RFP/RFQ/brief | Client |
| Site survey report | Site Survey |
| Engineering assessment | Engineering Assessment |
| BoQ and pricing data | Quotation |
| Company credentials and case studies | Marketing, Document |
| Proposal templates | Document |
| Commercial terms framework | Contract |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Technical proposal | Solution description and approach | Client |
| Scope of work | Detailed deliverables | Client, Contract |
| Project timeline | Milestone schedule | Client, Project |
| Pricing section | Commercial offer | Client, Quotation |
| Company credentials | Experience and qualifications | Client |
| Proposal submission | Complete proposal package | Client |

---

## Business Rules

- Proposals must follow standard template and branding guidelines
- All proposals must include scope of work, timeline, pricing, and terms
- Proposals require manager approval before delivery
- Proposals with value > $500,000 require director review
- Proposal validity period must be stated (standard 30 days)
- RFP compliance matrix must be completed for formal RFPs
- Confidentiality agreements must be in place before sharing proprietary information

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Proposal document | Complete proposal package |
| RFP compliance matrix | Requirement mapping |
| Scope of work | Deliverable and activity definitions |
| Project schedule | Timeline and milestones |
| Pricing sheet | Cost breakdown and total |
| Company profile | Credentials and experience |
| Case studies | Relevant project examples |
| Client feedback form | Proposal evaluation |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Proposal turnaround | < 15 business days | RFP receipt - Proposal delivery |
| Win rate (proposals submitted) | > 40% | Won proposals / Total proposals |
| RFP compliance score | > 95% | Compliant responses / Total requirements |
| On-time delivery rate | > 90% | On-time proposals / Total proposals |
| Proposal revision cycle | < 3 rounds | Internal revisions per proposal |
| Client response time | < 30 days | Delivery to client decision |
