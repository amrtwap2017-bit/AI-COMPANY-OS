# Phase 06 — Supplier Domain

> Supplier lifecycle management, rate cards, and evaluation.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Supplier Lifecycle | Onboard, classify, evaluate, offboard | P1 |
| Rate Card | Item pricing, validity, negotiation | P1 |
| Performance Evaluation | Quality, delivery, rating | P2 |

## Entity Relationship

```
Supplier ──► 1:N ──► RateCard ──► 1:N ──► RateCardItem
    │ 1:N ──► SupplierEvaluation
    │ 1:N ──► PurchaseOrder (in Procurement)
```

## Location

`04-SUPPLIER-MANAGEMENT/` — 20 files following the standard template.
