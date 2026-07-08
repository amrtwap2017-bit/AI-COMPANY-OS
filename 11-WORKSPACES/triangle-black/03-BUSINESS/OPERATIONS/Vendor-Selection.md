# Vendor Selection — Supplier Evaluation and Selection

## Overview

The vendor selection process ensures that suppliers are rigorously evaluated, qualified, and selected based on objective criteria including price, quality, delivery capability, financial stability, and past performance.

---

## BPMN Description

**Start Event:** Procurement need identified requiring vendor selection OR new vendor registration request

1. **Identify Vendor Requirements** — Define evaluation criteria (technical, commercial, compliance)
2. **Search Vendor Database** — Check existing approved vendor list
3. **Identify Potential Vendors** — Source new vendors if existing list insufficient
4. **Issue Vendor Questionnaire** — Send pre-qualification questionnaire
5. **Collect Vendor Documents** — Business license, tax registration, certifications, references
6. **Evaluate Documentation** — Verify completeness and authenticity
7. **Score Preliminary Qualification** — Pass/fail based on mandatory criteria
8. **Shortlist Vendors** — Select vendors for detailed evaluation
9. **Issue RFQ** — Send detailed request for quotation
10. **Receive Proposals** — Collect vendor responses
11. **Evaluate Technical Proposal** — Score technical compliance
12. **Evaluate Commercial Proposal** — Score pricing and commercial terms
13. **Conduct Reference Checks** — Contact past clients
14. **Evaluate Financial Stability** — Review financial statements or credit rating
15. **Prepare Evaluation Matrix** — Weighted scoring across all criteria
16. **Rank Vendors** — Sort by total weighted score
17. **Select Preferred Vendor** — Highest-ranked vendor recommended
18. Obtain Management Approval — Approve vendor selection
19. **Notify Vendors** — Inform selected and non-selected vendors
20. **Add to Approved Vendor List** — Register vendor if new

**End Event:** Vendor selected and notified

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Procurement Officer | Manages evaluation process | Procurement |
| Technical Evaluator | Scores technical proposals | Project, Procurement |
| Commercial Evaluator | Scores commercial proposals | Procurement |
| HSE / Compliance Officer | Reviews safety and compliance | Procurement |
| Finance Analyst | Reviews financial stability | Finance |
| Procurement Manager | Approves selection | Procurement |
| Vendors | Submit proposals and documents | Vendor portal |

---

## Inputs

| Input | Source |
|-------|--------|
| Vendor requirements specification | Procurement, Project |
| Vendor list (existing) | Procurement |
| Vendor questionnaire responses | Vendors |
| Financial documents | Vendors |
| Reference contacts | Vendors / Industry |
| RFQ responses | Vendors |
| Past performance data | Procurement |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Evaluation matrix | Weighted scores for all vendors | Procurement |
| Vendor ranking | Ranked list with scores | Procurement |
| Selection recommendation | Preferred vendor with justification | Management |
| Award notification | Formal selection communication | Vendors |
| Approved vendor list update | New vendor registration | Procurement |
| Contract award (if applicable) | Framework agreement | Contract |

---

## Business Rules

- Minimum 3 vendors evaluated for procurement > $5,000
- Price weight maximum: 40% of total evaluation score
- Technical compliance must be >= 70% to proceed to commercial evaluation
- New vendors must pass a pre-qualification before RFQ participation
- Vendors with safety incidents in past 2 years are automatically disqualified for high-risk work
- Financial stability minimum: current ratio >= 1.2
- Conflict of interest declaration required from all evaluators

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Vendor pre-qualification form | Initial qualification |
| Vendor questionnaire | Capability assessment |
| RFQ document | Request for quotation |
| Technical evaluation sheet | Technical scoring |
| Commercial evaluation sheet | Pricing scoring |
| Evaluation matrix | Consolidated weighted scores |
| Reference check report | Client feedback |
| Financial assessment report | Financial health analysis |
| Selection recommendation | Final recommendation report |
| Award letter | Notification to selected vendor |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Evaluation cycle time | < 15 business days | RFQ deadline - Selection decision |
| Number of vendors evaluated per RFQ | >= 3 | Vendors evaluated / RFQ |
| New vendor onboarding time | < 10 business days | Application - Approval |
| Vendor qualification pass rate | > 60% | Qualified / Total applicants |
| Evaluation rework rate | < 10% | Re-evaluations / Total evaluations |
| Selected vendor performance score | > 80% | Post-award performance rating |
| Cost competitiveness (avg premium over budget) | < 5% | (Selected price - Budget) / Budget |
