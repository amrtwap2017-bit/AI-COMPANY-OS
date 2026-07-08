# 01-COMMERCIAL — Business Rules

## Lead Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| LEA-R01 | Duplicate detection: Same email within tenant | Unique constraint |
| LEA-R02 | Lead score range: 0-100 | Check constraint |
| LEA-R03 | Convert requires: company must exist | Transaction: create company if needed |
| LEA-R04 | Disqualified requires: reason | Validation |
| LEA-R05 | Auto-assignment: score ≥ 61 within 5 minutes | Event handler |

## Opportunity Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| OPP-R01 | Stage progression: forward only | State machine validator |
| OPP-R02 | Closed-lost requires: lost reason | Validation |
| OPP-R03 | Probability auto-set by stage: qual=10, analysis=25, proposal=50, negotiation=75, won=100, lost=0 | Service logic |
| OPP-R04 | Close date: must be ≥ creation date | Validation |
| OPP-R05 | Value cannot decrease below 0 | Check constraint |

## Site Survey Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| SRV-R01 | Survey must be linked to an opportunity | FK constraint |
| SRV-R02 | Surveyor must be an engineer role | Role check |
| SRV-R03 | Survey report must be approved before quotation | State machine |
| SRV-R04 | Survey photos: minimum 3 required | Validation |
| SRV-R05 | Findings must include at least 1 recommendation | Validation |

## Quotation Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| QTN-R01 | Every quotation must have ≥ 1 line item | Validation |
| QTN-R02 | Validity period: minimum 7 days, maximum 60 days | Validation |
| QTN-R03 | Margin: warning if < 25%, block if < 10% | Service logic |
| QTN-R04 | Internal approval required for value > EGP 500,000 | Approval workflow |
| QTN-R05 | Version increments on re-send after revision | Service logic |
| QTN-R06 | Tax auto-calculated at 14% (Egypt VAT) | Service logic |
| QTN-R07 | Expired quotations cannot be approved | State machine |

## Contract Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| CTR-R01 | Contract requires approved quotation | FK + status check |
| CTR-R02 | End date must be after start date | Validation |
| CTR-R03 | Active contract cannot be deleted | Soft delete restriction |
| CTR-R04 | Termination requires reason | Validation |
| CTR-R05 | Contract activation auto-creates project | Event handler |
