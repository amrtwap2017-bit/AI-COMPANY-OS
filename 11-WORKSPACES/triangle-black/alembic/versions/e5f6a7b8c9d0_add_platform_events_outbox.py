"""add platform_events outbox table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-08-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS platform_events (
            id              VARCHAR(36) PRIMARY KEY,
            hotel_id        VARCHAR(36) NOT NULL,
            event_type      VARCHAR(100) NOT NULL,
            aggregate_type  VARCHAR(100) NOT NULL,
            aggregate_id    VARCHAR(36) NOT NULL,
            payload         TEXT,
            actor           VARCHAR(255),
            status          VARCHAR(20) DEFAULT 'pending',
            dispatched_at   TIMESTAMP WITHOUT TIME ZONE,
            created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            correlation_id  VARCHAR(36)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_platform_events_hotel_id ON platform_events (hotel_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_platform_events_status ON platform_events (status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_platform_events_event_type ON platform_events (event_type)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_platform_events_aggregate ON platform_events (aggregate_type, aggregate_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_platform_events_created_at ON platform_events (created_at)")

def downgrade():
    op.execute("DROP TABLE IF EXISTS platform_events")
