---
ID: 04-Hospitality-11
Title: Water-Systems
Purpose: Document water treatment, pumping, heating, and swimming pool mechanical systems
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Water Systems

## Overview

Water is the most critical utility in a hotel. In Sharm El Sheikh, where fresh water is scarce and expensive, water management is a strategic priority. Hotels consume 500-1500+ liters of water per occupied room per night. Water systems encompass treatment, pumping, storage, heating, and all related mechanical infrastructure.

## Water Sources in Sharm El Sheikh

| Source | Quality (TDS) | Reliability | Cost |
|---|---|---|---|
| Municipal supply | Variable (1000-3000 ppm) | Low (frequent cuts) | Low |
| Well water | High (2000-8000 ppm) | High (your own well) | Moderate (pumping) |
| RO Desalination | Excellent (< 500 ppm) | High | High (membrane, energy) |
| Trucked water | Variable (vendor-dependent) | Moderate | High |
| Treated wastewater (for irrigation) | Low quality | High (if system exists) | Moderate |

**Typical Sharm hotel water mix:** Well water + RO desalination for potable water, well water (or treated gray water) for irrigation.

## Water Treatment Systems

### Reverse Osmosis (RO) Desalination

**Process:** Feed water → Pre-treatment (multimedia filter + antiscalant) → High-pressure pump → RO membranes → Product water + Brine reject

**Components:**
- Feed water pump
- Multimedia filter (sand + gravel — removes suspended solids)
- Carbon filter (removes chlorine, organic compounds)
- Antiscalant dosing pump (prevents membrane scaling)
- Cartridge filter (5-micron final pre-filtration)
- High-pressure pump (15-30 bar for brackish water, 50-70 bar for seawater)
- RO membranes (thin-film composite spiral wound)
- Pressure vessels (FRP or stainless steel)
- Membrane flush system (for cleaning)
- Product water tank (stainless steel or polyethylene)
- Brine reject disposal (to drain, or to salt-tolerant irrigation)

**Key Parameters:**
- Recovery rate: 50-75% (brackish), 35-50% (seawater)
- Salt rejection: 98-99.5%
- Membrane lifespan: 3-5 years (with proper maintenance)
- Energy consumption: 1-3 kWh/m³ (brackish), 3-6 kWh/m³ (seawater)

**Common Issues:**
- Membrane fouling (scale, biofouling, colloidal fouling)
- High pressure differential across membranes → cleaning needed
- Pump seal failures
- Antiscalant dosing pump failure → immediate scaling risk

### Water Softening

Used when feed water has high hardness (calcium + magnesium > 200 ppm), which causes scale buildup in pipes, boilers, and heat exchangers.

**Process:** Ion exchange resin (Na⁺ replaces Ca²⁺ / Mg²⁺)

**Components:**
- Resin tank (cation exchange resin beads)
- Brine tank (salt + water for regeneration)
- Control valve (automatic regeneration timer or meter-based)
- Bypass line (for regeneration period)

**Regeneration cycle:** Backwash → Brine draw (regeneration) → Slow rinse → Fast rinse → Service

### Filtration

| Filter Type | Removes | Typical Application |
|---|---|---|
| Multimedia (sand + gravel) | Suspended solids, turbidity | Raw water pre-treatment |
| Carbon | Chlorine, organic compounds, odor | Potable water, RO pre-treatment |
| Cartridge (5-50 micron) | Fine particles | RO pre-treatment, point-of-use |
| Bag filter | Particles > 1 micron | Process water, special applications |
| UV sterilizer | Bacteria, viruses, protozoa | Municipal water polishing |
| Chlorination | Bacteria, viruses, biofilm | Storage tank disinfection, pool |

### Dosing Systems

| Chemical | Purpose | Typical Dose |
|---|---|---|
| Antiscalant | Prevent RO membrane scaling | 2-6 ppm |
| Sodium hypochlorite (bleach) | Disinfection | 1-3 ppm free chlorine |
| Sodium bisulfite | RO membrane preservation | 10-20 ppm |
| Corrosion inhibitor | Pipe protection | 1-3 ppm |
| pH adjuster (acid/base) | pH control | Variable |

## Water Pumping Systems

### Pump Types in Hotels

| Pump Type | Application | Common Brands |
|---|---|---|
| Centrifugal (end-suction) | General water transfer, booster | Grundfos, Wilo, KSB |
| Multistage (vertical) | Booster sets, high-pressure applications | Grundfos CR, Lowara |
| Submersible | Borehole / well water | Franklin, Grundfos SP |
| Split-case | Large volume, low head (circulation) | KSB, ITT Goulds |
| Self-priming | Suction lift applications | Pedrollo, Dab |
| Sewage / effluent | Wastewater transfer | Flygt, ABS |

### Pump Configuration
- **Duty + Standby:** Most critical systems (booster, sewage, circulation)
- **Duty + Assist + Standby:** High-demand systems (irrigation, large water supply)
- **Duplex:** 2 pumps alternating duty cycles
- **VFD control:** Variable speed for constant pressure

## Water Heating Systems

(See also Plumbing.md for domestic hot water)

### Solar Water Heating

Sharm El Sheikh receives 300+ sunny days per year — ideal for solar thermal.

**System types:**
- **Flat plate collectors:** Most common, 1.5-2.5 m² per panel, 40-70% efficiency
- **Evacuated tube collectors:** Higher efficiency, better in cooler weather, 50-80% efficiency
- **Heat pipe tubes:** Thermal diode effect, freeze protection

**Solar fraction (Sharm):** 60-85% (excellent — backup heating only needed during cloudy periods and overnight)

**Typical configuration:**
- 50-200+ m² collector area (depending on hotel size)
- 5000-20,000+ liter storage tank (stratified)
- Heat exchanger (glycol loop to potable water)
- Backup: Electric immersion or boiler heat exchanger

**Common issues:**
- Glass breakage (hail, thermal shock)
- Glycol degradation (overheating in stagnation)
- Control sensor failure
- Circulation pump failure
- Scale in collector tubes (hard water)

### Heat Pumps

Increasingly used for domestic hot water in hotels (COP 3-5 for water heating).

- Air-to-water heat pump (absorbs heat from ambient air)
- Waste heat recovery (from chiller condenser)
- Ground-source (higher COP but much higher CAPEX)

## Water Conservation

### Key Metrics
- Liters per occupied room per night (LPOR): Target < 800
- Liters per guest: Target < 400
- Water cost as % of total operating cost: 2-4%

### Conservation Strategies
- **Flow restrictors:** 6-9 L/min (shower), 2-4 L/min (faucet)
- **Dual-flush toilets:** 3/6 L flush (vs. old 9-12 L)
- **Low-flow fixtures:** Aerated faucets, efficient shower heads
- **Greywater recycling:** Shower + basin water treated and reused for irrigation or toilet flushing
- **Condensate recovery:** HVAC condensate collected for irrigation or cooling tower makeup
- **Rainwater harvesting:** Minimal in Sharm (negligible annual rainfall)
- **Leak detection program:** Regular survey of underground pipes for unreported leaks
- **Cooling tower conductivity control:** Optimize cycles of concentration to reduce blowdown

### Greywater Treatment

**Process:** Greywater (showers + basins) → Screening → Biological treatment → Filtration → Disinfection → Storage → Irrigation

**Typical system in Sharm:**
- 20-50 m³/day capacity (depending on hotel size)
- MBR (Membrane Bioreactor) or MBBR (Moving Bed Biofilm Reactor) technology
- Produces water suitable for landscape irrigation
- Reduces fresh water demand by 20-30%

## Water Quality Monitoring

| Parameter | Potable Water Limit | Test Frequency | Issue if out of spec |
|---|---|---|---|
| pH | 6.5-8.5 | Daily | Corrosion, taste |
| TDS | < 1000 ppm | Weekly | Scale, taste |
| Free Chlorine | 0.2-1.0 ppm | Daily | Biocontrol |
| Total Hardness | < 200 ppm (CaCO3) | Monthly | Scale |
| Iron | < 0.3 ppm | Monthly | Staining, taste |
| Manganese | < 0.1 ppm | Monthly | Staining |
| Coliform bacteria | 0 CFU/100 mL | Monthly | Health hazard |
| Legionella | < 100 CFU/L | Quarterly | Health hazard |
| Turbidity | < 1 NTU | Monthly | Filtration effectiveness |

## Standards & Regulations

- **WHO Guidelines for Drinking-Water Quality**
- **Egyptian Standard ES 180/2005:** Potable water
- **Egyptian Law 48/1982:** Wastewater discharge standards
- **ASHRAE 188:** Legionella risk management
- **NSF/ANSI 61 & 372:** Drinking water system components
- **ISO 14046:** Water footprint assessment

## AI Opportunities

- **RO Plant Optimization:** ML model optimizes recovery rate and chemical dosing based on feed water quality, reducing energy and membrane fouling
- **Water Consumption Forecasting:** Predict water demand by hour/day/season → optimize pumping schedule and chemical treatment
- **Leak Detection (Water Balance):** Monitor bulk + submeter flow data to detect real losses > 2% of total consumption
- **Water Quality Prediction:** Feed forward ML that predicts RO product water quality and alerts before spec drift
- **Irrigation Optimization:** ML + weather forecast to schedule irrigation at optimal time and duration
- **Membrane Life Prediction:** Track pressure, flow, and water quality to predict remaining membrane life and schedule replacement
- **Solar Thermal Efficiency:** Monitor collector temperature, flow, and weather to predict when collector cleaning or maintenance is needed
- **Greywater System Health:** Monitor biological treatment parameters → predict process upset before effluent quality degrades
