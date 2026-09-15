# TRIANGLE BLACK — Data Trust Certification
## Date: 2026-09-15
## Status: CERTIFIED for internal validation, not yet customer-verified

## WO Classification States

| State | Meaning | Confidence | KPI Included |
|-------|---------|-----------|--------------|
| ASSET_LINKED | WO directly linked to specific asset | HIGH | YES |
| LOCATION_LINKED | WO linked to location, not specific asset | MEDIUM | YES |
| GENERAL_AREA | WO linked to area/floor only | LOW | YES |
| NON_ASSET | Administrative/non-equipment WO | VERIFIED | YES |
| UNKNOWN | No location or asset context | INSUFFICIENT | NO |
| ASSET_REQUIRED | Equipment WO missing asset link | P1 ISSUE | FLAGGED |

## Provenance Classification

| Class | Description | KPI Role |
|-------|-------------|----------|
| REAL | Legitimate operational data | INCLUDED |
| TEST | Test artifacts (Sprint021, T-005, V9-015) | EXCLUDED |
| DEMO | Demo/showcase data | EXCLUDED |
| IMPORTED | Customer-imported historical data | INCLUDED |
| GENERATED | System-generated data | DOCUMENTED |
| UNKNOWN | Cannot determine provenance | EXCLUDED from critical KPIs |

## CERTIFIED RULES
1. TEST/DEMO/GENERATED records NEVER contaminate customer KPIs
2. AI may SUGGEST WO→Asset match — human must CONFIRM
3. Every KPI must show CONFIDENCE level (HIGH/MEDIUM/LOW/VERY_LOW/INSUFFICIENT)
4. Internal ROI evidence ≠ Customer-verified ROI (always distinguish)

## Current Linkage Reality
- All WOs: ~6% directly linked (diluted by test data)
- Real WOs only: ~10-15% (after excluding test patterns)
- Preventive/HVAC/Mechanical WOs: 99-100% linked
- Corrective WOs: ~5% (needs customer asset register)

## RULE: AI SUGGESTION FLOW
WO Title Analysis → Candidate Asset → Confidence Score → HUMAN REVIEW → CONFIRMED LINK

Never: WO → Auto-link → KPI impact
Always: WO → Suggest → Human → Confirm → KPI

## Production Rule
Before any KPI is shown to a customer:
- Show DATA SOURCE
- Show COVERAGE %  
- Show CONFIDENCE
- Exclude TEST/DEMO/GENERATED from calculations
