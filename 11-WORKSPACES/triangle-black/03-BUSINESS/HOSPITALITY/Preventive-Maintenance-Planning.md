# Preventive Maintenance Planning

| Field | Value |
|---|---|
| Document ID | 04-Hospitality-Knowledge-20 |
| Document Purpose | Define preventive maintenance planning standards for hotel engineering |
| Version | 1.0 |
| Status | Review |
| Dependencies | 04-Hospitality-Knowledge/Maintenance.md |

---

## Overview

Preventive maintenance (PM) is the scheduled inspection, cleaning, and servicing of equipment to prevent unexpected failures and extend asset life. In hotels, PM is the difference between a guest complaint about a broken AC and a perfectly functioning room.

---

## PM Planning Framework

### Step 1: Asset Inventory
- Register all equipment requiring PM
- Categorize by system: HVAC, Electrical, Plumbing, Fire, Kitchen, Laundry, Pool
- Capture: make, model, serial number, location, installation date, warranty
- Assign criticality: Critical (guest-facing, safety), Important (operations), Standard (non-critical)

### Step 2: Define PM Tasks Per Asset
| Asset Type | Typical PM Tasks | Frequency |
|---|---|---|
| Chiller | Oil analysis, coil cleaning, refrigerant check | Monthly/Quarterly |
| AHU | Filter replacement, belt check, drain cleaning | Monthly |
| FCU | Filter cleaning, condensate drain check, fan speed | Quarterly |
| Generator | Oil change, battery check, load test | Weekly/Monthly |
| UPS | Battery test, ventilation check, capacitor check | Quarterly |
| Fire pump | Flow test, pressure check, controller test | Weekly/Monthly |
| Kitchen hood | Filter cleaning, exhaust fan check, fire suppression | Monthly |
| Laundry ironer | Roller inspection, steam check, bearing lubrication | Monthly |
| Pool pump | Strainer cleaning, pressure check, seal inspection | Weekly |

### Step 3: Schedule Creation
- Weekly PMs: assigned to specific days
- Monthly PMs: assigned to specific weeks
- Quarterly PMs: assigned to specific months
- Annual PMs: assigned to specific months (typically low season)

### Step 4: Resource Planning
- Labor hours per PM task
- Skill level required (technician, supervisor, specialist)
- Spare parts and materials needed
- Room/area downtime required (coordinate with front office)

### Step 5: Execution & Documentation
- Technician completes PM checklist
- Records: date, time, findings, actions taken, parts used
- Flags any follow-up required
- Supervisor reviews and signs off

### Step 6: Performance Analysis
| KPI | Target |
|---|---|
| PM Completion Rate | > 90% on time |
| PM Compliance | > 95% scheduled vs completed |
| Breakdowns per Asset | < 2 per year (after PM program) |
| PM Cost as % of Asset Value | 2-4% annually |
| Schedule Adherence | > 85% |

---

## PM Frequency Determination

| Factor | Adjust Frequency |
|---|---|
| Manufacturer recommendation | Baseline |
| Operating hours (heavy vs light season) | Increase during high season |
| Age of equipment | Increase as equipment ages |
| Criticality | Critical assets get more frequent PM |
| Historical failure data | Increase if failure-prone |
| Environment (coastal, dusty) | Increase for harsh environments |

---

## Seasonal Planning

### Pre-High-Season (October-November)
- All chillers serviced and ready
- All guest room FCUs cleaned and filters replaced
- Generators load-tested and fueled
- Pool systems fully operational
- Kitchen equipment serviced

### Pre-Low-Season (May-June)
- Major overhaul work scheduled
- Chiller tube cleaning
- Cooling tower basin cleaning
- Electrical panel thermography
- Fire alarm system full test
- Renovation and capex work planned

---

## AI Opportunities

- PM schedule optimization based on equipment usage patterns
- Predictive failure models using historical PM and breakdown data
- Automated work order generation from PM triggers
- Parts consumption prediction for inventory planning
- Technician routing optimization for multi-property PM routes
- Image-based condition assessment during PM rounds

## Traceability

| Relation | Reference |
|---|---|
| Related Business Capability | Engineering Delivery — Maintenance |
| Related Workflow | 06-Operations/Maintenance.md |
| Related Database Tables | maintenance_schedules, work_orders, assets |
| Related APIs | GET/POST /v1/maintenance-schedules, POST /v1/work-orders |
| Related Roles | Chief Engineer, Engineering Supervisor, Technician |
| Related KPIs | PM completion rate, PM compliance, Breakdown frequency |
