---
ID: 04-Hospitality-16
Title: Energy-Management
Purpose: Document energy monitoring, optimization, renewable energy, and sustainability in hotels
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Energy Management

## Overview

Energy is the largest variable operating cost in hotels, typically representing 25-35% of engineering opex and 4-8% of total hotel revenue. In Sharm El Sheikh, air conditioning alone can account for 50-60% of total energy consumption. Effective energy management directly improves GOP (Gross Operating Profit) and reduces environmental impact.

## Energy Consumption Breakdown (Typical Hotel)

| End Use | % of Total | Notes |
|---|---|---|
| HVAC (cooling, ventilation) | 45-60% | Dominant in hot climates |
| Lighting | 10-15% | LED conversion reduces significantly |
| Domestic hot water | 8-12% | Boilers, heat pumps, solar |
| Kitchen equipment | 5-8% | Cooking, refrigeration, dishwashing |
| Laundry | 3-5% | Washers, dryers, ironers |
| Guest rooms (plug loads) | 5-8% | TV, minibar, phone chargers |
| Pumps & fans | 4-7% | Water, pool, irrigation |
| Lifts / elevators | 2-4% | Movement, standby |
| IT & telecom | 2-3% | Server room, network, PMS |
| Miscellaneous | 3-5% | Pool heating, spa, recreation |

## Energy Metrics & Benchmarking

### Key Metrics

| Metric | Formula | Unit | Typical Target |
|---|---|---|---|
| Energy Use Intensity (EUI) | Total energy / Gross floor area | kWh/m²/year | 250-400 (hot climate) |
| Energy per Occupied Room | Total energy / Occupied room nights | kWh/occupied room night | 50-100 |
| Energy Cost per Occupied Room | Total energy cost / Occupied rooms | $/occupied room | 3-8 |
| Energy Cost % of Revenue | Total energy cost / Hotel revenue | % | 4-8% |
| Carbon Intensity | Total CO₂ / Occupied room | kg CO₂/room night | 20-40 |
| kW Demand per Room | Peak demand / Total rooms | kW/room | 1.5-3 |
| Power Factor | Real power / Apparent power | PF | > 0.95 |

### Benchmarking Standards

- **ASHRAE 90.1:** Energy Standard for Buildings
- **ASHRAE 100:** Energy Efficiency in Existing Buildings
- **EPI (Energy Performance Indicator) by hotel brand:** Each brand has internal targets
- **HES (Hotel Energy Solutions)** by IFC/UNWTO
- **Egyptian Energy Efficiency Code for Commercial Buildings**

## Energy Monitoring

### Submetering Strategy

| Level | What it Meters | Purpose |
|---|---|---|
| Level 1 | Utility (main meter) | Billing, total consumption |
| Level 2 | System-level (chiller, boiler, lighting) | System performance tracking |
| Level 3 | Zone-level (kitchen, laundry, pool) | Departmental cost allocation |
| Level 4 | Equipment-level (specific chiller, pump) | Equipment efficiency, diagnostics |

### Hotel Submetering Zones (Recommended)

| Zone | What's Included | % of Hotel Load |
|---|---|---|
| Guest rooms (floors/wings) | FCUs, lighting, plug loads | 30-40% |
| Public areas | Lobby, restaurant, meeting rooms | 15-20% |
| F&B / Kitchen | Cooking, refrigeration, dishwashing | 8-12% |
| Laundry | Washers, dryers, ironers | 3-5% |
| Back of house | Offices, staff areas, corridors | 5-8% |
| Plant room | Chillers, pumps, cooling towers | 20-30% |
| Pool & recreation | Pool pumps, heating, water features | 3-5% |
| External | Landscaping, exterior lighting | 2-4% |

### Data Collection

- **Meter type:** Utility-grade meters (accuracy ±1%)
- **Communication:** Modbus, BACnet, M-Bus, or pulse output to BMS
- **Interval:** 15-minute data collection (required for demand analysis)
- **Storage:** Minimum 12 months of interval data

### Energy Dashboard Requirements

A hotel energy management dashboard should show:
- **Real-time:** Current consumption (kW), demand trend, solar generation (if applicable)
- **Daily:** Consumption vs. same day last year, daily profile
- **Monthly:** Consumption by zone, EUI, cost, comparison to budget
- **Alarms:** High consumption, demand threshold exceeded, equipment efficiency degradation

## Energy Conservation Measures (ECMs)

### Low Cost / Quick Win

| Measure | Savings | Payback | Implementability |
|---|---|---|---|
| LED lighting conversion | 50-70% of lighting energy | 1-2 years | Easy |
| HVAC setback when unoccupied | 15-25% of HVAC energy | 0 | Requires EMS/occupancy sensors |
| Guest room key-card energy control | 10-20% of room energy | 6 months | New build or retrofit |
| Chiller setpoint optimization | 5-10% of chiller energy | 0 | Software change |
| Cooling tower cleaning | 5-10% of chiller energy | Immediate | Maintenance |
| Air filter regular replacement | 5-10% of fan energy | Immediate | Maintenance |
| Pump VFD installation | 20-50% of pump energy | 1-2 years | Retrofit |
| Pool pump schedule optimization | 30-50% of pool pump energy | 0 | Schedule change |
| Insulation of hot water pipes | 5-10% of DHW energy | 1 year | Retrofit |
| Power factor correction | 5-15% of electricity bill | 1-2 years | One-time installation |

### Medium Investment

| Measure | Savings | Payback | Notes |
|---|---|---|---|
| BMS upgrade / installation | 10-20% total | 2-4 years | Enables many other ECMs |
| Variable speed chillers | 20-30% of chiller energy | 3-5 years | Replace constant speed |
| Heat recovery from chillers | 20-40% of DHW energy | 3-5 years | Requires proximity of chiller + DHW |
| Solar water heating | 30-60% of DHW energy | 3-6 years | Excellent in Sharm |
| Window film / solar control | 10-20% of cooling load | 2-4 years | Reduces solar heat gain |
| High-efficiency boiler | 10-20% of boiler fuel | 3-5 years | Replace old boiler |
| Room occupancy sensors | 10-20% of room HVAC | 2-3 years | Smart thermostat |

### Major Investment

| Measure | Savings | Payback | Notes |
|---|---|---|---|
| Building envelope improvement | 20-40% cooling load | 5-10 years | Insulation, glazing |
| Chiller plant replacement | 25-50% of chiller energy | 5-8 years | High SEER replacement |
| Solar PV (grid-connected) | 10-30% of electricity | 5-8 years | Decreasing panel costs |
| Ice storage air conditioning | Shift 30-50% of peak load | 5-10 years | Reduces demand charges |
| Cogeneration / CHP | 10-20% total energy | 5-8 years | Requires gas availability |

## Demand Management

### Understanding Demand Charges

Utility bills typically have two components:
- **Energy charge (kWh):** Based on total consumption
- **Demand charge (kW or kVA):** Based on peak demand in any 15-30 minute period in the billing cycle

For a typical hotel in Egypt, demand charges can be 20-40% of the total electricity bill.

### Demand Reduction Strategies

- **Staggered equipment starts:** Don't start all chillers simultaneously
- **Chiller sequencing:** Start chillers gradually in the morning
- **Ice storage:** Shift cooling load to off-peak hours
- **Load shedding:** Temporarily non-essential loads during peak (e.g., water features, decorative lighting)
- **Generator peak shaving:** Run generator during peak demand periods (if fuel is cheaper than grid demand charge)
- **Battery energy storage:** Charge during off-peak, discharge during peak (emerging technology)

## Renewable Energy

### Solar PV

**Applicability in Sharm El Sheikh:**
- Excellent solar resource: 2000-2200 kWh/m²/year
- Hotel roof area often adequate for 50-200+ kWp installation
- Net metering (where available) allows export to grid

**Typical sizing:**
- 50 kWp system: Needs ~300-400 m² roof area
- Annual generation: ~80,000-90,000 kWh/year (Sharm)
- Covers 5-15% of hotel electricity consumption

### Solar Thermal

(See also Water-Systems.md)

- Flat plate or evacuated tube collectors
- Typically covers 50-80% of domestic hot water needs
- 1 m² collector per 50-100 L of daily hot water demand
- Requires backup system (boiler or electric heater)

## Energy Management System (EMS / BMS)

A modern BMS enables most energy conservation measures:

| BMS Function | Energy Saving |
|---|---|
| Scheduling (time-of-day) | Eliminate after-hours operation |
| Setpoint reset | Optimize based on outside conditions |
| Demand limiting | Shed loads during peak |
| Fault detection | Identify failing equipment before it wastes energy |
| Trend logging | Baseline, measure, verify savings |
| Occupancy integration | HVAC off or setback in unoccupied areas |
| Reporting | Automated energy KPIs and benchmarks |

### BMS vs. EMS

| System | Focus | Features |
|---|---|---|
| BMS | Control + Monitoring | HVAC, lighting, power, fire control, scheduling |
| EMS | Energy analytics only | Submetering, dashboards, benchmarking, reporting |

Many hotels need both: a BMS for control and an EMS for analysis.

## Utility Rate Management

- **Negotiate utility rates:** In Egypt, large consumers can negotiate bulk tariffs
- **Time-of-use rates:** Shift consumption to off-peak where tariff structure allows
- **Fuel hedging:** For LPG/diesel purchases, lock in prices when low
- **Utility bill auditing:** Independent audit to catch billing errors (common)
- **Rebates and incentives:** Check for government programs for energy efficiency retrofits

## Carbon & Sustainability Reporting

### Hotel Carbon Metrics

| Scope | Definition | Coverage |
|---|---|---|
| Scope 1 | Direct emissions (natural gas, LPG, diesel) | Boilers, generators, kitchen |
| Scope 2 | Indirect from purchased electricity | Grid electricity |
| Scope 3 | Other indirect (supply chain, travel) | Water, waste, procurement |

### Reporting Standards
- **GHG Protocol:** International standard for carbon accounting
- **Green Key / Green Globe:** Hotel certification programs
- **LEED / BREEAM:** Building sustainability certification
- **ISO 14001:** Environmental management systems
- **GRESB:** Global real estate sustainability benchmark

## Energy Audit Process

| Level | Description | Effort | Accuracy |
|---|---|---|---|
| Level 0 | Benchmarking (utility data only) | Low | Low |
| Level 1 | Walk-through audit + opportunities | 1-2 days | ±20% |
| Level 2 | Detailed audit with submetering | 1-2 weeks | ±10% |
| Level 3 | Investment-grade audit with modeling | 2-4 weeks | ±5% |

**Energy audit deliverable:**
- Baseline energy consumption
- ECMs identified with savings estimates, costs, and payback
- Implementation roadmap (quick wins first)
- Measurement & verification (M&V) plan

## AI Opportunities

- **Energy Consumption Forecasting:** Deep learning model predicts hourly/daily energy consumption by zone using occupancy, weather, calendar, and historical data
- **Anomaly Detection:** Identify unusual consumption patterns (e.g., chiller using 30% more energy than expected on a given day)
- **Chiller Plant Optimization:** Reinforcement learning to optimize chiller sequencing, setpoints, and cooling tower operation in real time
- **Occupancy-Based HVAC Optimization:** ML predicts room occupancy patterns and pre-conditions rooms optimally
- **Demand Forecasting & Peak Shaving:** Predict peak demand events 24 hours ahead and recommend load-shedding actions
- **Fault Detection & Diagnostics (FDD):** Automated detection of equipment efficiency degradation (e.g., "AHU-7 supply air temp sensor drift")
- **Energy Benchmarking:** Compare each hotel's EUI against similar hotels (climate, size, age) to identify underperformers
- **Solar PV Generation Forecasting:** Predict solar output for the next 24-72 hours to optimize grid vs. solar consumption
- **Utility Bill Validation:** Auto-verify utility bills against metered consumption — flag discrepancies before payment
- **M&V Automation:** Automated measurement & verification for energy retrofit savings using statistical models
