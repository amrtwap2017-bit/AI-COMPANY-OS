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

    # Drop FK constraint if it exists
    conn.execute(sa.text("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'workflow_instances_template_id_fkey'
                AND conrelid = 'workflow_instances'::regclass
            ) THEN
                ALTER TABLE workflow_instances
                DROP CONSTRAINT workflow_instances_template_id_fkey;
                RAISE NOTICE 'Dropped workflow_instances_template_id_fkey';
            ELSE
                RAISE NOTICE 'Constraint not found — already clean';
            END IF;
        END $$;
    """))

    # Also add hotel_id index on workflow_instances if missing
    conn.execute(sa.text("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE tablename = 'workflow_instances'
                AND indexname = 'ix_workflow_instances_hotel_entity'
            ) THEN
                CREATE INDEX ix_workflow_instances_hotel_entity
                ON workflow_instances (hotel_id, entity_type, entity_id);
                RAISE NOTICE 'Created hotel_entity index';
            END IF;
        END $$;
    """))

    # Add hotel_id index on workflow_transitions if missing
    conn.execute(sa.text("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE tablename = 'workflow_transitions'
                AND indexname = 'ix_workflow_transitions_hotel_instance'
            ) THEN
                CREATE INDEX ix_workflow_transitions_hotel_instance
                ON workflow_transitions (hotel_id, instance_id);
                RAISE NOTICE 'Created transitions hotel_instance index';
            END IF;
        END $$;
    """))


def downgrade():
    # No-op — re-adding the FK would require seeding workflow_templates
    # which is intentionally not done
    pass
