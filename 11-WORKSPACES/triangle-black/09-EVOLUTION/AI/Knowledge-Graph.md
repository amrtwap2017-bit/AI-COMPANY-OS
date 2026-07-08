# 03 — Knowledge Graph

> Knowledge graph for structured domain understanding.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 1 — Hospitality-Knowledge.md | Domain knowledge |
| Phase 1 — Ubiquitous-Language.md | Domain language |
| Phase 10 — RAG.md | RAG pipeline |

## Knowledge Graph Purpose

- Structured representation of hospitality domain
- Entity relationships for AI understanding
- Contextual query enrichment
- Cross-domain reasoning

## Entity Types

| Entity | Examples | Relationships |
|--------|----------|--------------|
| Hotel | Name, brand, location, tier | has_room, uses_pms |
| Room | Type, rate, amenities | belongs_to_hotel, booked_by |
| Guest | Name, status, preferences | stays_at, has_booking |
| Booking | Dates, status, source | references_room, belongs_to_guest |
| Supplier | Name, category, contract | supplies_to_hotel, has_contract |
| Employee | Role, department, skills | works_at, assigned_to |
| Service | Maintenance, housekeeping | scheduled_for, performed_by |

## Graph Structure

```
(Hotel)──has──►(Room)
   │              │
   │              │
   ▼              ▼
(Booking)◄──(Guest)
   │
   ▼
(Invoice)──has──►(LineItem)
```

## Knowledge Graph Strategy

| Phase | Scope | Technology |
|-------|-------|-----------|
| H1 | Core entities (hotel, room, guest, booking) | PostgreSQL + adjacency |
| H2 | Expanded entities (supplier, employee, service) | Dedicated graph DB (Neo4j) |
| H3 | Cross-domain reasoning | Graph RAG pipeline |
| H4 | Comprehensive domain graph | Full hospitality knowledge |

## Graph RAG Integration

```
Query ──► Knowledge Graph Query ──► Entity Context ──► RAG Prompt ──► LLM Response
               │                         │
           Extract entities           Entity relations
           relevant to query          + attributes
```

## Graph Metrics

| Metric | H1 Target | H2 Target |
|--------|-----------|-----------|
| Entity count | 50,000 | 500,000 |
| Relationship count | 200,000 | 2,000,000 |
| Query latency | < 100ms | < 50ms |
| Graph accuracy | 95% | 99% |
