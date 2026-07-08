# Quotation — Pricing and Quotation Process

## Overview

The quotation process covers the creation, review, approval, and delivery of priced quotations to clients. It integrates with engineering assessments, BoQs, and rate cards to produce accurate, profitable pricing.

---

## BPMN Description

**Start Event:** Opportunity ready for pricing OR engineering assessment completed

1. **Review Scope** — Quotation team reviews scope of work and BoQ
2. **Validate BoQ Items** — Verify quantities and specifications
3. **Apply Rate Cards** — Apply standard rates for labour, materials, equipment
4. **Source Special Pricing** — Obtain supplier quotes for specialized items
5. **Calculate Direct Costs** — Materials, labour, equipment, subcontractors
6. **Add Overhead and Margin** — Apply overhead percentages and target margin
7. **Calculate Total Price** — Sum of all line items with taxes and fees
8. **Apply Discounts (if any)** — Apply approved discounts per authorization
9. **Check Margin** — Verify margin meets minimum threshold
10. **Draft Quotation Document** — Create formal quotation using template
11. **Internal Review** — Sales manager or director reviews pricing
12. **Revise if Needed** — Adjust pricing or scope as required
13. **Obtain Approvals** — Route for approval if margin or discount triggers apply
14. **Generate Final Quotation** — Lock pricing, generate final document
15. **Send to Client** — Deliver quotation with cover note

**End Event:** Quotation sent to client

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Pricing Analyst | Calculates costs and pricing | Quotation |
| Estimator | Prepares BoQ and cost estimates | Quotation |
| Sales Rep | Owns client relationship | CRM, Quotation |
| Sales Manager | Reviews and approves quotations | Quotation |
| Director | Approves low-margin or high-value quotes | Quotation |
| Procurement Team | Provides supplier pricing | Procurement |
| Finance Team | Provides overhead rates and margins | Finance |
| Client | Receives and accepts quotation | Email, ClientPortal |

---

## Inputs

| Input | Source |
|-------|--------|
| BoQ from engineering assessment | Engineering Assessment |
| Scope of work | Proposal / Contract |
| Rate cards | Finance / Quotation |
| Supplier quotations | Procurement |
| Overhead and margin guidelines | Finance |
| Historical project costs | Project / Knowledge base |
| Discount authorization | Sales Manager |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Cost calculation | Detailed cost breakdown | Quotation |
| Quotation document | Formal priced offer | Client |
| Margin analysis | Profitability assessment | Management |
| Approval record | Quotation approval trail | Audit |
| Revised BoQ (if applicable) | Updated quantities | Document |

---

## Business Rules

- Standard margin target: 25% minimum (engineering projects)
- Margin below 15% requires director approval
- Discounts > 10% require sales manager approval; > 20% require director
- Quotations valid for 30 days from issue (standard)
- Prices locked once quotation is sent; revisions create new version
- All quotations must include: validity period, payment terms, delivery terms, exclusions
- Quotations must reference the corresponding opportunity or proposal
- Current year's rate card takes effect January 1st each year

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Bill of Quantities | Itemized scope for pricing |
| Rate card | Standard pricing rates |
| Quotation document | Formal quotation |
| Cost breakdown | Internal cost analysis |
| Supplier quotation | Third-party pricing |
| Margin analysis report | Profitability assessment |
| Discount approval form | Authorization for discounts |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Quotation turnaround | < 5 business days | Request - Quotation sent |
| Quotation accuracy (margin variance) | < 5% | Actual margin vs quoted margin |
| Quotation-to-order conversion | > 50% | Accepted quotations / Sent quotations |
| Average margin achieved | > 25% | (Revenue - Cost) / Revenue |
| Quotation revision rate | < 15% | Revised quotations / Total quotations |
| Approval turnaround (high-value) | < 2 business days | Submit - Approval decision |
| Percentage of auto-approved quotes | > 60% | Auto-approved / Total quotations |
