# Phase 00 — Revenue Architecture

> How Triangle Black generates revenue across product tiers and customer segments.

## Revenue Engine

```
Lead Capture ──► Opportunity ──► Quotation ──► Contract ──► Project ──► Milestone ──► Invoice ──► Payment
     │                               │              │            │            │              │           │
     ▼                               ▼              ▼            ▼            ▼              ▼           ▼
  Revenue:                     Revenue:        Revenue:     Revenue:     Revenue:        Revenue:    Revenue:
  Subscription                 Subscription   Subscription  Subscription Trigger         Invoicing   Collection
  (user count)                 (base)         (base)        (base)       (transaction)   (flat)      (timing)
```

## Revenue Streams

### Stream 1: Platform Subscription (80% of V1 Revenue)

| Component | Pricing | Revenue Recognition | Dependencies |
|-----------|---------|-------------------|--------------|
| Base platform | Tiered (Starter/Professional/Enterprise) | Monthly in advance | Platform delivery |
| Per-seat add-on | EGP 500/user/mo above tier limit | Monthly in advance | User management |
| Mobile add-on | EGP 1,000/field user/mo | Monthly in advance | Mobile module |

### Stream 2: Transaction Fees (15% of V2 Revenue)

| Component | Rate | Trigger | Dependencies |
|-----------|------|---------|--------------|
| Invoice processing | 0.5% of invoice value | On invoice.paid event | ETA integration, payment gateway |
| Payment gateway | 2-3% (processor) + 0.5% (platform) | On successful payment | Payment gateway (V2) |

### Stream 3: AI Copilot (5% of V2 Revenue)

| Copilot | Pricing Model | Target |
|---------|---------------|--------|
| Lead Scoring | Subscription add-on (EGP 1,000/mo) | Sales teams |
| Margin Validation | Included in Professional+ | Management |
| NCR Classification | Per-report (EGP 50) | Project teams |

## Revenue by Phase

| Phase | Stream | Monthly (EGP) | Annual (EGP) |
|-------|--------|---------------|--------------|
| 1-5 Customers | Subscription | 15,000-37,500 | 180K-450K |
| 10 Customers | Subscription | 30,000-75,000 | 360K-900K |
| 25 Customers | Subscription + AI | 75,000-225,000 | 900K-2.7M |
| 50 Customers | All streams | 150K-500K+ | 1.8M-6M+ |

## Revenue Protection Mechanisms

| Mechanism | How It Works |
|-----------|--------------|
| Margin flooring | Quotation tool enforces minimum margin per line item |
| Approval workflows | Quotations above threshold require manager approval |
| 3-way match | PO, goods receipt, and invoice must match before payment |
| Revenue recognition | Revenue recognized only on milestone approval |
| ETA compliance | Automated tax calculation and submission prevents penalties |
