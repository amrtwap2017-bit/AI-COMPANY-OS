# Hotel Opening Projects

| Field | Value |
|---|---|
| Document ID | 04-Hospitality-Knowledge-26 |
| Document Purpose | Define the engineering scope and process for hotel opening and renovation projects |
| Version | 1.0 |
| Status | Review |

---

## Overview

Hotel opening projects are among the most complex engineering undertakings in hospitality. They involve coordinating multiple contractors, suppliers, and stakeholders under extreme time pressure to deliver a fully operational hotel by a fixed opening date.

---

## Project Phases

### Phase 1: Pre-Construction (6-12 months before opening)
- Engineering team hiring (Chief Engineer, supervisors, technicians)
- Engineering store setup (shelving, systems, initial stock)
- Spare parts procurement (critical spares ordered)
- Engineering systems review (design, specifications, equipment selection)
- Commissioning plan development
- O&M manual collection from contractors

### Phase 2: Construction & Installation (3-6 months before opening)
- Daily site walks to observe installation quality
- Punch list creation for engineering systems
- Equipment tagging and asset registration
- Testing and commissioning witness
- Spare parts receiving and stocking
- Engineering store operational

### Phase 3: Pre-Opening (1-3 months before opening)
| Activity | Timeline |
|---|---|
| All systems commissioned | T-90 days |
| Guest room inspection and testing | T-60 days |
| Pool and spa commissioning | T-60 days |
| Kitchen and laundry commissioning | T-45 days |
| Staff training on all systems | T-30 days |
| Test occupancy (friends and family) | T-14 days |
| Full load test | T-7 days |
| Opening readiness inspection | T-3 days |

### Phase 4: Opening & Stabilization (0-3 months after opening)
- 24/7 engineering coverage
- Rapid response to teething issues
- Contractor callbacks for warranty issues
- Guest complaint tracking and resolution
- PM program activation
- Energy consumption baseline establishment

### Phase 5: Steady State (3+ months after opening)
- Full PM program operational
- Engineering team at normal staffing levels
- Spare parts inventory stabilized
- Energy optimization begins
- Warranty claim management

---

## Key Engineering Systems Checklist

| System | Commissioning Required | Opening Verification |
|---|---|---|
| HVAC — Central plant | Full load test | All zones reaching setpoint |
| HVAC — Guest rooms | 100% room test | Temperature, noise, controls |
| Electrical — Main distribution | Load bank test | All panels labeled and balanced |
| Electrical — Generator | Full load test | ATS operation, fuel system |
| Electrical — UPS | Runtime test | Connected loads verified |
| Fire — Detection | 100% device test | All detectors, panels, annunciators |
| Fire — Suppression | Flow test | Pumps, tanks, sprinklers |
| Plumbing — Water | Pressure test, flushing | All fixtures operational |
| Plumbing — Drainage | Smoke test | All drains flowing |
| Kitchen | Full production test | All equipment operational |
| Laundry | Full production test | All equipment operational |
| Pools | Circulation test, chemical test | All systems operational |
| BMS | Point-to-point test | All points communicating |
| Elevators | Load test, travel test | All cars operational |
| Security | Access control test | All doors, cameras, safes |

---

## Common Opening Engineering Problems

| Problem | Prevention |
|---|---|
| Incomplete O&M manuals | Contractual requirement with holdback payment |
| Missing spare parts | Early critical spares list and procurement |
| Untrained staff | Structured training program with sign-off |
| Incorrect labeling | Verification walk before opening |
| Contractor not responding | Warranty period in contract with SLA |
| Guest room defects incomplete | Systematic room inspection program |

---

## AI Opportunities

- Commissioning checklist automation and completion tracking
- Defect pattern analysis across rooms (identify systemic issues)
- Warranty claim auto-generation from defect data
- Punch list item categorization and priority assignment
- Opening schedule risk analysis (critical path prediction)
- Knowledge base of opening lessons learned for future projects

## Traceability

| Relation | Reference |
|---|---|
| Related Business Capability | Engineering Delivery — Projects |
| Related Workflow | 06-Operations/Project-Execution.md, Handover.md |
| Related Database Tables | projects, project_milestones, project_deliverables, assets |
| Related APIs | POST /v1/projects, PATCH /v1/projects/{id}/milestones |
| Related Roles | Project Manager, Chief Engineer, Commissioning Team |
| Related KPIs | Opening date achieved, Punch list count at opening, Guest room defects |
