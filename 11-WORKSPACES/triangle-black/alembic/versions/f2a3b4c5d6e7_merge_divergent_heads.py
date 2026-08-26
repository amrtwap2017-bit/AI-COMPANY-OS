"""Merge divergent Alembic heads — A-015 fix

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6, g2h3i4j5k6l7
Create Date: 2026-08-26
"""
from alembic import op
import sqlalchemy as sa

revision = 'f2a3b4c5d6e7'
down_revision = ('e1f2a3b4c5d6', 'g2h3i4j5k6l7')
branch_labels = None
depends_on = None


def upgrade():
    # Merge migration — no schema changes needed
    # Both branches are already applied
    pass


def downgrade():
    # No-op — safe downgrade
    pass
