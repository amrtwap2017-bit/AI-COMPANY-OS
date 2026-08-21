"""composite performance indexes

Revision ID: b2c3d4e5f6a7
Revises: e1f2a3b4c5d6
Create Date: 2026-08-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a7b8c9d0e1f2'
branch_labels = None
depends_on = None

def upgrade():
    # 1. work_orders composite indexes
    op.execute("CREATE INDEX IF NOT EXISTS ix_work_orders_hotel_priority ON work_orders (hotel_id, priority)")
    
    # 2. assets composite indexes
    op.execute("CREATE INDEX IF NOT EXISTS ix_assets_hotel_status ON assets (hotel_id, status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_assets_hotel_criticality ON assets (hotel_id, criticality)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_assets_hotel_category ON assets (hotel_id, category)")
    
    # 3. service_requests composite indexes
    op.execute("CREATE INDEX IF NOT EXISTS ix_service_requests_hotel_status ON service_requests (hotel_id, status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_service_requests_hotel_urgency ON service_requests (hotel_id, urgency)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_service_requests_hotel_created ON service_requests (hotel_id, created_at)")
    
    # 4. invoices composite indexes
    op.execute("CREATE INDEX IF NOT EXISTS ix_invoices_hotel_status ON invoices (hotel_id, status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_invoices_hotel_due_date ON invoices (hotel_id, due_date)")
    
    # 5. platform_events composite index
    op.execute("CREATE INDEX IF NOT EXISTS ix_platform_events_hotel_status_created ON platform_events (hotel_id, status, created_at)")

def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_work_orders_hotel_priority")
    op.execute("DROP INDEX IF EXISTS ix_assets_hotel_status")
    op.execute("DROP INDEX IF EXISTS ix_assets_hotel_criticality")
    op.execute("DROP INDEX IF EXISTS ix_assets_hotel_category")
    op.execute("DROP INDEX IF EXISTS ix_service_requests_hotel_status")
    op.execute("DROP INDEX IF EXISTS ix_service_requests_hotel_urgency")
    op.execute("DROP INDEX IF EXISTS ix_service_requests_hotel_created")
    op.execute("DROP INDEX IF EXISTS ix_invoices_hotel_status")
    op.execute("DROP INDEX IF EXISTS ix_invoices_hotel_due_date")
    op.execute("DROP INDEX IF EXISTS ix_platform_events_hotel_status_created")
