"""add platform_events outbox table for T-006

Revision ID: d4e5f6a7b8c9
Revises: c2d3e4f5a6b7
Create Date: 2026-08-17
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = 'e1f2a3b4c5d6'
down_revision = ('a7b8c9d0e1f2', 'd4e5f6a7b8c9')
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'platform_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('hotel_id', sa.String(36), nullable=False, index=True),
        sa.Column('event_type', sa.String(100), nullable=False, index=True),
        sa.Column('payload', JSONB, nullable=False),
        sa.Column('correlation_id', sa.String(36), nullable=True, index=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('NOW()'), nullable=False),
        sa.Column('processed_at', sa.DateTime, nullable=True, index=True),
        sa.Column('processed_by', sa.String(100), nullable=True),
        sa.Column('retry_count', sa.Integer, server_default='0', nullable=False),
        sa.Column('last_error', sa.Text, nullable=True),
    )
    op.create_index('ix_platform_events_unprocessed', 'platform_events',
                    ['processed_at', 'created_at'],
                    postgresql_where=sa.text("processed_at IS NULL"))
    op.create_index('ix_platform_events_hotel_event', 'platform_events',
                    ['hotel_id', 'event_type'])

def downgrade():
    op.drop_table('platform_events')
