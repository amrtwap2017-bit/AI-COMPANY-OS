"""Drop workflow_instances template_id FK constraint

The builtin workflow templates are defined in code (TriangleWorkflowEngine),
not in a database table. The FK constraint blocks all instance creation.
template_id becomes a plain string identifier referencing the engine maps.

Revision ID: d1e2f3a4b5c6
Revises: c2d3e4f5a6b7
Create Date: 2026-08-17
"""
from alembic import op
import sqlalchemy as sa

revision = 'd1e2f3a4b5c6'
down_revision = 'c2d3e4f5a6b7'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # 1. Drop FK constraint — check first to be idempotent
    fk = conn.execute(sa.text("""
        SELECT 1 FROM pg_constraint
        WHERE conname = 'workflow_instances_template_id_fkey'
        AND conrelid = 'workflow_instances'::regclass
    """)).fetchone()

    if fk:
        conn.execute(sa.text(
            "ALTER TABLE workflow_instances "
            "DROP CONSTRAINT workflow_instances_template_id_fkey"
        ))
        print("Dropped workflow_instances_template_id_fkey")
    else:
        print("FK not found — already clean")

    # 2. Add composite index on workflow_instances (hotel_id exists — confirmed)
    idx = conn.execute(sa.text("""
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'ix_workflow_instances_hotel_entity'
    """)).fetchone()

    if not idx:
        conn.execute(sa.text(
            "CREATE INDEX ix_workflow_instances_hotel_entity "
            "ON workflow_instances (hotel_id, entity_type, entity_id)"
        ))
        print("Created ix_workflow_instances_hotel_entity")
    else:
        print("Index ix_workflow_instances_hotel_entity already exists")


def downgrade():
    # No-op — re-adding FK would require seeding workflow_templates
    pass
