---
ID: 04-Hospitality-04
Title: Hotel-Procurement
Purpose: Document the hotel procurement lifecycle from RFQ through payment reconciliation
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Hotel Procurement

## Overview

Hotel procurement is the process of sourcing, purchasing, receiving, and paying for goods and services required to operate the property. In a typical hotel, procurement encompasses everything from toilet paper to chillers, making it one of the most cross-functional and high-volume operational activities.

## The Procurement Lifecycle

```
Request → RFQ → Quotation → PO → Delivery → Receiving → Invoice → Payment → Reconciliation
```

### Phase 1: Purchase Request (PR)

**Who initiates:** Department head or end-user (Chief Engineer, Executive Chef, Housekeeping Manager)

**What it contains:**
- Item description with specifications
- Quantity needed
- Required delivery date
- Budget code / cost center
- Justification (if non-routine)
- Attachments (e.g., photos of broken part)

**Pain Points:**
- Vague or incomplete specifications
- Emergency requests bypassing the process
- Manual paper forms getting lost

### Phase 2: Request for Quotation (RFQ)

**Who issues:** Purchasing Manager or Triangle Black procurement team

**Process:**
- Identify qualified suppliers (minimum 3 quotes for purchases > threshold)
- Send RFQ with specifications, delivery terms, payment terms
- Wait for supplier responses (typically 24-72 hours)
- Compare quotations on price, delivery time, warranty, payment terms

**Pain Points:**
- Emergency: "Just get it working" — bypasses RFQ entirely
- Single-source items (proprietary parts, brand-specific equipment)
- Suppliers delaying quotations, especially for small items

### Phase 3: Quotation Evaluation & PO

**Decision criteria:**
- Price (lowest compliant bid usually wins)
- Delivery lead time
- Payment terms (30/60/90 days net preferred)
- Warranty period
- Supplier relationship / past performance

**Purchase Order (PO) Creation:**
- Sequential PO number (property-specific prefix)
- Supplier details and delivery address
- Line items with prices, quantities, and specifications
- Payment terms and delivery date
- Authorized signatures per approval matrix

### Phase 4: Delivery & Receiving

**Receiving Process:**
- Scheduled deliveries arrive at loading dock
- Storekeeper or receiving clerk inspects against PO
- Quantity check: count or weigh items
- Quality check: visual inspection, test if applicable (e.g., filter media, chemicals)
- Report discrepancies immediately
- Sign delivery note (only what was received correctly)
- Log into inventory system

**Common Receiving Issues:**
- Wrong item delivered (different brand, model, or specification)
- Damaged goods hidden in packaging
- Short-shipped quantities
- No delivery note or PO reference
- After-hours delivery when no receiving staff available

### Phase 5: Invoice & Payment

**Three-Way Match:**
1. PO (what was ordered)
2. Delivery Note / GRN (what was received)
3. Invoice (what supplier is billing)

All three must match before payment is approved. Discrepancies trigger holds and queries.

**Payment Terms:**
- Standard: Net 30/60/90 days
- COD: Small suppliers, local merchants
- Advance payment: Extended lead times, custom equipment
- Letter of Credit: Large international purchases (> $50K)

**Pain Points:**
- Invoices arriving without PO reference
- Price differences between PO and invoice
- Missing delivery notes
- Delayed approvals for payment release
- Supplier pressure for early payment

### Phase 6: Reconciliation & Reporting

- Monthly supplier statement reconciliation
- Open PO report review
- Departmental spend analysis
- Budget vs. actual comparison
- Year-end accruals for goods received but not invoiced

## Procurement Categories in Hotels

### Engineering / MEP
- HVAC equipment and spares (compressors, fans, coils, filters, refrigerants)
- Electrical items (cables, breakers, lamps, ballasts, LEDs)
- Plumbing items (pipes, fittings, valves, pumps, fixtures)
- Fire safety (extinguishers, sprinkler heads, detectors, panels)
- Tools (hand tools, power tools, test equipment)
- Chemicals (water treatment, descaling, cleaning)

### F&B
- Food (fresh, frozen, dry, beverage)
- Kitchen equipment (ovens, fryers, refrigeration, dishwashers)
- Tableware (china, glass, silver, linen)
- Cleaning chemicals (kitchen-specific, non-toxic)

### Rooms / Housekeeping
- Guest supplies (soap, shampoo, amenities)
- Linen (sheets, towels, bathrobes)
- Cleaning equipment (vacuum cleaners, carpet cleaners)
- Cleaning chemicals (safe for guest use)
- Room furniture (case goods, upholstery)

### General & Administrative
- Office supplies
- Printers and IT consumables
- Uniforms
- Guest transportation (shuttle, valet)
- Marketing materials

## Approval Matrix (Typical)

| Value | Approval Required |
|---|---|
| < $500 | Department Head |
| $500 - $2,000 | Dept. Head + Financial Controller |
| $2,000 - $10,000 | Financial Controller + GM |
| $10,000 - $50,000 | GM + Owner Approval |
| > $50,000 | Corporate / Board |

## Emergency Procurement

Hotels also use emergency procurement when equipment fails and threatens operations:

- **Trigger:** Critical breakdown (chiller down, pump failure, power outage)
- **Process bypass:** Call supplier → deliver ASAP → paper trail later
- **Premium:** 20-50% above normal market price
- **Risk:** No competitive pricing, potential for abuse, quality unknown
- **Triangle Black opportunity:** Pre-position critical spares to eliminate emergency procurement premium

## Supplier Management

### Supplier Qualification Criteria
- License and commercial registration
- Reference checks with other hotels
- Product quality samples
- Delivery reliability track record
- Payment terms flexibility
- After-sales support and warranty

### Supplier Tiers

| Tier | Description | % of Spend | Relationship |
|---|---|---|---|
| Tier 1 | Strategic partners | 60% | Long-term agreements, priority pricing, SLAs |
| Tier 2 | Preferred suppliers | 25% | Regular use, competitive terms |
| Tier 3 | Transactional | 10% | Occasional use, standard terms |
| Tier 4 | Emergency-only | 5% | High prices, used when no alternative |

## Inventory Management

### Par Levels
- Minimum quantity of each item that must always be in stock
- Based on consumption rate and lead time
- Reorder point = (daily usage × lead time in days) + safety stock

### Slow-Moving & Obsolete Stock
- Items not used in 12+ months
- Should be identified and returned (if possible) or written off
- Common issue: "we might need it someday" hoarding

### Stock Counting
- Fast-moving: Monthly cycle count
- Slow-moving: Quarterly
- Full inventory: Annual (usually during low season)

## Procurement Fraud Risks

- **Kickbacks:** Supplier pays purchasing manager for PO placement
- **Overpricing:** Collusion between staff and supplier
- **Phantom deliveries:** Invoices paid for goods never received
- **Substitution:** Lower quality item at same price
- **Split orders:** Deliberately splitting POs to stay below approval threshold

## Regulatory Context (Egypt)

- Tax invoice requirements (VAT, withholding tax)
- Customs clearance for imported equipment
- Central Bank of Egypt foreign currency regulations
- Supplier registration with tax authority

## AI Opportunities

- **RFQ Automation:** AI generates RFQ from natural language request, sends to top 3 suppliers, evaluates responses
- **Three-Way Match Automation:** OCR + NLP to auto-match PO, delivery note, and invoice; flag only exceptions for human review
- **Spend Classification:** Auto-categorize procurement spend by department, category, and project
- **Emergency Procurement Detection:** Flag purchases that are emergency-priced and suggest pre-positioned alternatives
- **Supplier Performance Scoring:** Real-time supplier scorecard based on on-time delivery, quality, and pricing competitiveness
- **Price Benchmarking:** Compare quoted prices against market database to flag overpricing
- **Par Level Optimization:** Dynamic reorder points based on seasonality, lead time variability, and consumption trends
- **Fraud Detection:** Anomaly detection on PO patterns, supplier relationships, and approval bypasses
