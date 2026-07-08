# Maintenance — Ongoing Maintenance Operations

## Overview

The maintenance process covers planned preventive maintenance, corrective maintenance, emergency repairs, and condition monitoring of installed systems at hotel properties. It ensures client assets operate reliably and efficiently throughout the warranty period and beyond.

---

## BPMN Description

**Start Event:** Scheduled maintenance due OR client reports issue OR warranty claim received

### Preventive Maintenance Track
1. **Review Maintenance Schedule** — Check upcoming PM tasks
2. **Prepare Work Order** — Create work order with task details
3. **Assign Technician** — Allocate qualified technician
4. **Schedule Site Visit** — Coordinate with client for access
5. **Gather Tools and Parts** — Prepare required equipment and spares
6. **Conduct Maintenance** — Perform scheduled maintenance tasks
7. **Record Findings** — Document condition, readings, and work performed
8. **Update Asset Records** — Log maintenance history for each asset
9. **Complete Service Report** — Formal report of work performed
10. **Client Sign-Off** — Client confirms work completed satisfactorily

### Corrective Maintenance Track
1. **Receive Fault Report** — Client or system reports a fault
2. **Log Service Request** — Create service request in system
3. **Assess Urgency** — Determine priority (emergency/urgent/routine)
4. **Dispatch Technician** — Send appropriate resource
5. **Diagnose Fault** — Identify root cause
6. **Estimate Repair** — Provide cost and time estimate (if chargeable)
7. **Client Approves Repair** — Client authorizes work (if chargeable)
8. **Perform Repair** — Fix the issue
9. **Test System** — Verify proper operation
10. **Complete Service Report** — Document work performed
11. **Client Sign-Off** — Client confirms issue resolved

**End Event:** Maintenance completed and documented

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Maintenance Coordinator | Schedules and dispatches work | Maintenance |
| Service Technician | Performs maintenance and repairs | Maintenance |
| Maintenance Manager | Oversees maintenance operations | Maintenance |
| Client Facility Manager | Coordinates access, approves work | ClientPortal, Email |
| Client | Reports issues, signs off | Phone, Email, ClientPortal |
| Spare Parts Manager | Ensures parts availability | Inventory |
| Warranty Administrator | Manages warranty claims | Contract, Maintenance |
| Account Manager | Manages client relationship | CRM |

---

## Inputs

| Input | Source |
|-------|--------|
| Maintenance schedule | Handover, Maintenance plan |
| Service request / Fault report | Client, System |
| Equipment manuals and specs | Handover, Document |
| Asset register | Handover, Maintenance |
| Spare parts inventory | Inventory |
| Warranty terms | Contract, Handover |
| Maintenance history | Maintenance |
| SLA commitments | Contract |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Work order | Authorized maintenance task | Technician |
| Service report | Completed work record | Client, Document |
| Asset maintenance history | Updated service log | Maintenance |
| Fault diagnosis report | Root cause analysis | Client, Maintenance |
| Repair estimate | Cost and timeline for repair | Client |
| Client sign-off | Acceptance of completed work | Contract, Maintenance |
| Spare parts consumption | Parts used record | Inventory |
| Maintenance schedule update | Updated PM plan | Maintenance |
| Invoice (if chargeable) | Billing for non-warranty work | Finance, Client |
| Escalation record | Unresolved issues | Management |

---

## Business Rules

- Emergency response: within 4 hours of notification
- Urgent response: within 24 hours
- Routine response: within 5 business days
- Preventive maintenance due within 7 days of scheduled date
- All maintenance work requires signed service report
- Chargeable repairs require client approval before work begins
- Warranty work must be verified against contract warranty terms
- Spare parts used must be recorded against asset and work order
- Monthly maintenance reports provided to client

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Preventive maintenance schedule | Planned maintenance calendar |
| Work order | Authorized task |
| Service report | Completed work documentation |
| Fault report | Issue description and diagnosis |
| Repair estimate | Cost and time estimate |
| Asset maintenance log | Per-asset service history |
| Spare parts requisition | Parts request |
| Client sign-off form | Work acceptance |
| Monthly maintenance report | Summary of activities |
| SLA compliance report | Performance against SLAs |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| PM completion rate | > 95% | PM tasks completed / PM tasks scheduled |
| PM on-time rate | > 90% | PM completed on due date / Total PM |
| Emergency response time | < 4 hours | Notification - Technician on site |
| Urgent response time | < 24 hours | Notification - Technician on site |
| First-time fix rate | > 80% | Fixed first visit / Total visits |
| Mean time to repair (MTTR) | Per asset target | Total repair time / Number of repairs |
| Mean time between failures (MTBF) | Per asset target | Operating time / Number of failures |
| Service report turnaround | < 2 business days | Work done - Report submitted |
| Client satisfaction score | > 4.0 / 5.0 | Post-service survey |
| Repeat repair rate (same fault) | < 5% | Repeat visits / Total visits |
| SLA compliance | > 95% | Compliant service events / Total events |
