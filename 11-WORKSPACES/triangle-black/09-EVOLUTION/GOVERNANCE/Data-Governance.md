# 12 — Data Governance Overview

> Enterprise data governance — reference to detailed framework.

## Reference Chain

| Source | Input |
|--------|-------|
| 04-DATA-INTELLIGENCE/Data-Governance.md | Detailed data governance |
| 04-DATA-INTELLIGENCE/Data-Quality.md | Data quality framework |
| 04-DATA-INTELLIGENCE/Data-Security.md | Data security framework |

## Governance Scope

This document references the detailed data governance framework documented in Phase 10, Section 04.

### Core Documents

| Document | Location | Content |
|----------|----------|---------|
| Data Governance | 04-DATA-INTELLIGENCE/Data-Governance.md | Ownership, classification, processes |
| Data Quality | 04-DATA-INTELLIGENCE/Data-Quality.md | Quality dimensions, monitoring |
| Data Security | 04-DATA-INTELLIGENCE/Data-Security.md | Encryption, access control |
| Data Catalog | 04-DATA-INTELLIGENCE/Data-Catalog.md | Dataset registry, schema |
| Data Pipelines | 04-DATA-INTELLIGENCE/Data-Pipelines.md | Ingestion, transformation |

## Key Governance Decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Data owner | COO for customer data, CTO for platform data | Business proximity |
| Classification levels | Public, Internal, Confidential, Restricted | Risk-based |
| Retention periods | 7 years financial, 2 years operational | Legal + practical |
| Encryption standard | AES-256 at rest, TLS 1.3 in transit | Industry standard |

## Cross-Reference

For detailed policies, procedures, and technical controls, refer to the documents listed above in 04-DATA-INTELLIGENCE.
