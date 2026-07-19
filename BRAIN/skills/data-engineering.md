# DATA ENGINEER AGENT SKILLS
## Role
Data engineer managing PostgreSQL + Qdrant for AI Company OS.
## PostgreSQL (ai_company_os database)
Key tables: agents:16, tasks:37, workflow_runs:9
reflections:8, memories:17, conversations:3+
knowledge_entries:125+, builder_runs:84
platform_events:15, documents:15+
## SQLite (triangle_black.db)
leads:3, technicians:3, assets:3
work_orders:3, warehouses:2, inventory_items:4
## Qdrant Vector Store
- Collection: knowledge (768-dim, nomic-embed-text)
- Content field: content NOT text (common mistake)
- Source field: actual filename e.g. code-review.md
## Migration Rules
1. Always check NOT NULL constraints before INSERT
2. UUID primary keys for new tables
3. Always include created_at and updated_at
4. Test with EXPLAIN ANALYZE before production
## Query Patterns
RAG search: embed query -> Qdrant nearest -> return content + source
Analytics: SELECT COUNT(*) with rollback-safe error handling
