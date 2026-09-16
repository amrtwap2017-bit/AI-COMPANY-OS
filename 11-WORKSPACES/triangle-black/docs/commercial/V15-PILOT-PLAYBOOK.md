# TRIANGLE BLACK — V15 First Customer Pilot Playbook
## One real hotel. One real dataset. One verified ROI.

---

## TARGET CUSTOMER PROFILE

Ideal first customer:
- Egyptian engineering company managing 3-10 hotels
- Has in-house engineering team
- Currently uses spreadsheets/WhatsApp for WO management
- Has PM schedule (even if paper-based)
- Has historical WO data (even if basic)
- Leadership wants operational visibility

---

## PILOT STRUCTURE

### Week 0: Onboarding (2-3 days)
Goal: Customer is operational WITHOUT developer intervention

Steps:
1. Customer creates account / receives login
2. Customer creates hotel in system (self-service)
3. Customer uploads asset register (Excel/CSV)
4. System maps, validates, previews → customer confirms
5. Customer uploads WO history (3 months minimum)
6. Customer uploads PM plans
7. Customer adds technicians + suppliers
8. System generates Data Quality Report
9. Day 0 baseline automatically captured
10. Customer reviews dashboard — DONE

Acceptance criterion: Customer operational in < 4 hours, no SQL manipulation.

### Week 1: Operational Control
Focus: Critical WOs + Overdue PM + Attention
Daily: Customer sees Attention dashboard
Action: Assign + track 5-10 WOs through system
Goal: Operational truth visible

### Week 2: Intelligence
Focus: AI Recommendations + Evidence
Daily: Customer reviews pending recommendations
Action: Approve/reject 3-5 recommendations
Goal: First human decisions captured

### Week 3: Optimization
Focus: Actions + Outcomes recording
Daily: Customer records what happened after approved actions
Action: POST /api/v1/recommendations/{id}/outcome for real events
Goal: First real outcomes in system

### Week 4: ROI
Focus: Before/after comparison + Customer verification
Action: Customer verifies outcomes (Level 3 evidence)
Deliver: Executive PDF report
Goal: Customer confirms ≥1 verified improvement

---

## SUCCESS CRITERIA

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Onboarding time | < 4 hours | Timer from first login |
| Data imported | Real hotel data | Asset count > 0 |
| Baseline captured | Day 0 | GET /pilot/baseline |
| Recommendations acted | ≥5 | recommendation.status=approved |
| Outcomes recorded | ≥10 | outcome IS NOT NULL |
| Customer-verified | ≥1 | evidence_level >= 3 |
| Executive report | 1 delivered | PDF sent to GM |
| Renewal decision | Positive | Paid contract offered |

---

## HONEST METRICS POLICY

Every dashboard shown to customer must display:
- Data source (REAL/IMPORTED/GENERATED)
- Coverage % 
- Confidence level
- Last updated

Never show:
- Internal seeded outcomes as customer outcomes
- System-generated ROI as customer ROI
- AI estimates as verified savings

---

## EVIDENCE HIERARCHY FOR CUSTOMER CLAIMS

Level 0: System generated (do NOT show to customer as proof)
Level 1: System-measured (show with ESTIMATED label)
Level 2: Operator-confirmed (show with REPORTED label)
Level 3: Customer-confirmed (show as VERIFIED)
Level 4: Financially documented (show as CERTIFIED)

Only L3+ may appear in executive reports as real ROI.

---

## PILOT REPORT STRUCTURE

1. Executive Summary (1 page)
   - Operational health score before/after
   - Key improvements
   - Verified savings

2. Operational Performance
   - WO completion rate
   - PM compliance
   - Critical WO response time
   - Repeat failure rate

3. AI Intelligence Results
   - Recommendations generated
   - Accepted vs rejected
   - Actions taken
   - Outcomes measured

4. Verified Financial Impact (Level 3+ only)
   - Avoided repair costs
   - Downtime prevented
   - PM compliance improvement value
   - Procurement savings

5. Next 30 Days
   - Recommended focus areas
   - Pending recommendations
   - Overdue PM schedule

6. Contract Proposal
   - Scope: X hotels
   - Monthly fee: EGP X
   - Implementation: EGP X
   - Expected ROI: X

---

## PRICING FRAMEWORK (first customer)

Conservative starting point:
- Implementation: EGP 30,000-80,000 (one-time)
- Monthly platform: EGP 3,000-8,000 per hotel
- Pilot: FREE (no payment until proven)

Negotiate based on:
- Number of hotels
- Data quality
- Verified ROI in pilot
- Relationship potential
