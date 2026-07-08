# Handover — Project Handover to Client

## Overview

The handover process ensures the formal, structured transfer of completed projects to the client, including all deliverables, documentation, training, and warranty information.

---

## BPMN Description

**Start Event:** Project substantially complete (works finished, punch list items remaining)

1. **Prepare Handover Plan** — Define handover scope, schedule, and responsibilities
2. **Compile Deliverables** — Gather all project deliverables per contract
3. **Complete As-Built Documentation** — Update drawings, specs, and manuals to as-built status
4. **Prepare O&M Manuals** — Operating and maintenance instructions for installed systems
5. **Compile Certificates** — Gather all test certificates, warranties, and compliance documents
6. **Conduct Pre-Handover Inspection** — Joint inspection with client
7. **Create Punch List** — Document incomplete or defective items
8. **Resolve Punch List Items** — Complete outstanding work
9. **Verify Resolutions** — Client re-inspects and signs off
10. **Conduct Systems Demonstration** — Show client how systems operate
11. **Provide Training** — Train client facility team on operations and maintenance
12. **Complete Final Cleaning** — Site cleaned and prepared for handover
13. **Transfer Spare Parts** — Hand over spare parts, consumables, and special tools
14. **Prepare Handover Certificate** — Formal handover document
15. **Sign Handover Certificate** — Both parties sign to confirm acceptance
16. **Release Retention** — Release retention money per contract terms
17. **Submit Final Invoice** — Submit final billing
18. **Activate Warranty Period** — Start warranty clock
19. **Transfer to Maintenance** — Hand over maintenance responsibility

**End Event:** Project handed over and warranty period started

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Project Manager | Leads handover process | Project |
| Site Supervisor | Resolves punch list items | Project |
| QA/QC Inspector | Verifies quality documentation | QA/QC |
| Document Controller | Manages handover documentation | Document |
| Client Facility Manager | Receives systems and documentation | ClientPortal |
| Client Representative | Signs off on handover | ClientPortal, Email |
| Training Coordinator | Delivers client training | Project |
| Finance / Accounts | Handles retention and final billing | Finance |
| Maintenance Team | Takes over maintenance responsibility | Maintenance |

---

## Inputs

| Input | Source |
|-------|--------|
| Completed works | Project Execution |
| As-built documentation | Project, Document |
| Test certificates and quality records | QA/QC |
| O&M manual drafts | Project, Engineering |
| Equipment warranties | Vendors, Procurement |
| Spare parts list | Project, Procurement |
| Contract requirements | Contract |
| Punch list (pre-handover) | Pre-handover inspection |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| As-built drawings | Final record drawings | Client, Document |
| O&M manuals | Operating instructions | Client, Document |
| Certificates and compliance docs | Quality and test records | Client, Document |
| Training records | Proof of training delivered | Client, Document |
| Spare parts inventory | Transferred spares list | Client |
| Handover certificate | Signed acceptance | Contract, Client |
| Warranty certificate | Warranty documentation | Client, Maintenance |
| Final invoice | Completed project billing | Finance, Client |
| Project close-out report | Final project summary | Management |
| Maintenance handover | System data to maintenance team | Maintenance |

---

## Business Rules

- Handover cannot be completed until all punch list items are resolved
- O&M manuals must be in both hard copy (2 sets) and digital format
- Systems demonstration must be completed before handover certificate signing
- Client training must cover all installed systems and safety procedures
- Warranty period starts on handover certificate date (unless otherwise specified)
- Standard warranty period: 12 months (or as specified in contract)
- Retention is released upon handover certificate signing (or per contract)
- Final invoice submitted within 14 days of handover
- All project documentation archived within 30 days of handover

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Handover plan | Handover schedule and responsibilities |
| As-built drawings | Final record drawings |
| O&M manuals | Operation and maintenance documentation |
| Equipment warranties | Warranty certificates |
| Test certificates | Quality compliance records |
| Spare parts list | Transferred spares inventory |
| Training records | Training attendance and materials |
| Punch list | Outstanding items at pre-handover |
| Handover certificate | Formal acceptance document |
| Final completion certificate | Official project completion |
| Warranty certificate | Warranty terms and period |
| Project close-out report | Final project summary |
| Asset register | Installed equipment list |
| Maintenance schedule | Recommended maintenance plan |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Handover cycle time | < 30 days | Pre-handover - Certificate signed |
| Punch list size at pre-handover | < 20 items | Open items |
| Punch list resolution time | < 15 days | Listed - Resolved |
| Documentation completeness | 100% | Documents submitted / Required |
| Handover on schedule | > 90% | On-time handovers / Total |
| Client satisfaction (handover survey) | > 4.0 / 5.0 | Survey score |
| Training completion rate | 100% | Training delivered / Training required |
| Warranty claims in first 6 months | < 5% of projects | Projects with claims / Total projects |
| Retention recovery time | < 60 days | Handover - Retention received |
