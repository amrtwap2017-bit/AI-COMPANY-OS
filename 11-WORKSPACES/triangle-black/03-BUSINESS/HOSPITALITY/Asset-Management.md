---
ID: 04-Hospitality-17
Title: Asset-Management
Purpose: Document hotel asset lifecycle from registration through maintenance to depreciation and replacement
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Asset Management

## Overview

Hotel asset management covers all physical assets owned by the property — from a $50,000 chiller to a $5 towel rail. Triangle Black's platform must track every piece of equipment that requires maintenance, procurement, or replacement. Proper asset management enables preventive maintenance scheduling, lifecycle cost analysis, procurement planning, and regulatory compliance.

## Asset Classification

### By Criticality

| Class | Definition | Examples | Maintenance Approach |
|---|---|---|---|
| A - Critical | Business-stopping failure | Chiller, generator, fire pump | Predictive + preventive, N+1 |
| B - High | Major guest impact | FCU, elevator, water pump | Preventive, planned spares |
| C - Medium | Moderate impact | Ice machine, pool pump | Preventive, calendar-based |
| D - Low | Minor impact | Light fixtures, furniture | Corrective, condition-based |

### By Category

| Asset Category | Subcategories | Typical Count (300-room hotel) |
|---|---|---|
| HVAC | Chillers, AHUs, FCUs, cooling towers, boilers, pumps | 500-1500+ |
| Electrical | Switchboards, generators, UPS, distribution panels | 100-500+ |
| Plumbing | Pumps, calorifiers, tanks, pipes, fixtures | 500-2000+ |
| Fire & Life Safety | Panels, detectors, sprinklers, extinguishers, pumps | 500-3000+ |
| Kitchen | Ovens, fryers, dishwashers, refrigeration | 50-200+ |
| Laundry | Washers, dryers, ironers, presses | 20-50+ |
| Pool | Pumps, filters, heaters, chemical controllers | 10-30+ |
| Lifts / Elevators | Passenger, service, dumbwaiter | 3-15+ |
| IT / AV | Servers, switches, TV, IPTV | 100-500+ |
| FF&E | Furniture, carpet, curtains, artwork | 3000-10000+ |
| Building fabric | Roof, façade, structure | 1 (counted as asset) |

### Asset Hierarchy (Example)

```
Property
└── Guest Room Wing
    └── Floor 3
        └── Room 301
            ├── FCU-301 (Fan Coil Unit)
            │   ├── Fan motor (asset)
            │   ├── Chilled water coil (component)
            │   └── Thermostat (subcomponent)
            ├── TV-301
            ├── Safe-301
            ├── MiniBar-301
            ├── SmokeDetector-301
            └── SprinklerHead-301
```

## Asset Registration

### Required Data per Asset

| Field | Type | Example |
|---|---|---|
| Asset ID | Unique identifier | HVAC-CH-01 |
| Name / Description | Text | Centrifugal Chiller - Carrier 30XB 400TR |
| Category | Taxonomy | HVAC > Chiller > Centrifugal |
| Location | Node in hierarchy | Main Plant Room |
| Manufacturer | Text | Carrier |
| Model | Text | 30XB400V |
| Serial Number | Text | 2024-CAR-12345 |
| Year of Manufacture | Date | 2024 |
| Installation Date | Date | 2024-06-15 |
| Warranty Expiry | Date | 2029-06-15 |
| Expected Life | Years | 20 |
| Replacement Cost | Currency | $180,000 |
| Current Value (NBV) | Currency | $162,000 |
| Criticality | A/B/C/D | A |
| Operating Hours Counter | Numeric | 4,320 hours |
| Linked Documents | URLs | Manual, datasheet, as-built |
| Barcode / QR / RFID Tag | String | TB-HVAC-CH-01 |
| Responsible Technician | Person | Ahmed Ali |
| Status | Active/Inactive/Disposed | Active |
| Last PM Date | Date | 2026-06-01 |
| Next PM Due | Date | 2026-07-01 |

### Asset Tagging

| Method | Readability | Cost | Durability | Use Case |
|---|---|---|---|---|
| Barcode (sticker) | Visual scan | Low | Moderate | Indoor equipment |
| QR code | Smartphone scan | Low | Moderate | All assets |
| RFID (passive) | Close-range batch | Moderate | High | Linen tracking, tools |
| RFID (active) | Long-range | High | High | Mobile equipment |
| NFC tag | Proximity scan | Low | High | Small assets |
| Metal tag (engraved) | Visual | Moderate | Very high | Harsh environments |

## Asset Lifecycle

```
Procurement → Registration → Operation → 
    ↓                          ↓
Maintenance ←──────────────────┘
    ↓
Repair / Overhaul → Continue OR Reassess
    ↓
Decommissioning → Disposal / Sale
```

### Phase 1: Procurement & Installation
- Asset specified and purchased
- Installed and commissioned
- As-built drawings and O&M manuals collected
- Asset registered in system
- Warranty period begins

### Phase 2: Operation
- Asset operates as designed
- Energy consumption tracked
- Performance monitored
- Log sheets completed

### Phase 3: Maintenance
- Preventive maintenance (scheduled)
- Corrective maintenance (as needed)
- Predictive maintenance (condition-based)
- All maintenance recorded against asset

### Phase 4: Major Overhaul / Refurbishment
- Mid-life asset upgrade
- Extends useful life (e.g., new compressor on chiller)
- Costs capitalized or expensed based on value increase

### Phase 5: End of Life
- **Trigger condition:** MTBF declining sharply, repair cost > 50% of replacement cost, parts unavailable, efficiency below acceptable threshold
- **Decision:** Replace, upgrade, or decommission
- **Decommissioning:** Dispose of asset (sell, scrap, donate)
- **System:** Asset status set to "Disposed"

## Depreciation Methods

| Method | Description | Used For |
|---|---|---|
| Straight line | Equal annual depreciation = (Cost - Salvage) / Life | Most hotel FF&E |
| Declining balance | Higher first-year depreciation | IT equipment |
| Units of production | Based on usage (hours, cycles, kg) | Heavy equipment |
| Component depreciation | Separate life per component | Complex assets (chiller) |

**Typical asset life by category (for depreciation):**

| Category | Life (Years) | Salvage Value |
|---|---|---|
| HVAC - Chillers | 15-20 | 10% |
| HVAC - FCUs | 10-15 | 5% |
| HVAC - AHUs | 15-20 | 10% |
| Generators | 15-20 | 10% |
| Electrical Panels | 20-25 | 5% |
| Kitchen Equipment | 10-15 | 5% |
| Laundry Equipment | 10-15 | 5% |
| Pool Equipment | 8-12 | 5% |
| Furniture | 5-8 | 0% |
| Carpets | 3-5 | 0% |
| TVs | 3-5 | 0% |
| IT Equipment | 3-5 | 0% |

## Maintenance Cost Tracking by Asset

### Typical Maintenance-to-Replacement Cost Ratios

| Asset Type | Annual Maintenance as % of Replacement Cost | Threshold for "Repair vs. Replace" |
|---|---|---|
| Chiller | 2-4% | Repair > 50% of replacement cost |
| FCU | 5-8% | Repair > 60% of replacement cost |
| Generator | 3-5% | Repair > 40% of replacement cost |
| Kitchen oven | 5-10% | Repair > 40% of replacement cost |
| Laundry washer | 5-8% | Repair > 50% of replacement cost |
| Pool pump | 8-12% | Repair > 50% of replacement cost |
| Guest room TV | 3-5% | Repair > 30% of replacement cost |

### Lifecycle Cost Analysis

| Metric | Formula | Meaning |
|---|---|---|
| Acquisition Cost | Purchase + installation + commissioning | Initial investment |
| Operating Cost | Energy + water + consumables per year | Running expense |
| Maintenance Cost | PM + corrective + repair cost per year | Upkeep expense |
| Total Cost of Ownership | Acquisition + ∑(Annual operating + maintenance) over life | True cost |
| Net Present Value (NPV) | ∑(Cash flows / (1+r)^n) | Investment viability |
| Equivalent Annual Cost | TCO / annuity factor | Annualized cost for comparison |

## Spare Parts Management

### Spare Parts Strategy by Asset Criticality

| Criticality | Spare Parts Approach | Inventory Target |
|---|---|---|
| A - Critical | Full set of critical spares on site | Every item that could cause > 1 day downtime |
| B - High | Key spares on site, rest from supplier within 24h | Filters, belts, seals, common electronic modules |
| C - Medium | Minimal on-site spares, supplier stock | Common consumables |
| D - Low | No on-site spares, order as needed | None |

### Recommended Spares Inventory (chiller example)

| Part | Lead Time | Critical | On-Hand Qty |
|---|---|---|---|
| Oil filter | 2 weeks | Yes | 4 |
| Refrigerant (R-134a, 1000kg drum) | 4 weeks | Yes | 1 drum |
| Compressor motor bearings | 6 weeks | Yes | 2 sets |
| Electronic expansion valve (EXV) | 3 weeks | Yes | 1 |
| Capacitor (start/run) | 1 week | Medium | 5 |
| Pressure transducer | 2 weeks | Medium | 2 |
| Display board | 4 weeks | Medium | 1 |
| Gasket set (OEM) | 6 weeks | Low | 1 set |

## Warranty Management

| Warranty Type | Typical Duration | Coverage | Management |
|---|---|---|---|
| Manufacturer | 1-2 years from purchase | Parts + labor (sometimes) | Register at purchase, track expiry |
| Extended | 3-5 years | Parts only or full | Optional, cost analysis |
| Contractor / Installation | 1 year | Workmanship | Track defect liability period |
| Statutory | Varies | Consumer rights | Know local law |

**Warranty claim process:**
1. Identify failure within warranty period
2. Notify supplier/manufacturer (documented)
3. Provide evidence (photos, logs, failure analysis)
4. Obtain RMA (Return Material Authorization)
5. Repair or replace under warranty
6. Close claim

## Asset Register Audit

| Audit Type | Frequency | Scope |
|---|---|---|
| Reconciliation | Annual | Verify system asset count vs. physical count |
| Condition survey | Annual | Visual assessment of asset condition (1-5 scale) |
| Criticality review | Annual | Update criticality based on failure history |
| Depreciation check | Annual | Verify remaining life, update if needed |
| Disposal audit | Annual | Verify disposed assets removed from register |

### Condition Rating Scale

| Rating | Description | Action |
|---|---|---|
| 1 - Excellent | Like new, recently installed or overhauled | Normal PM |
| 2 - Good | Normal wear, operates as designed | Normal PM |
| 3 - Fair | Minor issues, needs attention | Increase monitoring, plan repair |
| 4 - Poor | Significant deterioration, frequent failures | Plan replacement within 1 year |
| 5 - Critical | Imminent failure, unreliable | Immediate replacement or overhaul |

## AI Opportunities

- **Asset Life Prediction:** ML model using age, maintenance history, operating conditions, and manufacturer data → predict remaining useful life
- **Optimal Replacement Timing:** Economic model combining maintenance cost trend, failure risk, energy efficiency, and replacement cost → recommend optimal replacement year
- **Warranty Claim Auto-Filing:** NLP reads failure report → determines if in warranty → auto-generates claim
- **Spare Parts Demand Forecasting:** ML predicts spare part consumption based on asset age, failure history, and season
- **Duplicate Asset Detection:** NLP and fuzzy matching to identify duplicate asset records (same equipment registered twice)
- **Asset Registry Auto-Population:** AI extracts equipment data from O&M manuals, purchase orders, and commissioning reports → auto-create asset records
- **Condition Assessment from Text:** NLP analysis of technician notes → generate condition score
- **Lifecycle Cost Benchmarking:** Compare lifecycle costs across similar assets and properties → identify cost outliers
