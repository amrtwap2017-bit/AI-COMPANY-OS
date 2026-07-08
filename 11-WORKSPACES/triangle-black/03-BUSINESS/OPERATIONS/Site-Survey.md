# Site Survey — Physical Inspection Process

## Overview

The site survey process involves dispatching a qualified surveyor to a hotel property to physically inspect engineering systems, building conditions, and infrastructure. This data feeds into the engineering assessment and quotation processes.

---

## BPMN Description

**Start Event:** Site survey request approved (from sales or project)

1. **Schedule Survey** — Coordinate date/time with client and assign surveyor
2. **Prepare Survey Checklist** — Define scope of inspection based on project requirements
3. **Review Existing Documentation** — Gather building plans, previous reports, asset registers
4. **Conduct Site Visit** — Surveyor visits hotel property
5. **Inspect MEP Systems** — Mechanical, electrical, plumbing inspection
6. **Inspect Building Fabric** — Structural elements, finishes, roofing, facades
7. **Inspect Fire & Safety Systems** — Fire alarms, sprinklers, extinguishers, emergency exits
8. **Inspect HVAC Systems** — Heating, ventilation, air conditioning equipment
9. **Document Conditions** — Take photographs, measurements, notes
10. **Identify Deficiencies** — Note issues, wear, damage, or non-compliance
11. **Record Utility Data** — Meter readings, energy consumption, capacity data
12. **Discuss Findings with Client** — Preliminary verbal summary at site
13. **Prepare Survey Report** — Compile findings into formal report
14. **Submit Report** — Upload to system and share with requesting team

**End Event:** Survey report completed and submitted

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Site Surveyor | Conducts physical inspection | Project, Document |
| Sales Rep | Requests survey, uses results | CRM, Quotation |
| Project Manager | Coordinates survey for active projects | Project |
| Engineer | Reviews survey for technical assessment | Project |
| Client (Hotel) | Provides access, coordinates on-site | Email, Phone |
| Survey Scheduler | Coordinates scheduling | Project, Calendar |

---

## Inputs

| Input | Source |
|-------|--------|
| Survey request | Sales/Project |
| Client contact and location | CRM |
| Building plans and documents | Client / Document |
| Previous survey reports (if any) | Document |
| Survey checklist template | Document |
| Project scope requirements | Project |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Site survey report | Detailed findings with photos | Document, Project |
| Condition reports | Asset-by-asset condition grades | Engineering Assessment |
| Photographic evidence | Timestamped and annotated photos | Document |
| Measurement data | Dimensions, capacities, readings | Engineering Assessment |
| Deficiency list | Issues requiring attention | Quotation, Project |
| Utility data | Meter readings, consumption | Engineering Assessment |

---

## Business Rules

- Survey must be scheduled within 5 business days of request
- Survey report must be submitted within 5 business days of site visit
- Surveyor must have completed safety induction before accessing site
- Photographs must be geotagged and timestamped
- At least 10 condition photos required per major system inspected
- All deficiencies must be photographed and described
- Client representative must accompany survey during walkthrough

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Survey request form | Initiation of survey process |
| Survey checklist | Scope and items to inspect |
| Site survey report | Comprehensive findings document |
| Condition report | Per-asset condition grading |
| Photographic log | Indexed and captioned photos |
| Measurement sheet | Dimensions and technical data |
| Client sign-off sheet | Client acknowledgment of survey |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Scheduling turnaround | < 5 business days | Request date - Survey date |
| Report turnaround | < 5 business days | Survey date - Report submission |
| Report completeness score | > 90% | Checklist items completed |
| On-time survey rate | > 95% | Surveys on schedule / Total surveys |
| Resurvey rate | < 5% | Resurveys required / Total surveys |
| Photo documentation rate | > 10 per system | Photos taken / Systems inspected |
