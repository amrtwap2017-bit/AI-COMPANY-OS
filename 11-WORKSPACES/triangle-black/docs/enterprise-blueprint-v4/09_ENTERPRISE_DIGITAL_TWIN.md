# Enterprise Digital Twin v4

## Purpose

The enterprise digital twin is a governed relationship and evidence projection that explains operational state across commercial, project, asset, supply, finance and AI domains. It complements—not replaces—the transactional system of record.

## Graph model

```text
Organization -[SERVES]-> Customer -[HAS]-> Contract -[FUNDS]-> Project
Project -[OPERATES_AT]-> Site -[CONTAINS]-> Building/Area -[HOSTS]-> Asset
Asset -[HAS_PLAN]-> Maintenance Plan -[GENERATES]-> Work Order -[ASSIGNED_TO]-> Technician
Work Order -[CONSUMES]-> Inventory -[SOURCED_FROM]-> Supplier -[FULFILLED_BY]-> Purchase Order
Contract/Purchase Order -[BILLED_BY]-> Invoice -[SETTLED_BY]-> Payment
All nodes -[EMIT]-> Event -[MEASURED_BY]-> KPI -[EVIDENCED_BY]-> Document/Inspection
AI Recommendation -[USES]-> approved Evidence -[APPLIES_TO]-> governed Entity
```

## Storage and projection

- Source-of-truth transactional data remains in relational bounded-context stores.
- A graph projection subscribes to outbox events and stores node/edge identity, type, tenant, lifecycle, provenance, classification and valid time.
- Graph/vector indexes are tenant-partitioned and store references plus approved snippets/embeddings—not uncontrolled copies of all operational data.
- Graph updates are idempotent and replayable; graph failures cannot block source transactions.

## Enterprise graph queries

- Impact: “Which active contracts, sites, SLAs and invoices are affected by this critical asset?”
- Traceability: “Which PR, PO, receipt, technician work and warranty evidence support this maintenance cost?”
- Risk: “Which projects depend on suppliers with declining on-time delivery?”
- Governance: “Why did an AI recommendation prioritize this work order?”

## AI reasoning rules

Agents query a permission-filtered semantic/graph view, return cited evidence and confidence, and cannot infer relationships across tenant or classification boundaries. Any action proposal carries the graph paths and source versions used to create it. Human review is mandatory for financial, safety, contractual and cross-tenant-impacting actions.

