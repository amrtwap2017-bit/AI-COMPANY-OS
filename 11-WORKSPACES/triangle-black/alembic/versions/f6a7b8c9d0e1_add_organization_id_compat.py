"""add organization_id compatibility column

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-08-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None

def upgrade():
    for table in ['work_orders', 'service_requests', 'assets', 'invoices', 'contracts']:
        op.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS organization_id VARCHAR(36)")
        op.execute(f"UPDATE {table} SET organization_id = hotel_id WHERE organization_id IS NULL")
        op.execute(f"CREATE INDEX IF NOT EXISTS ix_{table}_organization_id ON {table} (organization_id)")

def downgrade():
    for table in ['work_orders', 'service_requests', 'assets', 'invoices', 'contracts']:
        op.execute(f"DROP INDEX IF EXISTS ix_{table}_organization_id")
        op.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS organization_id")
