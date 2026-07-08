---
ID: 04-Hospitality-14
Title: Pools
Purpose: Document swimming pool systems including filtration, chemical treatment, and heating
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Swimming Pool Systems

## Overview

Swimming pools are a defining amenity for resorts in Sharm El Sheikh. A typical resort has 1-5 pools varying from 200 m² lap pools to 2000 m² lagoon-style freeform pools, plus children's pools, jacuzzis, and sometimes infinity pools. Pool systems account for 3-5% of engineering opex and are a top-3 guest satisfaction driver.

## Pool Types & Typical Sizes

| Pool Type | Surface Area | Volume (m³) | Depth | Typical Features |
|---|---|---|---|---|
| Main pool (resort) | 500-2000+ m² | 1000-4000+ | 1.2-1.8m | Lap lanes, bridge, waterfall |
| Family / children pool | 50-200 m² | 50-200 | 0.3-0.8m | Slides, spray features |
| Jacuzzi / spa | 5-20 m² | 5-20 | 0.8-1.0m | Heated, jets, disabled access |
| Infinity pool | 100-400 m² | 200-800 | 1.2-1.5m | Overflow edge with collection tank |
| Lap pool | 100-300 m² | 200-600 | 1.2-2.0m | Straight, defined lanes |
| Lagoon / freeform | 1000-3000+ m² | 2000-6000+ | 0.5-2.0m | Irregular shape, beach entry |
| Swim-up bar area | 50-150 m² | 100-300 | 0.9-1.2m | Bar seats in water |

## Pool Hydraulic System

```
Pool water (skimmers + main drain)
        ↓
Suction piping → Pump (self-priming centrifugal)
        ↓
Filter (sand / cartridge / DE)
        ↓
Heater (if applicable: heat pump / boiler / solar)
        ↓
Chemical dosing (chlorine + pH + other)
        ↓
Return piping → Inlets (adjustable return fittings)
        ↓
Pool water complete
```

### Key Hydraulic Design Parameters

| Parameter | Standard Value |
|---|---|
| Turnover rate (public pool) | 6 hours (max) |
| Turnover rate (private pool) | 8 hours |
| Filter velocity (sand) | 20-35 m³/h/m² |
| Pool water velocity in pipes | 1.0-2.0 m/s |
| Number of skimmers | 1 per 25 m² |
| Number of return inlets | 1 per 20-30 m² |
| Floor drains (main drain) | 1 per pool |

## Filtration Systems

### Sand Filters

**How it works:** Water passes through a bed of silica sand (0.4-0.8 mm grade). Particles are trapped between sand grains.

| Filter Size | Diameter | Flow Rate (m³/h) | Sand Volume | Application |
|---|---|---|---|---|
| Small | 400-600 mm | 5-15 | 50-150 kg | Jacuzzi, small pool |
| Medium | 700-1000 mm | 15-40 | 200-700 kg | Family pool |
| Large | 1200-1600 mm | 40-80 | 700-1500 kg | Main pool |
| Multiple | 2-6 filters | Combined | — | Very large pools |

**Backwashing:**
- Done when pressure gauge rises 0.5-1.0 bar above clean pressure (typically every 1-4 weeks)
- Process: Valve to backwash → water flows reverse through sand → flushes dirt to drain → rinse → return to filter
- Duration: 2-5 minutes backwash + 30 seconds rinse
- Water loss: 200-500 L per backwash (significant — optimize schedule)

**Common issues:**
- Channeling (water flows through channels in sand, not whole bed)
- Sand hardening (calcium binding sand into solid mass — requires replacement)
- Laterals broken (sand enters pool — requires filter disassembly)
- Multiport valve seal failure (leakage)

### Cartridge Filters

| Advantage | Disadvantage |
|---|---|
| Better filtration (10-15 micron) | Higher cost per cartridge |
| Lower water loss on cleaning | Regular cartridge replacement |
| No backwash required | Labor-intensive cleaning |
| Compact size | Limited to smaller pools / moderate use |

**Cleaning:** Cartridge removed and hosed down every 2-6 weeks. Replaced every 1-3 years.

### Diatomaceous Earth (DE) Filters

- Best filtration quality (3-5 micron)
- Coats filter elements with DE powder
- Requires backwash + fresh DE recharge
- Rare in resorts (more common in high-end residential)

## Chemical Treatment

### Primary Disinfection

| Method | Notes | Typical Level |
|---|---|---|
| Chlorine (calcium hypochlorite) | Solid, granules or tablets | 1-3 ppm free chlorine |
| Chlorine (sodium hypochlorite) | Liquid bleach | 1-3 ppm free chlorine |
| Chlorine (gas) | Professional pools only | 1-3 ppm free chlorine |
| Salt chlorination (electrolysis) | Generates chlorine from salt in water | Need 3000-6000 ppm salt in pool |
| Bromine | Alternative to chlorine, less odor | 2-5 ppm |
| UV sterilization | Supplement to chlorine | — |
| Ozone | Powerful oxidizer, supplement to chlorine | — |

### pH Control

| Parameter | Target Range | Why It Matters |
|---|---|---|
| pH | 7.2-7.6 | Chlorine effectiveness drops above 7.6 |
| Total alkalinity | 80-120 ppm | Buffers pH from rapid swings |
| Calcium hardness | 200-400 ppm | Prevents corrosive or scaling water |
| Cyanuric acid (stabilizer) | 30-50 ppm | Protects chlorine from UV degradation |

### Chemical Dosing Systems

| System | Description | Best For |
|---|---|---|
| Floating dispenser (chlorine tablets) | Passive, imprecise | Small pools (not recommended for resorts) |
| In-line erosion feeder | Plumbed into return line, tablets dissolve | Moderate control |
| Peristaltic dosing pump | Doses liquid chemicals precisely | Large pools, automated systems |
| Chemical controller + dosing pump | ORP + pH sensors → auto-dose | Professional pools, resorts, all larger pools |

**Automated pool controller (ORP + pH):**
- ORP (Oxidation-Reduction Potential): 650-750 mV → indicates active sanitizer level
- pH sensor: 7.2-7.6 setpoint
- Controller drives dosing pumps for chlorine + acid/base
- Alarms for high/low levels, pump failure, probe calibration due

### Common Chemical Issues

| Issue | Cause | Solution |
|---|---|---|
| Eye irritation | Combined chlorine (chloramines) | Shock treatment (super-chlorination) |
| Algae bloom | Low chlorine, high pH, poor circulation | Shock + algaecide + brush |
| Cloudy water | Poor filtration, high calcium, fine particles | Clarifier + extended filtration |
| Scale deposits | High calcium, high pH, high temperature | Scale inhibitor, acid wash |
| Chlorine smell | Chloramines (not too much chlorine) | Shock treatment |
| Metal staining | Iron, copper, manganese in water | Metal sequestrant |

## Pool Heating

| Heating Method | Efficiency | CAPEX | OPEX | Best For |
|---|---|---|---|---|
| Heat pump (air-to-water) | COP 4-6 | Moderate | Low | Year-round heating |
| Gas heater (LPG) | 80-85% | Low | High | Rapid heat-up, winter |
| Boiler (HX) | 85% | Moderate | Moderate | Hotel with central boiler |
| Solar thermal | Free heat | High | Very low | Sunny climates (Sharm!) |
| Electric resistance | 100% | Low | Very high | Small pools, rare |

**Target temperatures:**
- Leisure pool: 26-28°C
- Children's pool: 28-30°C
- Jacuzzi / Spa: 36-40°C
- Lap pool: 25-27°C

**Sharm El Sheikh context:** Pools typically need heating Dec-Feb only (ambient 20-25°C in winter). Solar thermal with heat pump backup is ideal.

## Pool Circulation & Water Features

### Circulation Pumps

| Pump Type | Application | Power |
|---|---|---|
| Self-priming centrifugal | Standard pool circulation | 0.5-5 HP |
| Variable speed (VFD) | Energy-efficient circulation | 0.3-3 HP (at low speed) |
| Water feature pump | Waterfalls, fountains, slide | 1-15 HP |
| Booster pump | Pressure-side cleaner | 0.5-1 HP |

**Energy savings:** Variable speed pumps at low speed for 80% of day reduce pump energy by 50-70% compared to single-speed.

### Water Features

- **Waterfalls:** Pump lifts water to top of feature → gravity returns
- **Fountains:** Submerged pump + nozzle
- **Spray jets / water cannons:** High-pressure pump, children's play area
- **Beach entry / zero entry:** Gradual slope, wave machine (rare in Sharm)
- **Artificial river / lazy river:** Multiple circulation pumps, directional jets

## Pool Cleaning Systems

| Method | Coverage | Automation Level | Cost |
|---|---|---|---|
| Manual (pole + net + brush) | Surface, walls, floor | None | Low (labor) |
| Suction-side cleaner | Floor and walls | Semi-automated | Low |
| Pressure-side cleaner | Floor and walls | Semi-automated | Moderate |
| Robotic cleaner (electric) | Floor, walls, waterline | Fully automated | High |

**Robotic cleaners** are preferred in resorts: self-contained, no need to run main pump, advanced scrubbing, programmable schedule, filter bag.

## Pool Safety

### Safety Equipment
- Lifebuoy rings (at least 1 per pool, accessible)
- Shepherd's crook (rescue pole)
- First aid kit at poolside
- Safety signs (depth markers, no diving)
- Pool alarm (for unattended children, some jurisdictions)
- Fencing / barrier (particularly for children's pool)

### Water Quality Safety
- Bacterial testing: Weekly (E. coli, Pseudomonas)
- Chemical log: Maintained daily (chlorine, pH, temperature)
- Operator certification: CPO (Certified Pool Operator) preferred
- Health department inspections: Periodic

### Drowning Prevention
- Lifeguard during operating hours for large pools
- CCTV monitoring (AI analytics for drowning detection emerging)
- Emergency procedures posted
- AED (automated external defibrillator) at pool area

## Maintenance Schedule

| Task | Daily | Weekly | Monthly | Quarterly | Annual |
|---|---|---|---|---|---|
| Skim surface | X | | | | |
| Check pump strainer | X | | | | |
| Check chemical levels | X | | | | |
| Backwash filter | | X (or as needed) | | | |
| Clean tile waterline | | X | | | |
| Brush walls and floor | | X | | | |
| Clean pump basket | | X | | | |
| Check heater operation | | | X (heating season) | | |
| Clean heat pump coils | | | X | | |
| Check safety equipment | | | X | | |
| Service chemical controller | | | X | | |
| Replace filter sand | | | | | Every 5-7 years |
| Drain and deep clean (acid wash) | | | | | Every 3-5 years |
| Full pump service | | | | | X |
| Tile / plaster inspection | | | | | X |
| Structural integrity inspection | | | | | Every 5 years |

## Common Pool Issues in Sharm

| Issue | Cause | Mitigation |
|---|---|---|
| High chlorine demand | UV destroys chlorine, high bather load | Cyanuric acid stabilizer, run pump longer |
| Scale in pipes and equipment | High TDS water (from well/supply) | Scale inhibitor, water softener |
| Sand filter channeling | Hard water binds sand | Break up sand bed, replace if necessary |
| Heat pump failure | Salt air corrosion, condenser fins clogged | Coating, regular cleaning |
| Pool pump losing prime | Suction air leak, strainer clog | Check lid O-ring, pump volute |
| Cracks in pool shell | Ground movement, thermal expansion | Structural epoxy, monitoring |
| Algae despite chlorination | Phosphates in water, low stabilizer | Phosphate remover, shock treatment |
| Cloudy water after backwash | Filter media expired, too frequent backwash | Replace sand, adjust backwash frequency |

## Standards & Regulations

- **NSF/ANSI 50:** Equipment for swimming pools, spas, hot tubs
- **ASHRAE 90.1:** Pool dehumidification energy requirements (indoor pools)
- **IPC Chapter 4:** Swimming pool plumbing (US)
- **Egyptian Ministry of Health:** Water quality standards for pools
- **CPO (Certified Pool Operator) certification:** Industry standard for pool management
- **ADA (US) / local equivalents:** Pool accessibility requirements
- **Hotel brand standards:** Brand-specific pool dimensions, depths, features

## AI Opportunities

- **Chemical Dosing Optimization:** ML model learns pool usage patterns + weather + water quality → predict optimal chemical dose and anticipate demand changes
- **Filter Backwash Prediction:** Pressure differential + flow + runtime → predict optimal backwash timing, reducing water loss
- **Water Consumption Monitoring:** Detect leaks or unauthorized water use (drainage, topping off) from flow data anomalies
- **Algae Bloom Prediction:** Water test data trends + weather forecast → ML predicts bloom risk before visible
- **Pool Occupation Analytics:** Computer vision → real-time counting → optimize chemical dosing and lifeguard staffing
- **Pump Health Monitoring:** Current + vibration → predict bearing failure or impeller damage
- **Energy Optimization:** Variable speed pump schedule optimization based on usage and filtration needs
- **Guest Safety Analytics:** Computer vision detects unsafe behavior (running, unsupervised children) and alerts lifeguards
