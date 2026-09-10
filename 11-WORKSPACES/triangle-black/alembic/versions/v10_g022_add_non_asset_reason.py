"""add non_asset_reason to work_orders

Revision ID: v10g022_non_asset_reason
Revises: d82549b3d3c4
Create Date: 2026-09-10

V10: work_orders.non_asset_reason — explains why no asset is linked.
Supports: FACILITY_WIDE, GENERAL, ADMINISTRATIVE, LOCATION_ONLY, NOT_APPLICABLE
"""
from alembic import op
import sqlalchemy as sa

revision = 'v10g022_non_asset_reason'
down_revision = 'd82549b3d3c4'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('work_orders',
        sa.Column('non_asset_reason', sa.String(50), nullable=True)
    )

def downgrade() -> None:
    op.drop_column('work_orders', 'non_asset_reason')
