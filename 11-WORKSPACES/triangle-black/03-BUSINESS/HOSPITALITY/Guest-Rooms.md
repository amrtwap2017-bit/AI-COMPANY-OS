---
ID: 04-Hospitality-15
Title: Guest-Rooms
Purpose: Document guest room systems including HVAC controls, lighting, entertainment, and maintenance standards
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Guest Rooms

## Overview

The guest room is the hotel's primary product. Everything in the room must work perfectly and intuitively — guests expect "invisible" engineering. The most common guest complaints globally involve AC (too cold/noisy/not working), water pressure, TV, WiFi, and door locks. Engineering's goal is zero guest defects.

## Guest Room Systems Diagram

```
┌─────────────────────────────────────────┐
│            Guest Room                    │
│                                         │
│  ┌─────────┐   ┌───────────────┐       │
│  │ HVAC    │   │ Electrical    │       │
│  │  FCU    │   │  Lighting     │       │
│  │  Thermo │   │  Sockets      │       │
│  │  T-stat │   │  Switches     │       │
│  └─────────┘   └───────────────┘       │
│                                         │
│  ┌─────────┐   ┌───────────────┐       │
│  │ LSA     │   │ Plumbing      │       │
│  │  Smoke  │   │  WC           │       │
│  │  Sprink │   │  Wash basin   │       │
│  │  CO    │   │  Shower       │       │
│  └─────────┘   └───────────────┘       │
│                                         │
│  ┌─────────┐   ┌───────────────┐       │
│  │ IT / AV │   │ Furniture     │       │
│  │  TV     │   │  Bed          │       │
│  │  Phone  │   │  Desk         │       │
│  │  WiFi   │   │  Wardrobe     │       │
│  │  Safe   │   │  Seating      │       │
│  └─────────┘   └───────────────┘       │
└─────────────────────────────────────────┘
```

## HVAC in Guest Rooms

### Fan Coil Unit (FCU) — Most Common

**Location:** Above bathroom ceiling or in corridor ceiling near room entrance

**Components:**
- Fan (3-speed or ECM — Electronically Commutated Motor)
- Chilled water coil (cooling)
- Electric heater (heating — only needed in winter months in Sharm)
- Condensate drain pan with drain line
- Washable filter

**Thermostat Types:**

| Type | Features | Use Case |
|---|---|---|
| Mechanical (dial) | On/Off, basic temp control | Budget hotels |
| Digital (wall-mounted) | LCD, temperature display, setpoint | Mid-scale |
| Smart thermostat | Occupancy sensing, WiFi, PMS integration | Upscale/Luxury |
| Key-card controlled | On/off via room key card | Most hotels |

### Guest Room Temperature Control Logic

| Mode | Setpoint | Fan Speed | Notes |
|---|---|---|---|
| Occupied (guest present) | 22-24°C (cooling) | Guest adjustable | Key card inserted |
| Unoccupied (room empty) | 26-28°C | Low or off | Key card removed, economy setback |
| VIP pre-conditioning | 22°C | Medium | Set by housekeeping before VIP arrival |
| Minimum setpoint | 18°C (hard limit) | — | Prevent freezing pipes |
| Maximum setpoint | 30°C (hard limit) | — | Energy conservation |

### Energy Management System (EMS) in Rooms

- **Key-card switch:** Insert card → power on; remove → timed power-off (usually 30-60 sec delay)
- **Occupancy sensor:** PIR sensor detects presence → maintains comfort mode
- **Door/window contact:** Open window → FCU turns off (energy conservation)
- **PMS integration:** Check-out → room set to economy; check-in → pre-condition before guest arrives

### Common HVAC Issues in Guest Rooms

| Issue | Root Cause | Guest Complaint |
|---|---|---|
| Room too cold/hot | Thermostat location (in draft), calibration drift | "AC doesn't work" |
| FCU noisy | Bearing wear, loose bracket, fan imbalance | "Can't sleep, noise from ceiling" |
| Water leak from ceiling | Condensate drain blocked | "Water dripping from ceiling" |
| Musty smell | Condensate pan stagnant, filter dirty | "Room smells bad" |
| AC cycles on/off rapidly | Thermostat location, short cycling | "AC blows warm then cold" |
| Remote not working | Dead battery, IR receiver blocked | "Can't control AC" |

## Electrical in Guest Rooms

### Lighting

**Typical lighting configuration:**

| Fixture | Type | Control | Wattage (LED) |
|---|---|---|---|
| Ceiling downlights | LED 3000K warm white | Wall switch or key-pad | 5-10W each |
| Bedside lamps | LED ambient | Individual + central off | 3-7W |
| Desk lamp | LED task | Individual switch | 5-10W |
| Bathroom vanity | LED strip | Wall switch | 5-15W |
| Mirror light | LED backlit | Motion or switch | 5-10W |
| Reading light (over bed) | LED directional | Individual switch | 3-5W |
| Night light | LED soft | Automatic (dusk sensor) | 1-3W |
| Closet light | LED | Door switch | 2-5W |

**Lighting controls:**
- Entrance switch: Turns on entry light(s)
- Master switch (bedside): Turns off all room lights from bed
- Bathroom switch: Separate control
- Dimmable scene controls (luxury): "Welcome", "Sleep", "Reading", "TV"

### Guest Room Sockets

| Location | Type | Qty | Notes |
|---|---|---|---|
| Desk | Universal (USB-A + USB-C + Schuko/UK/US) | 1-3 | International travelers |
| Bedside | USB-A + USB-C + power | 1-2 per side | Phone charging |
| TV area | Power + media panel | 1 | TV, streaming device |
| Bathroom | Shaver socket (110-240V) | 1 | Near mirror |
| Floor | Vacuum cleaner socket | 1 | For housekeeping |

**Key requirement:** USB-C PD (Power Delivery) 60W+ for laptop charging is becoming a brand standard.

### TV & Entertainment

**Typical setup:**
- 43-65" LED/LCD TV (brand-specific: Samsung, LG, Philips)
- IPTV or satellite receiver
- Casting (Chromecast / AirPlay) — increasingly expected
- Interactive TV: Room service, billing, checkout, hotel info
- External inputs: HDMI (guest can connect laptop)

**Common issues:**
- Remote control missing or dead
- TV not responding (power supply, main board)
- IPTV system down (network-related)
- Casting not working (network configuration)
- HDMI port damaged (overuse)

### Guest Room Safes

- Electronic combination safe (keypad + backup key)
- Size: Large enough for 15-17" laptop
- Internal power socket (for charging inside safe)
- Common failures: Keypad failure, locking mechanism jam, dead battery (with mechanical override)

### Door Locks

- RFID card-based electronic lock
- Mobile key (NFC/BLE) — increasingly common for upper-upscale
- Mechanical override (keyed cylinder)
- Battery-powered (AA or lithium, 12-24 month life)
- PMS integration: Auto-program cards at check-in

**Common failures:**
- Dead battery → can't open (check daily)
- RFID reader failure (wear, moisture)
- Misalignment (door sag → latch doesn't engage)
- Mobile key pairing issues

## Plumbing in Guest Rooms

### Bathroom Fixtures

| Fixture | Parts | Common Issues |
|---|---|---|
| Toilet | Flush valve, fill valve, wax ring, seat | Running, leaking, clogged, loose seat |
| Washbasin | Faucet (cartridge), pop-up drain, P-trap | Drip, drain slow, aerator clog |
| Shower | Thermostatic valve, shower head, drain, hose | Temperature fluctuation, head clog, drain slow |
| Bathtub (if present) | Filler spout, drain, overflow | Drain mechanism, sealant failure |
| Bidet (if present) | Faucet, spray | Supply hose, nozzle blockage |

### Hot Water in Guest Rooms

- Time to hot water at furthest room: < 30 seconds (brand standard)
- Typical issue in Sharm: Long hot water wait due to long piping runs in sprawling resorts
- Solution: Recirculation loop + zone pumps, or point-of-use mini heaters in remote rooms

### Water Pressure

- Guest comfort: 2.5-4 bar
- Low pressure causes: Scale in pipes, PRV failure, booster pump issue
- High pressure causes: Water hammer, fixture noise, pipe stress
- Sharm issue: Low municipal pressure + hard water scale in pipes

## Life Safety in Guest Rooms

| Device | Requirement | Maintenance |
|---|---|---|
| Smoke detector | 1 per room (room) | Battery check semi-annual |
| Heat detector | 1 per bathroom | Annual test |
| Sprinkler head | 1 per 20 m² | No obstructions, no paint |
| Emergency signage | Evacuation plan on door | Replace if damaged |
| Emergency lighting | Battery backup | 90-min test annually |
| Carbon monoxide detector | If garage adjacent | Check annually |
| In-room safe | Fire-rated | Annual lock test |
| Door viewer (peephole) | To identify visitors | Clean seal |
| Door chain/bolt | Additional security | Lubricate annually |

## Guest Room Maintenance Schedule

| Item | Frequency | Task |
|---|---|---|
| AC filter cleaning | Monthly (occupied) / Per checkout (unoccupied) | Wash or vacuum |
| AC condensate drain check | Quarterly | Pour biocide tablet, check flow |
| Smoke detector test | Semi-annual | Test button, replace battery if needed |
| Lighting check | Per checkout | Replace failed lamps |
| TV check | Per checkout | Clean remote, test casting |
| Toilet mechanism | Quarterly | Adjust flush, replace flapper |
| Faucet aerator clean | Semi-annual | Descale |
| Shower head clean | Semi-annual | Descale (vinegar soak) |
| Caulking / grout | Annual | Replace deteriorated caulk |
| Door lock battery | Annual (or when low) | Replace |
| Safe battery | Annual | Replace |
| Wardrobe hinges | Annual | Lubricate |
| Window / balcony door | Annual | Check seal, lubricate track |
| Emergency signage | Annual | Replace faded plan |
| Paint touch-up | As needed | Cover marks |

## Room Defect Types (from Guest Feedback)

| Category | Common Defects | % of Total (Est.) |
|---|---|---|
| HVAC | Temperature, noise, smell | 30-40% |
| Plumbing | Water pressure, temperature, leak | 20-25% |
| Electrical | Lighting, sockets, TV | 15-20% |
| Locks/Doors | Key card, lock, door closure | 10-15% |
| Furniture | Drawer, hinge, upholstery | 5-10% |
| Other | Safe, phone, minibar | 5-10% |

## Room Condition Inspection

Hotels inspect rooms at defined frequencies:

| Inspection Type | Who | Frequency | Purpose |
|---|---|---|---|
| Quick check | Housekeeping | Daily | Visible defects |
| Maintenance round | Engineering | Monthly | Functional checks |
| Deep inspection | Engineering + Housekeeping | Quarterly | Systematic condition audit |
| Pre-arrival inspection | Supervisor | Before VIP arrival | Zero defects |
| Annual condition assessment | Engineering manager | Annually | Capital planning input |

**Inspection checklist categories:**
- Ceiling (water stains, cracks)
- Walls (marks, damage)
- Flooring (carpet wear, tiles cracked)
- Bathroom (grout, caulking, fixtures)
- Furniture (scratches, stability)
- Systems (AC cold, water hot, TV working)
- Safety (smoke detector, sprinkler, signage)

## Brand Standards

Each hotel brand specifies guest room requirements:

| Brand | Temp Setpoint | TV Size | Socket Types | Shower Pressure |
|---|---|---|---|---|
| Hilton | 22°C ±2°C | 48" min | Universal + USB | > 3 bar |
| Marriott | 22°C ±2°C | 50" min | Universal + USB-C PD | > 2.8 bar |
| Accor | 21°C ±2°C | 43" min | Universal + USB | > 2.5 bar |
| Four Seasons | Guest preference | 55" min | Universal + USB-C | > 3.5 bar |

## AI Opportunities

- **Room Condition Prediction:** ML model uses inspection history, maintenance records, and room type to predict when each room will need significant repairs
- **Guest Comfort Personalization:** Learn guest temperature preferences from previous stays → pre-set room temperature before arrival
- **Predictive Component Failure:** Monitor FCU runtime, fan speed, valve position → predict filter change, motor bearing failure, coil cleaning need
- **Automated Room Inspection:** Computer vision (photo taken by housekeeping) → AI detects defects (burned-out lamp, stained carpet, missing towel)
- **Energy Optimization by Room:** Occupancy patterns + weather forecast + guest preferences → optimize FCU setpoint and scheduling per room
- **Maintenance Priority Scoring:** Rank rooms by defect severity and guest complaints → prioritize maintenance visits
- **Anomaly Detection in Guest Usage:** Detect unusual consumption patterns (door open, excessive AC, water running) → alert operations
- **Digital Twin for Guest Rooms:** Real-time model of every room system for predictive maintenance and energy management
