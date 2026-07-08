# Supply — Logistics and Delivery to Site

## Overview

The supply/logistics process manages the transportation, tracking, and delivery of materials and equipment from suppliers or warehouse to project sites, ensuring timely availability for project execution.

---

## BPMN Description

**Start Event:** Materials ready for dispatch (from vendor or warehouse)

1. **Review Delivery Schedule** — Consolidate pending deliveries across POs and projects
2. **Plan Logistics Route** — Determine optimal transport route and method
3. **Select Transport Mode** — Road, sea, air, or multimodal based on urgency and cost
4. **Arrange Transport** — Book carrier, confirm vehicle/vessel availability
5. **Prepare Shipment** — Pick, pack, and label materials
6. **Generate Packing List** — Detailed list of items in shipment
7. **Complete Dispatch Documentation** — Waybill, delivery note, customs docs (if cross-border)
8. **Dispatch Goods** — Load and send shipment
9. **Track Shipment** — Monitor progress along route
10. **Update Estimated Arrival** — Communicate ETA changes to site
11. **Handle Transit Issues** — Address delays, damages, or documentation problems
12. **Notify Site of Arrival** — Alert site team for receiving preparation
13. **Deliver to Site** — Arrive at project location
14. **Unload and Inspect** — Site team verifies quantity and condition
15. **Complete Delivery Note** — Sign off on delivery
16. **Resolve Discrepancies** — Handle shortages, damages, or overages
17. **Update Inventory Records** — Record materials at site
18. **Confirm Delivery Completion** — Close delivery in system

**End Event:** Delivery completed and confirmed

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Logistics Coordinator | Plans and manages logistics | Supply, Procurement |
| Warehouse / Store Keeper | Prepares and dispatches goods | Inventory |
| Transport Provider / Carrier | Executes transportation | External |
| Site Supervisor | Receives goods at project site | Supply, Project |
| Project Manager | Coordinates delivery timing | Project |
| Procurement Officer | Coordinates with vendor dispatch | Procurement |
| Freight Forwarder (if international) | Handles customs and international shipping | External |

---

## Inputs

| Input | Source |
|-------|--------|
| Purchase order delivery schedule | Procurement |
| Goods ready notification | Vendor / Warehouse |
| Packing list | Vendor / Warehouse |
| Project location and access details | Project |
| Transport availability | Carriers |
| Customs and import documentation | Vendor / Freight forwarder |
| Delivery schedule | Project, Procurement |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Delivery plan | Logistics schedule | Supply, Project |
| Packing list | Shipment contents | Site, Customs |
| Waybill / Bill of lading | Transport document | Carrier, Site |
| Delivery note | Proof of delivery | Vendor, Procurement |
| Goods receipt confirmation | Site acceptance | Procurement, Inventory |
| Delivery status updates | Tracking information | Project, Procurement |
| Discrepancy report | Damage/shortage documentation | Procurement, Vendor |

---

## Business Rules

- Delivery must be scheduled at least 48 hours before arrival at site
- Dedicated transport required for high-value or sensitive equipment
- Hazardous materials require special handling documentation
- International shipments require customs clearance before dispatch
- Site must confirm readiness to receive before dispatch
- Proof of delivery required within 24 hours of arrival
- Damage claims must be filed within 7 days of delivery
- Overnight storage at site requires prior approval if no receiving during working hours

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Delivery plan/schedule | Logistics timeline |
| Packing list | Itemized shipment contents |
| Waybill / Bill of lading | Transport documentation |
| Delivery note | Proof of delivery |
| Goods receipt note | Site acceptance |
| Customs declaration | Cross-border documentation |
| Damage/shortage report | Discrepancy record |
| Insurance certificate | Cargo insurance |
| Transport request form | Internal logistics request |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| On-time delivery rate | > 90% | On-time deliveries / Total deliveries |
| Delivery lead time | Per route target | Dispatch date - Delivery date |
| Damage rate | < 1% | Damaged items / Total delivered items |
| Shortage rate | < 1% | Shortage incidents / Total deliveries |
| Proof of delivery turnaround | < 24 hours | Delivery - POD received |
| Logistics cost vs budget | < 5% over | Actual cost / Budgeted cost |
| Delivery reschedule rate | < 10% | Rescheduled / Total deliveries |
| Customs clearance time (international) | < 5 business days | Arrival - Clearance |
