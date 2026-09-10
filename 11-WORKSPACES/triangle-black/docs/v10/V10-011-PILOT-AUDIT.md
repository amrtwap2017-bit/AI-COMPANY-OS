# V10-011 PILOT ONBOARDING AUDIT
Generated: 2026-09-10 06:09

## EXISTING INFRASTRUCTURE (DO NOT REBUILD)

| Component | Exists | File |
|-----------|--------|------|
| pilot_control router | ✅ | src/commercial/pilot_control/router.py |
| pilot_control service | ✅ | src/commercial/pilot_control/service.py |
| data_import router | ✅ | src/commercial/data_import/router.py |
| data_import service | ✅ | src/commercial/data_import/service.py |
| onboarding router | ✅ | src/commercial/onboarding/router.py |

## 30-DAY PILOT PROGRAM STRUCTURE

### Day 0: Data Import + Baseline
Required imports:
- Asset register (name, category, criticality, location, site)
- PM plans (asset, frequency, next_due, last_done)
- WO history (90 days minimum)
- Technicians (name, role, email)
- Suppliers (name, category, contact, rating)

Baseline KPIs to capture BEFORE:
- WO→Asset linkage %
- PM compliance %
- Overdue PM count
- Unassigned WO count
- Critical WO backlog
- MTTR (where calculable)
- Avg WO response time

### Week 1: Operational Control
Focus: critical WOs, unassigned WOs, overdue PM

### Week 2: Intelligence
Focus: repeat failures, asset risk, AI recommendations

### Week 3: Optimization
Focus: response time, PM compliance, supplier performance

### Week 4: ROI
Measure: Before vs After on all baseline KPIs
Produce: ROI report with evidence

## V10-011 GAPS TO BUILD

Based on audit:
1. Pilot baseline capture endpoint (Day 0 snapshot)
2. Pilot progress tracking (week-by-week)
3. ROI calculation endpoint
4. Customer-facing pilot report

## WHAT NOT TO BUILD

❌ Don't rebuild data_import (already exists)
❌ Don't rebuild onboarding (already exists)
❌ Don't rebuild pilot_control (already exists)

DO: Extend existing infrastructure with:
✅ Baseline KPI capture
✅ Week-by-week comparison
✅ ROI calculation
✅ Pilot status dashboard API
