"""add_invoices_table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-08
"""
from __future__ import annotations
from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: str = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Table created directly via SQLAlchemy engine — no-op
    pass


def downgrade() -> None:
    op.drop_index("ix_invoices_lead_id",    table_name="invoices")
    op.drop_index("ix_invoices_status",     table_name="invoices")
    op.drop_index("ix_invoices_contract_id", table_name="invoices")
    op.drop_table("invoices")
