"""add_notifications_table

Revision ID: a1b2c3d4e5f6
Revises: 9540657cc92b
Create Date: 2026-07-08
"""
from __future__ import annotations
from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: str = "9540657cc92b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Table already created directly via SQLAlchemy — no-op
    pass


def downgrade() -> None:
    op.drop_index("ix_notifications_created_at",     table_name="notifications")
    op.drop_index("ix_notifications_is_read",        table_name="notifications")
    op.drop_index("ix_notifications_recipient_role", table_name="notifications")
    op.drop_table("notifications")
