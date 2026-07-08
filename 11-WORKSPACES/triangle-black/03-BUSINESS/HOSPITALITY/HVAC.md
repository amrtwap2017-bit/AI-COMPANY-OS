---
ID: 04-Hospitality-07
Title: HVAC
Purpose: Document hotel HVAC systems including chillers, AHUs, FCUs, ductwork, refrigeration, and controls
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# HVAC Systems

## Overview

HVAC (Heating, Ventilation, and Air Conditioning) is the single most critical MEP system in a hotel, typically accounting for 40-55% of total energy consumption and the #1 source of guest complaints. In Sharm El Sheikh's hot climate, cooling is required year-round with minimal heating demand.

## HVAC Architecture in Hotels

```
Central Plant                          Distribution
┌──────────────────────┐         ┌────────────────────────┐
│  Chiller(s)          │  Chilled│  Air Handling Units     │
│  Cooling Tower(s)     │──Water──│  (AHUs)                 │
│  Chilled Water Pumps  │  Loop   │  Fan Coil Units (FCUs)  │
│  Condenser Water Pumps│         │  VAV Boxes              │
│  Heat Exchangers      │         │  Ductwork               │
│  Boilers (heating)    │         │  Diffusers / Grilles    │
└──────────────────────┘         │  Thermostats            │
                                 └────────────────────────┘
```

## Central Plant Components

### Chillers

The heart of the hotel cooling system. Chillers produce chilled water (typically 6-7°C) that is distributed to AHUs and FCUs.

**Types used in hotels:**

| Type | Size Range | Efficiency (kW/ton) | Best For |
|---|---|---|---|
| Centrifugal | 200-2000+ tons | 0.50-0.65 | Large resorts, luxury hotels |
| Screw | 50-500 tons | 0.55-0.75 | Mid-size hotels |
| Scroll | 5-150 tons | 0.65-1.00 | Smaller hotels, individual zones |
| Absorption | 50-1000 tons | 0.80-1.20 | Hotels with waste heat, solar |

**Key parameters:**
- Capacity in tons of refrigeration (1 ton = 12,000 BTU/hr = 3.517 kW)
- COP (Coefficient of Performance) — higher is better
- Entering/Leaving Chilled Water Temperature (ECHWT/LCHWT)
- Refrigerant type (R-134a, R-410A, R-123, R-513A — transitioning away from high-GWP refrigerants)

**Typical configurations:**
- Duty + Standby (N+1) for critical operations
- Duty + Assist + Standby for large resorts (> 500 rooms)
- Multiple smaller chillers for turndown flexibility at low load

### Cooling Towers

Reject heat from the refrigeration cycle to the atmosphere.

**Types:**
- Open circuit (evaporative): Most common. Water is exposed to air.
- Closed circuit (dry/adiabatic): Less water consumption but higher CAPEX.
- Hybrid: Both modes available based on ambient conditions.

**Common issues:**
- Scale buildup (especially in Sharm's hard water)
- Legionella risk (biofilm formation)
- Fan motor and belt failures
- Drift eliminator degradation
- Basin and float valve failures

### Chilled Water Pumps

- Primary pumps: Constant flow through chillers
- Secondary pumps: Variable flow through distribution system (VFD-controlled)
- Condenser water pumps: Constant flow through cooling towers
- Typical configuration: Duty + Standby per circuit

### Boilers (for Heating)

In Sharm El Sheikh, boilers are primarily used for:
- Domestic hot water (via heat exchangers)
- Pool heating (in cooler months, Dec-Feb)
- AHU heating coils (rare, usually electric backup)

**Types:**
- Fire tube: Most common (up to 2000 kW)
- Water tube: Larger installations
- Condensing: Higher efficiency (90%+), requires correct water temperature

**Fuel:**
- Natural gas (preferred but limited availability in Sharm)
- LPG (propane tanks — common in Sharm)
- Diesel (backup or primary where gas unavailable)
- Electric (smaller installations)

## Air Distribution

### Air Handling Units (AHUs)

Large centralized units that condition and distribute air to zones.

**Components:**
- Mixing box (return air + fresh air)
- Filters (pre-filter + bag filter, MERV 8-13)
- Cooling coil (chilled water)
- Heating coil (hot water or electric)
- Humidifier (rare in Sharm — dehumidification is the need)
- Supply fan (usually with VFD)
- Return fan (if ducted return)

**Sizing:**
- Guest room floors: 1-2 AHUs per floor or per wing
- Public areas: Dedicated AHUs (lobby, restaurant, meeting rooms)
- Kitchen: 100% exhaust, make-up air unit
- Fresh air handling units (FAHU): Provide pre-conditioned fresh air

### Fan Coil Units (FCUs)

Small terminal units in individual rooms, providing localized temperature control.

**Types:**
- Concealed (in ceiling, above bathroom) — most common in guest rooms
- Floor-mounted (below window) — older installations
- Exposed (vertical units) — budget hotels, service areas

**Components:**
- Fan (3-speed or ECM — Electronically Commutated Motor)
- Chilled water coil (2-pipe or 4-pipe)
- Condensate drain pan
- Filter (washable or disposable)
- Thermostat (wall-mounted or remote)

**Common failures:**
- Condensate drain blockage → water leak into room (top guest complaint)
- Fan motor bearing noise (second most common guest complaint)
- Filter clogging → reduced airflow
- Coil fouling → reduced cooling capacity
- Thermostat calibration drift

### 2-Pipe vs. 4-Pipe Systems

| Aspect | 2-Pipe | 4-Pipe |
|---|---|---|
| Piping | One supply, one return (shared cooling/heating) | Separate supply/return for cooling and heating |
| Flexibility | Cannot cool one zone while heating another | Simultaneous cooling and heating |
| Cost | Lower installation cost | Higher installation cost |
| Season | Switchover between cooling and heating seasons | Year-round independent operation |
| Typical use | Budget/mid-scale hotels | Luxury hotels, mixed-use |

### Ductwork

- Sheet metal (galvanized steel): Most common for main ducts
- Flexible duct: Final connections to diffusers
- Insulation: Required for cold air ducts (condensation prevention)
- Air balancing: Adjust dampers to achieve design airflow to each zone

### Diffusers & Grilles

| Type | Location | Function |
|---|---|---|
| Linear slot diffuser | Ceiling | Guest rooms, offices |
| Square/round diffuser | Ceiling | Lobbies, public areas |
| Swirl diffuser | High ceiling | Atriums, ballrooms |
| Grille | Wall or floor | Return air, fresh air intake |
| Kitchen hood | Above equipment | Exhaust |

## Refrigeration Systems

### Walk-in Coolers & Freezers
- Condensing units (air-cooled or water-cooled)
- Evaporator coils with electric defrost
- Digital controllers (temperature, defrost cycle)
- Door alarms and strip curtains

### Ice Machines
- Modular ice machines (100-500 kg/day per unit)
- Ice storage bins
- Water-cooled condensers preferred (lower kitchen heat load)
- Scale buildup is the primary issue in Sharm's water

### Reach-in Refrigeration
- Under-counter refrigerators and freezers
- Wine coolers (glass door, dual temperature zones)
- Beverage coolers (bars, minibars)

## BMS / HVAC Controls

### Control Points per System

| Equipment | Control Points |
|---|---|
| Chiller | On/Off, setpoint, leaving water temp, status alarms |
| AHU | Fan speed, valve position, supply air temp, room temp, CO2 |
| FCU | Fan speed, valve position, room temp, occupancy |
| Cooling Tower | Fan speed, basin temp, make-up valve |

### Common BMS Protocols
- BACnet (most common in commercial HVAC)
- Modbus (RTU/TCP)
- LonWorks (older installations)
- KNX (European hotels)

### Key Control Strategies

**Occupancy-based control:**
- Room occupied → FCU runs at setpoint
- Room unoccupied → FCU set back to economy mode (26-28°C)
- Requires integration with PMS or door lock

**Demand-controlled ventilation:**
- CO2 sensors in public areas → modulate fresh air intake
- Occupancy sensors in meeting rooms → reduce airflow when empty

**Chiller plant optimization:**
- Reset chilled water setpoint based on outside temperature
- Optimize number of chillers running based on load
- Cooling tower approach temperature optimization

## Common HVAC Issues in Sharm El Sheikh

| Issue | Cause | Impact |
|---|---|---|
| High condenser pressure | Ambient temp > 45°C, dusty condenser coils | Chiller trips, reduced capacity |
| Corroded coils | Salt air from Red Sea | Coil leaks, refrigerant loss, frequent failures |
| Scale in pipes | Hard water (high TDS) | Reduced heat transfer, increased pressure drop |
| Sand in fresh air | Desert dust storms | Clogged filters, dirty ducts, IAQ issues |
| Condensate overflow | High humidity + blocked drain | Water damage to ceilings |
| Undersized system | Hotel expanded without HVAC upgrade | Inadequate cooling, guest complaints |
| Rooftop equipment damage | Sun exposure, sand, wind | Premature failure of electronic components |

## Standards & Regulations

- **ASHRAE 62.1:** Ventilation for acceptable indoor air quality
- **ASHRAE 90.1:** Energy standard for buildings
- **ASHRAE 15:** Refrigeration safety standard
- **ASHRAE 180:** Standard for inspection of HVAC systems
- **EPA Section 608:** Refrigerant handling and certification
- **F-Gas Regulation (EU):** Phasedown of HFC refrigerants
- **Montreal Protocol / Kigali Amendment:** Global refrigerant transition
- **Egyptian Energy Code:** Residential and commercial building energy efficiency

## Maintenance Schedule (Summary)

| Component | Frequency | Task |
|---|---|---|
| Chiller oil analysis | Semi-annual | Check for contamination, wear metals |
| Chiller refrigerant analysis | Annual | Moisture, acid, non-condensables |
| Condenser coil cleaning | Monthly (peak summer) | Water wash or chemical clean |
| AHU filter replacement | Monthly | Replace bag filters, clean pre-filters |
| FCU filter cleaning | Quarterly | Washable filters — clean with soap and water |
| FCU condensate pan | Quarterly | Clean and treat with algaecide tablets |
| Cooling tower basin | Weekly | Check float valve, clean debris |
| Cooling tower chemical dose | Daily | Biocide, scale inhibitor, corrosion inhibitor |
| Fresh air intake grille | Monthly | Clean sand and debris |
| Ductwork cleaning | Every 3-5 years | IAQ requirement, especially after renovation |

## AI Opportunities

- **Chiller Performance Prediction:** Predict COP degradation and alert on efficiency loss before utility bill spikes
- **Refrigerant Leak Detection:** Continuous monitoring of system pressures and temperatures → ML detects early leak signatures
- **FCU Predictive Failure:** Vibration + current sensors on FCU fans predict bearing failure 2-4 weeks in advance
- **Guest Comfort Optimization:** AI learns guest preferences by room and pre-conditions rooms before arrival
- **Fault Detection & Diagnostics (FDD):** Automated diagnosis of HVAC faults (e.g., "Low superheat → TXV overfeeding")
- **Energy Optimization:** Reinforcement learning for chiller plant sequencing and setpoint optimization
- **Filter Replacement Prediction:** Model pressure drop across filters to predict optimal replacement timing
- **Occupancy-Based HVAC Control:** Computer vision or WiFi-based occupancy sensing to optimize AHU/FCU scheduling
