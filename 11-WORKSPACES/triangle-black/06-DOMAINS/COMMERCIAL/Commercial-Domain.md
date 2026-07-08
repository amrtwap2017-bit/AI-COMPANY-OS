# Phase 06 — Commercial Domain

> Lead-to-Contract revenue engine — CRM capabilities.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Lead Management | Capture, qualify, score, track | P0 |
| Account Management | Company profiles, history | P0 |
| Contact Management | Decision-maker directory | P0 |
| Opportunity Management | Pipeline, stage tracking | P0 |
| Site Survey | Field inspection, report | P0 |
| Quotation | Multi-line pricing, margin control | P0 |
| Contract | Terms, approval, signing | P0 |

## Key Workflows

```
Lead → Qualification → Opportunity → Site Survey → Quotation → Approval → Contract
```

## Entities

```
Lead ──► 1:1 ──► Opportunity ──► N:1 ──► Site Survey ──► 1:N ──► Quotation ──► 1:1 ──► Contract
 │                    │
 │                    ▼
 │              Account ──► 1:N ──► Contact
 ▼
Lead Score (AI Agent)
```

## Location

`01-COMMERCIAL/` — 20 files completing the standard template. This is the first revenue-generating domain and highest priority for implementation.

## Key Files

| File | Purpose |
|------|---------|
| Business-Overview.md | Commercial domain purpose and scope |
| Capabilities.md | 7 capabilities with sub-capabilities |
| Workflows.md | Lead-to-contract end-to-end workflow |
| Business-Rules.md | 8 commercial business rules |
| Roles.md | Sales Rep, Sales Manager, Commercial Director |
| Permissions.md | All commercial CRUD permissions |
| Screens.md | Lead list, pipeline board, quotation builder, etc. |
| Components.md | LeadCard, PipelineColumn, QuotationLine, etc. |
| Database.md | lead, lead_score, opportunity, site_survey, quotation, quotation_line, contract |
| APIs.md | 12+ commercial API endpoints |
| Events.md | lead.created, opportunity.won, contract.signed |

## Related Documents

- `01-COMMERCIAL/` — Complete 20-file specification set
