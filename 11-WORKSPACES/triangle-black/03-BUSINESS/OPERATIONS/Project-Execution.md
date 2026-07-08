# Project Execution — Engineering Project Execution

## Overview

The project execution process covers the end-to-end management of engineering projects from kickoff through to completion, including planning, resource management, execution monitoring, change management, and reporting.

---

## BPMN Description

**Start Event:** Contract signed and project initiation triggered

1. **Conduct Project Kickoff** — Internal kickoff meeting with project team
2. **Develop Project Plan** — Detailed schedule, resource plan, budget baseline
3. **Assign Project Team** — Allocate project manager, engineers, supervisors, trades
4. **Procure Materials and Equipment** — Trigger procurement workflow
5. **Mobilize to Site** — Set up site offices, utilities, storage, safety
6. **Conduct Site Induction** — Safety and site orientation for all personnel
7. **Execute Works** — Perform engineering activities per plan
8. **Monitor Progress** — Track against schedule, budget, quality, safety
9. **Manage Subcontractors** — Coordinate and supervise subcontractor activities
10. **Process Change Orders** — Manage scope changes, variations, and claims
11. **Track Issues and Risks** — Log, monitor, and resolve issues and risks
12. **Conduct Progress Meetings** — Weekly progress reviews with team
13. **Report to Stakeholders** — Progress reports to client, management
14. **Manage Quality** — Conduct inspections and quality checks
15. **Manage Safety** — Daily safety briefings, inspections, incident reporting
16. **Control Costs** — Track actual vs budget; forecast at completion
17. **Manage Documentation** — Maintain project documentation register
18. **Complete Works** — All activities completed per scope
19. **Prepare for Handover** — Compile as-built docs, test results, O&M manuals
20. **Conduct Pre-Handover Inspection** — Internal quality review before client handover

**End Event:** Works completed and ready for handover

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Project Manager | Owns project delivery | Project, Dashboard |
| Site Supervisor | Manages day-to-day site activities | Project |
| Project Engineer | Technical oversight and coordination | Project |
| HSE Officer | Safety management | Project |
| QA/QC Inspector | Quality control | QA/QC |
| Procurement Officer | Material and subcontractor procurement | Procurement |
| Store Keeper | Site inventory management | Inventory |
| Subcontractors | Execute specialized work | External |
| Client Representative | Client oversight and approval | ClientPortal, Email |
| Project Accountant | Cost control and reporting | Finance |
| Senior Management | Project oversight | Dashboard |

---

## Inputs

| Input | Source |
|-------|--------|
| Signed contract | Contract |
| Project scope / SOW | Proposal, Contract |
| Engineering assessment | Engineering Assessment |
| BoQ and specifications | Engineering Assessment |
| Budget and schedule baseline | Finance, Project |
| Resource availability | Resource planning |
| Permits and approvals | Client, Regulatory |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Project plan | Detailed execution plan | Project team |
| Progress reports | Weekly/monthly status | Client, Management |
| Site instructions | Direction to site team | Site team |
| Change orders | Scope/budget/schedule changes | Contract, Client |
| Inspection reports | Quality check results | QA/QC |
| Safety reports | Incident and compliance reports | HSE |
| Daily work logs | Labour and activity records | Project |
| Cost reports | Budget tracking and forecasts | Finance, Management |
| As-built documentation | Record drawings and specs | Document, Handover |
| Completed works | Ready for handover | Handover |

---

## Business Rules

- Project kickoff must occur within 5 business days of contract activation
- Progress meetings required weekly with written minutes
- Change order required for any budget impact > 5% or schedule impact > 10%
- Daily site diary required for all active project days
- HSE incident reporting within 4 hours of any incident
- Monthly cost forecast reconciliation required
- Subcontractor payments tied to verified work completion
- Project documentation register must be maintained and current

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Project plan | Schedule, resource, budget plan |
| Kickoff meeting minutes | Project initiation record |
| Progress report | Weekly/monthly status |
| Site diary / work log | Daily activity record |
| Inspection test plan | Quality inspection schedule |
| Non-conformance report | Quality issue record |
| Change order | Scope variation document |
| Risk register | Project risk log |
| Issue log | Project issues and actions |
| Site instruction | Direction to contractor/subcontractor |
| Safety incident report | HSE incident record |
| Meeting minutes | Progress and stakeholder meetings |
| Cost forecast | Budget vs actual report |
| As-built drawings | Record of constructed works |
| Handover document package | Pre-handover compilation |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Schedule performance (SPI) | >= 0.95 | Earned Value / Planned Value |
| Cost performance (CPI) | >= 0.95 | Earned Value / Actual Cost |
| On-time completion | > 85% | Projects completed on time / Total |
| Within-budget completion | > 85% | Projects within budget / Total |
| Change order frequency | < 3 per project | Change orders / Project |
| Rework cost | < 5% of project cost | Rework cost / Total project cost |
| Safety incident rate | 0 (target) | Recordable incidents / 200,000 hours |
| RFI response time | < 48 hours | RFI submitted - Response provided |
| Documentation completeness | > 90% | Docs submitted / Docs required |
