---
ID: 04-Hospitality-05
Title: Maintenance
Purpose: Document preventive, corrective, and predictive maintenance standards and workflows in hotels
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Hotel Maintenance

## Overview

Maintenance is the largest operational activity in hotel engineering. It encompasses all work done to preserve, repair, and improve building systems and equipment. The quality of maintenance directly impacts guest satisfaction, energy costs, asset lifespan, and regulatory compliance.

## The Maintenance Pyramid

```
          ┌──────────┐
          │Emergency  │  < 5% of work
          │   Repairs │  Highest cost, highest disruption
          ├──────────┤
          │Corrective │  15-25% of work
          │(Planned)  │  Broken but scheduled fix
          ├──────────┤
          │ Preventive│  60-70% of work
          │ (Time/Use)│  Scheduled, systematic
          ├──────────┤
          │Predictive │  5-10% of work
          │(Condition)│  Data-driven, optimal timing
          ├──────────┤
          │Proactive  │  < 5% of work
          │(Improve)  │  Reliability engineering
          └──────────┘
```

## Preventive Maintenance (PM)

The systematic inspection, cleaning, lubrication, adjustment, and replacement of components before they fail.

### PM Triggers
- **Calendar-based:** Every X days/weeks/months (e.g., monthly AHU filter change)
- **Run-time-based:** Every X operating hours (e.g., generator oil change every 250 hours)
- **Meter-based:** Every X units of throughput (e.g., pool pump service every 1000 m³ filtered)

### PM Program Structure

| PM Level | Frequency | Who Performs | Examples |
|---|---|---|---|
| Level 1 | Daily | Shift engineer / technician | Visual inspection, log readings |
| Level 2 | Weekly | Technician | Clean strainers, grease bearings |
| Level 3 | Monthly | Skilled technician | Filter change, belt adjustment |
| Level 4 | Quarterly | Specialist technician | Coil cleaning, refrigerant check |
| Level 5 | Semi-Annual | Specialist / Contractor | Comprehensive overhaul |
| Level 6 | Annual | OEM / Certified Contractor | Major service, certification |

### Criticality-Based PM Frequency

| Criticality | Definition | PM Frequency | Response Time Target |
|---|---|---|---|
| A - Critical | Guest safety, business-stopping | Weekly / Monthly | < 30 min |
| B - High | Major inconvenience, costly downtime | Monthly / Quarterly | < 2 hours |
| C - Medium | Moderate impact, can be scheduled | Quarterly / Semi-Annual | < 24 hours |
| D - Low | Minor impact, aesthetic | Annually | Next scheduled |

### PM Documentation

Each PM task should include:
- Equipment ID and location
- Task description with step-by-step instructions
- Safety precautions and lockout/tagout (LOTO) requirements
- Tools and materials needed
- Estimated labor hours
- Acceptance criteria (what "done" looks like)
- Sign-off (technician + supervisor)

## Corrective Maintenance

Unplanned work to restore failed equipment to operational condition.

### Work Order Lifecycle

```
Reported → Logged → Prioritized → Assigned → 
Diagnosed → Parts Ordered (if needed) → 
Repair Executed → Tested → Closed
```

### Priority Levels

| Priority | Response | Target Resolution | Examples |
|---|---|---|---|
| P1 - Critical | Immediate | < 2 hours | No AC in occupied room, no water, fire alarm |
| P2 - High | < 1 hour | < 8 hours | Elevator stuck, pool pump down, kitchen exhaust |
| P3 - Medium | < 4 hours | < 48 hours | Leaking faucet, flickering light, cracked tile |
| P4 - Low | < 24 hours | < 1 week | Aesthetic issues, non-critical convenience items |

### Mean Time Metrics

- **MTBF (Mean Time Between Failures):** Average operating time between failures. Higher is better.
- **MTTR (Mean Time To Repair):** Average time to restore operation. Lower is better.
- **Availability:** MTBF / (MTBF + MTTR). Target > 98% for critical systems.

## Predictive Maintenance (PdM)

Using condition monitoring and data analysis to predict when equipment will fail and perform maintenance just before failure.

### PdM Techniques Used in Hotels

| Technique | What It Detects | Typical Equipment |
|---|---|---|
| Vibration Analysis | Bearing wear, imbalance, misalignment | Motors, pumps, fans, chillers |
| Thermography (Thermal Imaging) | Hot spots, electrical overload, insulation failure | Panels, breakers, motors, steam traps |
| Oil Analysis | Contamination, wear metals, degradation | Compressors, gearboxes, generators |
| Ultrasonic | Air/gas leaks, bearing friction | Steam traps, compressed air, bearings |
| Refrigerant Analysis | Moisture, acid, contamination | Chillers, refrigeration systems |
| Current Signature | Motor winding issues, electrical faults | Pump motors, fan motors |

### Implementation Considerations
- Requires baseline data for each piece of equipment
- Needs trained personnel or contractor support
- Higher upfront cost but reduces overall maintenance spend by 15-30%
- Triangle Black can offer as a value-add service

## Maintenance Planning & Scheduling

### Weekly PM Schedule Template

| Day | Focus Area |
|---|---|
| Monday | Guest rooms (assigned zones) |
| Tuesday | Kitchen & F&B equipment |
| Wednesday | HVAC plant & AHUs |
| Thursday | Electrical systems & emergency lighting |
| Friday | Pool & recreation areas |
| Saturday | Fire safety & life safety systems |
| Sunday | General building & public areas |

### Annual Shutdown Planning

Most hotels schedule a low-season shutdown (1-2 weeks) for major maintenance that requires system downtime:
- Chiller overhaul and refrigerant recharge
- Generator comprehensive service
- High-voltage electrical panel maintenance
- Fire alarm panel upgrade
- Kitchen hood and duct deep cleaning
- Pool resurfacing or tile replacement

## CMMS (Computerized Maintenance Management System)

A CMMS is the software tool used to manage maintenance operations. Key modules:
- Asset registry (equipment database)
- PM scheduler with auto-generation of work orders
- Work order management (create, assign, track, close)
- Inventory / spare parts management
- Labor tracking
- Reporting (KPIs, compliance, cost)

### CMMS Adoption in Hotels
- **High-end chains:** 60-80% use CMMS (e.g., Maintenance Connection, eMaint, SAP)
- **Mid-scale independent:** 20-30% use CMMS; most use spreadsheets or paper
- **Small hotels:** < 10% use any system

### Common CMMS Gaps in Hospitality
- Not designed for hotel-specific equipment hierarchies
- Poor mobile experience for technicians on the move
- No integration with procurement systems for parts ordering
- No guest room integration with PMS for occupancy-based scheduling

## Maintenance KPIs (see also 04-Hospitality-18 Engineering-KPIs.md)

| KPI | Formula | Target |
|---|---|---|
| PM Completion Rate | PMs completed on time / Total PMs due | > 90% |
| Work Order Backlog | Open work orders / Total technicians | < 10 per tech |
| Emergency Work % | Emergency WOs / Total WOs | < 10% |
| MTTR | Total repair time / Number of repairs | Varies by system |
| MTBF | Total operating time / Number of failures | > 1000 hours |
| Cost/Maintenance Hour | Total maintenance cost / Maintenance hours | < $15/hr |
| First-Time Fix Rate | WOs fixed on first visit / Total WOs | > 80% |

## Common Maintenance Mistakes in Hotels

- **Reactive culture:** "Fix when broken" instead of systematic PM
- **Incomplete records:** Work done but not documented
- **"Run to failure" strategy** for non-critical items that become critical
- **Cannibalizing parts:** Taking a part from one system to fix another → creates two problems
- **No root cause analysis:** Same failure repeats because cause wasn't addressed
- **OEM manual ignored:** Maintenance procedures not followed; shortcuts taken
- **Inconsistent quality:** Different technicians do the same job differently

## AI Opportunities

- **Work Order Classification:** NLP to read work request text and auto-assign category, priority, and technician
- **PM Schedule Optimization:** Dynamic PM scheduling based on occupancy, weather, equipment run-time, and technician availability
- **Failure Prediction:** ML models trained on equipment parameters and failure history to predict failures before they happen
- **Root Cause Analysis:** NLG to analyze maintenance history and suggest likely root causes
- **Image-Based Diagnostics:** Technicians photograph failed parts → AI identifies part and provides replacement instructions
- **Maintenance Chatbot:** Guest-facing bot handles common room issue reporting with auto-triage to engineering
- **CMMS Data Cleanup:** Automated deduplication and standardization of equipment records
