"""add twin graph tables

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-08-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'a7b8c9d0e1f2'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS twin_nodes (
            id          VARCHAR(36) PRIMARY KEY,
            hotel_id    VARCHAR(36) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id   VARCHAR(36) NOT NULL,
            label       VARCHAR(255),
            properties  TEXT,
            created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_twin_nodes_hotel ON twin_nodes (hotel_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_twin_nodes_entity ON twin_nodes (entity_type, entity_id)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS twin_edges (
            id              VARCHAR(36) PRIMARY KEY,
            hotel_id        VARCHAR(36) NOT NULL,
            source_type     VARCHAR(50) NOT NULL,
            source_id       VARCHAR(36) NOT NULL,
            target_type     VARCHAR(50) NOT NULL,
            target_id       VARCHAR(36) NOT NULL,
            relationship    VARCHAR(100) NOT NULL,
            created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_twin_edges_hotel ON twin_edges (hotel_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_twin_edges_source ON twin_edges (source_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_twin_edges_target ON twin_edges (target_id)")

def downgrade():
    op.execute("DROP TABLE IF EXISTS twin_edges")
    op.execute("DROP TABLE IF EXISTS twin_nodes")
