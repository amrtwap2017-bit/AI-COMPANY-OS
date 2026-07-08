# 04-SUPPLIER-MANAGEMENT — Workflows

## W1: Supplier Registration & Approval

```
[SUPPLIER SUBMITS] Application form
    │
    ▼
Documents uploaded:
    ├── Trade license
    ├── VAT registration certificate
    ├── Bank account details
    ├── Insurance certificates
    └── Company profile
    │
    ▼
Procurement Officer reviews:
    ├── Verify documents
    ├── Check references
    └── Set initial tier (A, B, C)
    │
    ▼
Procurement Manager approves:
    ├── Approve → Status = 'active', can receive POs
    └── Reject → Status = 'rejected', reason logged
    │
    ▼
Setup:
    ├── Rate card (materials/services with prices)
    ├── Payment terms
    └── Category assignment
```

## W2: Supplier Evaluation

```
[QUARTERLY] Evaluation cycle starts
    │
    ├── Quality score: (Accepted qty / Total qty) × 40
    ├── Delivery score: (On-time deliveries / Total) × 30
    ├── Price score: (Competitive pricing) × 20
    └── Compliance score: (Document compliance) × 10
    │
    ▼
Total score:
    ├── 90-100 → Tier A (preferred)
    ├── 70-89  → Tier B (approved)
    ├── 50-69  → Tier C (conditional)
    └── < 50   → Under review / Disqualified
```
