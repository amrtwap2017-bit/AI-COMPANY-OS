"""add SLA tracking to work_orders

Revision ID: d4e5f6a7b8c9
Revises: c2d3e4f5a6b7
Create Date: 2026-08-17
"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e5f6a7b8c9'
down_revision = 'e2f3a4b5c6d7'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        ALTER TABLE work_orders
        ADD COLUMN IF NOT EXISTS sla_hours INTEGER DEFAULT 24,
        ADD COLUMN IF NOT EXISTS sla_breach_at TIMESTAMP WITHOUT TIME ZONE,
        ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS sla_status VARCHAR(20) DEFAULT 'on_track'
    """)
    op.execute("""
        UPDATE work_orders
        SET sla_breach_at = created_at + INTERVAL '24 hours',
            sla_status = CASE
                WHEN status IN ('completed','closed') THEN 'met'
                WHEN created_at + INTERVAL '24 hours' < NOW() THEN 'breached'
                ELSE 'on_track'
            END,
            sla_breached = CASE
                WHEN status IN ('completed','closed') THEN FALSE
                WHEN created_at + INTERVAL '24 hours' < NOW() THEN TRUE
                ELSE FALSE
            END
        WHERE sla_breach_at IS NULL
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_work_orders_sla_breached
        ON work_orders (sla_breached)
        WHERE sla_breached = TRUE
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_work_orders_sla_status
        ON work_orders (sla_status)
    """)

def downgrade():
    op.execute("ALTER TABLE work_orders DROP COLUMN IF EXISTS sla_hours")
    op.execute("ALTER TABLE work_orders DROP COLUMN IF EXISTS sla_breach_at")
    op.execute("ALTER TABLE work_orders DROP COLUMN IF EXISTS sla_breached")
    op.execute("ALTER TABLE work_orders DROP COLUMN IF EXISTS sla_status")
    op.execute("DROP INDEX IF EXISTS ix_work_orders_sla_breached")
    op.execute("DROP INDEX IF EXISTS ix_work_orders_sla_status")
