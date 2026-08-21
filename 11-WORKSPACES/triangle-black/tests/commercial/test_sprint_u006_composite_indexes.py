"""
Tests for Sprint U-006: Database Index Optimization
"""
import pytest
from pathlib import Path
from src.core.database import engine
from sqlalchemy import text

def test_performance_indexes_exist():
    expected_indexes = [
        "ix_work_orders_hotel_priority",
        "ix_assets_hotel_status",
        "ix_assets_hotel_criticality",
        "ix_assets_hotel_category",
        "ix_service_requests_hotel_status",
        "ix_service_requests_hotel_urgency",
        "ix_service_requests_hotel_created",
        "ix_invoices_hotel_status",
        "ix_invoices_hotel_due_date",
        "ix_platform_events_hotel_status_created"
    ]
    
    with engine.connect() as conn:
        for idx in expected_indexes:
            row = conn.execute(text(f"""
                SELECT 1 FROM pg_indexes 
                WHERE schemaname = 'public' AND indexname = '{idx}'
            """)).fetchone()
            assert row is not None, f"Composite index {idx} is missing"
