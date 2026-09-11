"""add outcome tracking to recommendations

Revision ID: v11004_rec_outcomes
Revises: v10g022_non_asset_reason
Create Date: 2026-09-11

V11-004: Recommendation outcome tracking columns.
"""
from alembic import op
import sqlalchemy as sa

revision = 'v11004_rec_outcomes'
down_revision = 'v10g022_non_asset_reason'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('recommendations',
        sa.Column('outcome', sa.String(50), nullable=True))
    op.add_column('recommendations',
        sa.Column('outcome_notes', sa.Text(), nullable=True))
    op.add_column('recommendations',
        sa.Column('roi_impact', sa.Numeric(12, 2), nullable=True))
    op.add_column('recommendations',
        sa.Column('actioned_at', sa.DateTime(), nullable=True))
    op.add_column('recommendations',
        sa.Column('outcome_verified_at', sa.DateTime(), nullable=True))
    op.add_column('recommendations',
        sa.Column('outcome_by', sa.String(100), nullable=True))

def downgrade() -> None:
    for col in ['outcome', 'outcome_notes', 'roi_impact',
                'actioned_at', 'outcome_verified_at', 'outcome_by']:
        op.drop_column('recommendations', col)
