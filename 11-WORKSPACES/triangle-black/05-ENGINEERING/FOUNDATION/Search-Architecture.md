# Search Architecture

> Full-text search across all business domains.

## V1: PostgreSQL Full-Text Search

For the $6-40/mo VPS budget, PostgreSQL's built-in Full-Text Search (FTS) provides adequate search performance without an additional service.

### Architecture

```
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Client      │    │    API Gateway    │    │  PostgreSQL  │
│   (Next.js)   │───►│   (NestJS)       │───►│  + tsvector  │
│               │◄───│                  │◄───│              │
└──────────────┘    └──────────────────┘    └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  Search      │
                   │  Service     │
                   │              │
                   │  Build query │
                   │  Sanitize    │
                   │  Rank results│
                   └──────────────┘
```

### Implementation

Each searchable entity gets a materialized `search_vector` column using PostgreSQL `tsvector`:

```sql
-- Example: leads search vector
ALTER TABLE leads ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(company_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(phone, '')
    )
  ) STORED;

CREATE INDEX idx_leads_search ON leads USING GIN(search_vector);
```

### Search API

```
GET /api/v1/search?q={query}&type={entity_type}&page={n}&limit={n}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query (required) |
| type | string | Entity type filter: leads,opportunities,projects,quotations,inventory,documents,employees (optional) |
| page | integer | Page number (default: 1) |
| limit | integer | Results per page (default: 20, max: 100) |
| tenant_id | UUID | Implicit from auth context |

### Searchable Entities (V1)

| Entity | Fields Indexed | Domain |
|--------|---------------|--------|
| leads | first_name, last_name, company_name, email, phone, notes | 01-COMMERCIAL |
| opportunities | name, description | 01-COMMERCIAL |
| companies | name, email, phone, region | 01-COMMERCIAL |
| projects | name, number, description | 02-PROJECT-DELIVERY |
| quotations | number, description | 01-COMMERCIAL |
| contracts | title, number | 01-COMMERCIAL |
| inventory_items | name, sku, description | 05-INVENTORY |
| documents | filename, title, description | 08-DOCUMENT-MGMT |
| employees | first_name, last_name, email, employee_code | 13-HUMAN-RESOURCES |

### Unified Search Response

```json
{
  "query": "hotel ac installation",
  "results": [
    {
      "type": "leads",
      "id": "uuid",
      "title": "ABC Hotel - AC Maintenance",
      "snippet": "...hotel <mark>AC</mark> <mark>installation</mark>...",
      "score": 0.85,
      "url": "/crm/leads/uuid"
    }
  ],
  "total": 42,
  "page": 1,
  "per_page": 20,
  "facets": {
    "types": {
      "leads": 15,
      "projects": 10,
      "quotations": 8,
      "documents": 5,
      "inventory": 4
    }
  }
}
```

### Search Refresh Strategy

| Strategy | Trigger | Method |
|----------|---------|--------|
| Real-time | On entity create/update | Trigger `REFRESH MATERIALIZED VIEW` or direct `tsvector` update |
| Periodic | Cron (nightly) | Full reindex of all searchable entities |
| On-demand | Admin trigger | Manual reindex from admin panel |

### V2: Migration to Meilisearch

When the dataset exceeds 100K+ records or query latency exceeds 500ms, migrate to Meilisearch:

| Capability | PostgreSQL FTS | Meilisearch |
|------------|---------------|-------------|
| Typo tolerance | ❌ No | ✅ Built-in |
| Faceted search | ✅ Manual | ✅ Automatic |
| Ranking | ✅ ts_rank | ✅ Customizable |
| Synonyms | ❌ Manual | ✅ Built-in |
| Filtering | ✅ WHERE clauses | ✅ Built-in |
| Instant search | ❌ Query per keystroke | ✅ Dedicated endpoint |
| Deployment | Built-in | Docker container (~256MB RAM) |

Migration path:
1. Deploy Meilisearch in Docker alongside PostgreSQL
2. Create sync job to index entities (trigger on entity mutation events)
3. Update SearchService to query both (feature flag)
4. Cut over: switch client-facing API to Meilisearch
5. Retain PostgreSQL FTS as fallback

### Tenant Isolation

Search queries automatically filter by `tenant_id` via RLS or query parameter derived from auth context.
