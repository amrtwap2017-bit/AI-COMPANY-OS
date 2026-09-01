"""Add hotel_id to workflow_events (safe minimal migration)

Revision ID: 39458fc24447
Revises: 
Create Date: 2026-09-01

"""
from alembic import op
import sqlalchemy as sa

revision = "39458fc24447"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name=\'workflow_events\' AND column_name=\'hotel_id\'"
    ))
    if not result.fetchone():
        op.add_column(
            "workflow_events",
            sa.Column("hotel_id", sa.String(100), nullable=True)
        )
        op.create_index(
            "ix_workflow_events_hotel_id",
            "workflow_events", ["hotel_id"]
        )


def downgrade() -> None:
    try:
        op.drop_index("ix_workflow_events_hotel_id", table_name="workflow_events")
    except Exception:
        pass
    try:
        op.drop_column("workflow_events", "hotel_id")
    except Exception:
        pass
