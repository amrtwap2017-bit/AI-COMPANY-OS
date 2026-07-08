# Phase 01 — Business Architecture

> Enterprise business architecture for Triangle Black — hospitality engineering operating system.

## Business Context

Triangle Black serves hospitality engineering companies in Egypt managing the complete client lifecycle: lead generation → project delivery → financial control → ongoing maintenance. The platform unifies all operations into a single system, replacing fragmented spreadsheets, email, and disconnected tools.

## Business Domain Model

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            TRIANGLE BLACK PLATFORM                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Revenue Cycle                    Delivery Cycle                  Support Cycle      │
│  ┌──────────────┐                ┌──────────────┐               ┌──────────────┐    │
│  │ Lead → Opp   │                │ Project      │               │ Maintenance  │    │
│  │ → Survey     │                │ → Milestones │               │ → Service    │    │
│  │ → Quotation  │                │ → NCRs       │               │ → Warranty   │    │
│  │ → Contract   │                │ → Handover   │               │ → SLA        │    │
│  └──────┬───────┘                └──────┬───────┘               └──────┬───────┘    │
│         │                               │                              │            │
│         ▼                               ▼                              ▼            │
│  ┌──────────────┐                ┌──────────────┐               ┌──────────────┐    │
│  │ Procurement  │                │ Inventory    │               │ Financial    │    │
│  │ → Requisition│                │ → Stock      │               │ → AR/AP      │    │
│  │ → PO         │                │ → Transfers  │               │ → Revenue    │    │
│  │ → GR         │                │ → Adjustments│               │ → GL         │    │
│  └──────────────┘                └──────────────┘               └──────────────┘    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  Cross-Cutting: Executive Intelligence │ AI Copilots │ Document Management │ Mobile │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Business Goals

| Goal | Metric | Target |
|------|--------|--------|
| Increase win rate | Lead-to-contract conversion | 30%+ |
| Reduce quotation time | Hours per quotation | <2 hours |
| Improve project delivery | On-time milestone completion | 90%+ |
| Control margins | Average project margin | 25%+ |
| Accelerate cash flow | Days sales outstanding (DSO) | <45 days |
| Ensure compliance | ETA submission accuracy | 100% |

## Key Business Processes

See `06-Operations/` for detailed operational workflows and `07-Product/` for product specifications.

## Related Documents

- [Capability Map](Capability-Map.md) — Full business capability breakdown
- [Domain-Driven Design](Domain-Driven-Design.md) — Bounded context map
- [Business Rules](Business-Rules.md) — Core business rule catalog
- [Operational Workflows](Operational-Workflows.md) — End-to-end process flows
- [Hospitality Knowledge](Hospitality-Knowledge.md) — Domain expertise
- [Ubiquitous Language](Ubiquitous-Language.md) — Shared terminology
