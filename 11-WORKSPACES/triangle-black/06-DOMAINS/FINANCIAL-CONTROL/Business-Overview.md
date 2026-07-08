# 06-FINANCIAL-CONTROL — Business Overview

## Context

Financial Control connects all revenue and cost activities: invoicing clients (from contracts/milestones), paying suppliers (from POs/goods receipt), tracking project profitability, and recognizing revenue. The general ledger provides the complete financial picture.

## Key Revenue Recognition Flow

```
Contract Signed → Milestone Reached → Milestone Approved → Invoice Client → Payment Received → Revenue Recognized
     ↓                 ↓                    ↓                  ↓                ↓                   ↓
  Deferred         Performance        Approval cert        AR created      Cash received     P&L recognized
  Revenue          Obligation         triggers invoice     Aging starts    AR cleared        Invoice matched
```

## Key Payables Flow

```
PO Created → Goods Received → Supplier Invoice → 3-Way Match → Approve → Schedule Payment
     ↓            ↓                  ↓                ↓            ↓           ↓
  Commit      Accrued PO        Invoice from       PO × GR ×    Verify       Pay by due
  (budget)    (liability)       supplier           Invoice      approved     date
```
