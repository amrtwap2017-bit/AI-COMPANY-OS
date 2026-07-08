# Engineering Assessment — Technical Assessment and Design

## Overview

The engineering assessment process transforms site survey data and client requirements into detailed technical specifications, system designs, and engineering solutions. This is the bridge between field observations and buildable project plans.

---

## BPMN Description

**Start Event:** Site survey report received OR client RFP with technical requirements

1. **Review Survey Report** — Engineer reviews survey findings, photographs, and condition data
2. **Clarify Requirements** — Follow up with client or sales on any gaps
3. **Analyze Existing Systems** — Evaluate current system performance, capacity, and condition
4. **Define Technical Requirements** — Determine what needs to be designed or specified
5. **Develop Design Concepts** — Create alternative solution approaches
6. **Perform Calculations** — Load calculations, sizing, capacity analysis, energy modeling
7. **Select Equipment & Materials** — Specify makes, models, quantities
8. **Create Technical Specifications** — Detailed specs for each system
9. **Prepare Design Drawings** — CAD drawings, schematics, layouts
10. **Create Bill of Quantities** — Itemized list of materials and equipment
11. **Review Assessment** — Peer review by senior engineer
12. **Incorporate Feedback** — Revise based on review comments
13. **Obtain Approvals** — Senior engineer or director approval
14. **Package Deliverables** — Compile specifications, drawings, BoQ
15. **Submit to Requestor** — Make available to sales/quotation/project teams

**End Event:** Engineering assessment completed and approved

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Design Engineer | Creates technical designs and specs | Project, Document |
| Senior Engineer | Reviews and approves assessments | Project |
| Engineering Manager | Allocates resources, prioritizes work | Project |
| Sales Rep | Provides client requirements | CRM |
| Site Surveyor | Provides field data | Project |
| CAD Technician | Produces design drawings | CAD tools, Document |
| Estimator | Uses BoQ for pricing | Quotation |
| Client (if needed) | Reviews design concepts | Email, Meetings |

---

## Inputs

| Input | Source |
|-------|--------|
| Site survey report | Site Survey process |
| Client RFP / requirements | Client / Sales |
| Existing building plans | Client / Document |
| Technical standards and codes | External / Knowledge base |
| Equipment catalogues | Vendors / Knowledge base |
| Previous assessment designs | Document |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Technical specifications | Detailed system requirements | Quotation, Project |
| Design drawings | CAD files, schematics | Project, Document |
| Bill of Quantities | Itemized materials and equipment | Quotation, Procurement |
| Equipment schedules | Lists of specified equipment | Procurement, Project |
| Design calculations | Supporting engineering calculations | Document |
| System performance data | Expected performance metrics | Project |
| Approved assessment package | Final approved deliverables | All downstream |

---

## Business Rules

- All assessments must be peer-reviewed by a senior engineer
- Design must comply with applicable building codes and standards
- Equipment selections must prefer approved vendor list where applicable
- BoQ must follow standard coding structure for cost database integration
- Drawings must follow company CAD standards and layering conventions
- Assessment must be completed within 15 business days of survey report receipt
- Any design deviation from standard specifications requires engineering manager approval

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Engineering assessment report | Comprehensive technical document |
| Technical specifications | System-by-system specifications |
| Design drawings (CAD) | Architectural, MEP, structural drawings |
| Bill of Quantities | Materials, equipment, labour items |
| Load calculations | Mechanical, electrical load analysis |
| Equipment schedules | Specified equipment with models |
| Design review comments | Peer review feedback |
| Compliance checklist | Code and standard compliance |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Assessment turnaround | < 15 business days | Survey report date - Assessment approval |
| Peer review pass rate (first pass) | > 80% | First-pass approved / Total assessments |
| BoQ accuracy (vs actual procurement) | < 5% variance | Estimated qty - Actual qty |
| Design rework rate | < 10% | Rework hours / Total design hours |
| Code compliance rate | 100% | Compliant items / Total items |
| Drawing standard compliance | > 95% | Compliant drawings / Total drawings |
