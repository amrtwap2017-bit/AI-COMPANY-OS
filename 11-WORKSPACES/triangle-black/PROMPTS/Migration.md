# Migration Prompt

Model: qwen2.5-coder:7b

Use for: writing Alembic migrations

Template:
---
Write an Alembic migration for Triangle Black.

RULES:
1. upgrade() AND downgrade() both required
2. Zero downtime (no ALTER TABLE locks)
3. New tables need: id, tenant_id (NOT NULL, INDEX), created_at, updated_at
4. Test with: upgrade, downgrade, upgrade again

Model code: [paste models.py]

Change needed: [describe what to change]

Write complete migration file.
---
