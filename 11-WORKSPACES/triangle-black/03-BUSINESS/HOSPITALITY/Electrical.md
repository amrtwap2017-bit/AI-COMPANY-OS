---
ID: 04-Hospitality-08
Title: Electrical
Purpose: Document hotel electrical systems including distribution, generators, UPS, lighting, and BMS
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Electrical Systems

## Overview

Electrical systems in hotels are mission-critical. A power failure in a fully occupied hotel causes immediate operational crisis: no lighting, no AC, no elevators, no kitchen, no fire alarm, no IT systems. Hotels therefore invest heavily in backup power and electrical reliability. Electrical systems typically account for 15-20% of the engineering budget.

## Electrical Distribution Architecture

```
Utility Grid (11kV / 22kV from provider)
        │
    Main Substation
    (Transformer: 11kV / 0.4kV)
        │
    Main Low Voltage Switchboard (LVSB)
        │
    ├── Main Distribution Board (MDB)
    │       │
    │       ├── Sub-Distribution Boards (SDBs)
    │       │       │
    │       │       ├── Floor Distribution Boards
    │       │       │       └── Room Distribution Boards
    │       │       │
    │       │       ├── Kitchen Distribution Board
    │       │       ├── Plant Room Distribution Board
    │       │       └── Public Area Distribution Board
    │       │
    │       └── Emergency Distribution Board
    │               └── Emergency lighting, fire alarm, life safety
    │
    └── Standby Generator(s)
            │
        Automatic Transfer Switch (ATS)
            │
        Generator Distribution Board
            └── Essential loads only
```

## Utility Supply

### Egypt Grid Supply
- Voltage: 11kV or 22kV (hotel receives at high voltage)
- Transformer: Hotel-owned (11kV/0.4kV or 22kV/0.4kV)
- Frequency: 50 Hz
- Reliability: Variable — grid instability and outages are common, especially in summer peak
- Billing: kVA demand charge + kWh energy charge + power factor penalty

### Power Factor
- Target: > 0.95 lagging
- Below 0.90 → utility surcharge (significant cost in Egypt)
- Correction: Capacitor banks at main switchboard
- Common issue: Capacitor bank failure goes unnoticed → high PF penalty for months

## Standby Generators

Hotels in Egypt require backup generators to maintain essential operations during grid outages (which can last 1-8 hours during summer load shedding).

### Generator Sizing

| Hotel Size | Typical Generator | Coverage |
|---|---|---|
| < 100 rooms | 250-500 kVA | Essential loads only |
| 100-300 rooms | 500-1000 kVA | Essential + some guest rooms |
| 300-500 rooms | 1000-2000 kVA | All critical + 50% guest rooms |
| 500+ rooms | 2000+ kVA (multiple units) | Almost full coverage |

### Essential Loads on Generator
- Fire alarm and life safety systems
- Emergency lighting
- Fire pumps
- Sump pumps
- Lifts (at least one per bank)
- Kitchen reach-in refrigeration
- Chiller (one unit if possible)
- Guest room lighting and TV (minimum)
- IT / server room
- Water supply pumps
- BMS system

### Generator Components

| Component | Function | Common Issues |
|---|---|---|
| Engine (Diesel) | Prime mover | Fuel system air, injector failure |
| Alternator | AC generation | Voltage regulator failure |
| ATS (Auto Transfer Switch) | Grid ↔ Generator changeover | Control board failure |
| Fuel tank | Diesel storage | Water in fuel, algae growth |
| Battery & charger | Starting power | Battery sulfation, charger failure |
| Radiator | Engine cooling | Fan clutch failure, coolant leaks |
| Exhaust system | Emissions | Silencer corrosion, flex joint failure |
| Day tank | Local fuel supply | Float valve, level sensor |

### Generator Testing

| Test Type | Frequency | Duration | Load |
|---|---|---|---|
| No-load start | Weekly | 20-30 min | 0% |
| Load bank test | Monthly | 60 min | 50% |
| Full load test | Quarterly | 2-4 hours | 75-100% |
| ATS test | Monthly | Simulation | Automatic changeover |

### Fuel Management
- Diesel consumption: ~0.2-0.3 L/kWh at full load
- Typical on-site storage: 1-7 days full-load run time (in Sharm, many hotels keep 3000-10,000+ liters)
- Fuel polishing: Recirculation and filtration system to prevent algae and water accumulation
- Fuel testing: Annual quality check (water, microbial growth, sediment)

## UPS Systems

### UPS Types in Hotels

| Type | Application | Typical Capacity |
|---|---|---|
| Central UPS | IT server room, BMS, security | 20-200 kVA |
| Distributed UPS | POS terminals, Front Office PCs | 1-5 kVA each |
| Emergency lighting UPS | Exit signs, corridor lights | Distributed battery packs |
| Telephone exchange UPS | PBX system | 1-5 kVA |
| Fire alarm UPS | Panel backup | Integrated |

### UPS Battery Types
- **VRLA (Valve-Regulated Lead-Acid):** Most common, maintenance-free
- **Li-Ion:** Increasingly common, longer life, higher cost
- **Nicad:** Used in extreme temperature environments
- **Battery life:** 3-5 years (VRLA), 8-12 years (Li-Ion)

### UPS Key Parameters
- Capacity (kVA/kW)
- Runtime at full load (typically 10-60 minutes — long enough for generator start)
- Transfer time (typically 2-10 ms — seamless for electronics)
- Efficiency (90-97% in online mode)

## Lighting Systems

### Lighting Types in Hotels

| Area | Typical Fixtures | Control |
|---|---|---|
| Guest rooms | LED downlights, bedside lamps, desk lamps | Wall switches, key card, scene controller |
| Corridors | LED downlights, sconces | Dimming, motion sensors |
| Lobby | Chandeliers, decorative fixtures, accent | High-end dimming, scene control |
| F&B | Ambient, task, accent | Zoned dimming, scene presets |
| Meeting rooms | Recessed LED, track lighting | Zoned with dimming |
| Back of house | Linear fluorescent/LED batten | Manual switch, occupancy sensor |
| Exterior | Floodlights, pathway, landscape | Photocell, timer, DMX |
| Parking | High-bay LED | Motion sensor (dimmed when unoccupied) |

### Controls & Standards
- **DALI:** Digital Addressable Lighting Interface — per-fixture control
- **0-10V Dimming:** Analog dimming standard
- **DMX:** Theatrical/entertainment lighting
- **Occupancy/Vacancy sensors:** PIR (passive infrared) or ultrasonic
- **Daylight harvesting:** Photosensors that dim lights based on available natural light

### Emergency Lighting
- Exit signs (self-illuminated, battery-backed)
- Emergency escape route lighting (must provide minimum illuminance for 90 minutes)
- Central battery system or self-contained units
- Tested monthly (30-sec flicker test) and annually (90-min full duration test)

## Power Distribution Components

| Component | Function | Maintenance |
|---|---|---|
| Main Switchboard | Incoming utility and generator changeover | Thermal imaging quarterly, cleaning annually |
| Circuit Breakers | Overcurrent protection (ACB, MCCB, MCB) | Mechanical exercise annually |
| Contactors | Remote switching of loads | Cleaning, coil check |
| VFD (Variable Frequency Drive) | Motor speed control (pumps, fans) | Cleaning, capacitor check |
| Soft Starter | Motor starting current limitation | Parameter check |
| Capacitor Bank | Power factor correction | Capacitor health check quarterly |
| Metering | Utility submetering, energy monitoring | Calibration verification |
| Earthing / Grounding | Safety ground, lightning protection | Ground resistance test annually |
| Lightning Protection | Air terminals, down conductors, earthing | Visual inspection, resistance test |

## BMS Integration

The Building Management System monitors and controls:
- Electrical switchboard status and alarms
- Generator status, fuel level, battery voltage
- UPS status, battery health, bypass mode
- Energy consumption (submeters throughout property)
- Lighting control (public areas, exterior)
- Power quality (harmonics, PF, voltage sags)

## Common Electrical Issues in Hotels

| Issue | Cause | Impact |
|---|---|---|
| Generator fails to start | Battery discharged, fuel issue | No backup power |
| Neutral overloading | Harmonic currents from LED/VFD drives | Overheating, fire risk |
| Voltage fluctuation | Grid instability, loose connections | Equipment damage |
| RCD tripping | Earth leakage from moisture or damaged equipment | Nuisance shutdowns |
| Loose connections | Thermal cycling, vibration | Arcing, fire risk |
| Corroded contacts | Salt air in Sharm | High resistance, heating |
| Cable insulation failure | Age, heat, rodent damage | Short circuit |
| Wrong circuit labeling | Poor documentation | Safety risk during LOTO |

## Electrical Safety

### Lockout / Tagout (LOTO)
- Mandatory before any electrical maintenance
- Lock the isolation point, tag with technician details
- Verify zero energy state before working
- Remove only the person who applied the lock

### Arc Flash Safety
- Arc flash risk assessment required
- PPE requirements per incident energy level (Category 0-4)
- Warning labels on all panels
- Approach boundaries (limited, restricted, prohibited)

### Testing & Inspection
- Earth leakage testing (RCDs): Semi-annual
- Earth resistance: Annual
- Megger testing (insulation resistance): Annual
- Thermal imaging (switchboards, panels): Quarterly
- Circuit breaker trip testing: Every 3-5 years

## Standards & Regulations

- **IEC 60364:** Low-voltage electrical installations
- **NFPA 70 (NEC):** National Electrical Code
- **NFPA 70E:** Electrical safety in the workplace
- **Egyptian Electricity Code:** Local regulations
- **IEC 61439:** Low-voltage switchgear and controlgear assemblies
- **ISO 8528:** Generator sets standards
- **IEC 62040:** UPS performance standards

## AI Opportunities

- **Generator Predictive Maintenance:** Monitor oil pressure, coolant temp, battery voltage, fuel quality → predict failures before start test fails
- **Load Forecasting:** Predict hotel electrical demand by hour/week/season to optimize generator fuel management and peak shaving
- **Power Quality Anomaly Detection:** Real-time monitoring identifies harmonics, sags, swells, and transients before they damage equipment
- **Energy Theft Detection:** Identify unusual consumption patterns that indicate unauthorized loads or meter tampering
- **Lighting Fault Detection:** DALI-based automated reporting of failed/dimming LEDs across property
- **Capacitor Bank Health Monitoring:** Predict PF correction capacitor failure before utility penalty kicks in
- **Arc Flash Risk Calculation:** Automated arc flash analysis from updated switchboard configuration
- **Battery Life Prediction:** ML model on UPS battery discharge curves to predict replacement timing
