"""Add composite indexes on work_orders for hotel_id+status and hotel_id+created_at

Single-column indexes exist. Composite indexes improve:
- hotel_id + status filter queries (common list pattern)
- hotel_id + created_at DESC order queries (all list endpoints)
Both use partial index WHERE deleted_at IS NULL for soft-delete efficiency.

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-08-17
"""
from alembic import op
import sqlalchemy as sa

revision = 'e2f3a4b5c6d7'
down_revision = 'd1e2f3a4b5c6'
branch_labels = None
depends_on = None


def _idx_exists(conn, name):
    r = conn.execute(sa.text(
        "SELECT 1 FROM pg_indexes WHERE indexname = :n"
    ), {"n": name}).fetchone()
    return r is not None


def upgrade():
    conn = op.get_bind()

    # 1. Composite: hotel_id + status (active filter pattern)
    if not _idx_exists(conn, "ix_work_orders_hotel_status"):
        conn.execute(sa.text("""
            CREATE INDEX ix_work_orders_hotel_status
            ON work_orders (hotel_id, status)
            WHERE deleted_at IS NULL
        """))
        print("Created ix_work_orders_hotel_status")
    else:
        print("ix_work_orders_hotel_status already exists")

    # 2. Composite: hotel_id + created_at DESC (list order pattern)
    if not _idx_exists(conn, "ix_work_orders_hotel_created"):
        conn.execute(sa.text("""
            CREATE INDEX ix_work_orders_hotel_created
            ON work_orders (hotel_id, created_at DESC)
            WHERE deleted_at IS NULL
        """))
        print("Created ix_work_orders_hotel_created")
    else:
        print("ix_work_orders_hotel_created already exists")


def downgrade():
    conn = op.get_bind()
    for idx in ["ix_work_orders_hotel_status", "ix_work_orders_hotel_created"]:
        conn.execute(sa.text(f"DROP INDEX IF EXISTS {idx}"))
