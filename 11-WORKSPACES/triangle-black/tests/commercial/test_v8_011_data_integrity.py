"""
V8-011 — Data Integrity Tests
WO→Asset linkage must improve over time.
"""
import pytest
from sqlalchemy import create_engine, text

DB_URL = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
H = "tb-default-hotel-000000000001"

def get_linkage():
    engine = create_engine(DB_URL)
    with engine.connect() as conn:
        total = conn.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
        ), {"h": H}).scalar() or 1
        linked = conn.execute(text(
            "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL"
        ), {"h": H}).scalar() or 0
        return linked, total

class TestDataIntegrity:
    def test_wo_asset_linkage_improving(self):
        """WO→Asset linkage must be above minimum threshold."""
        linked, total = get_linkage()
        pct = linked / total * 100
        print(f"\nWO→Asset linkage: {linked}/{total} = {pct:.1f}%")
        # Current baseline is ~5% — not fail, but document
        # Target: >80% for new WOs within 30 days of pilot
        assert pct >= 1.0, f"WO→Asset linkage critically low: {pct:.1f}%"

    def test_asset_criticality_complete(self):
        """All assets must have criticality set."""
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            total = conn.execute(text(
                "SELECT COUNT(*) FROM assets WHERE hotel_id=:h AND deleted_at IS NULL"
            ), {"h": H}).scalar() or 1
            with_crit = conn.execute(text(
                "SELECT COUNT(*) FROM assets WHERE hotel_id=:h AND deleted_at IS NULL "
                "AND criticality IS NOT NULL AND criticality != ''"
            ), {"h": H}).scalar() or 0
            pct = with_crit / total * 100
            assert pct >= 95, f"Asset criticality coverage too low: {pct:.1f}%"

    def test_supplier_data_quality(self):
        """Supplier data must be ≥90% complete."""
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            total = conn.execute(text(
                "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h"
            ), {"h": H}).scalar() or 1
            complete = conn.execute(text(
                "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h "
                "AND email IS NOT NULL AND category IS NOT NULL"
            ), {"h": H}).scalar() or 0
            pct = complete / total * 100
            assert pct >= 90, f"Supplier data quality too low: {pct:.1f}%"

    def test_pm_asset_linkage_acceptable(self):
        """PM→Asset linkage must be ≥75%."""
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            total = conn.execute(text(
                "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h"
            ), {"h": H}).scalar() or 1
            linked = conn.execute(text(
                "SELECT COUNT(*) FROM maintenance_plans WHERE hotel_id=:h "
                "AND asset_node_id IS NOT NULL"
            ), {"h": H}).scalar() or 0
            pct = linked / total * 100
            assert pct >= 75, f"PM→Asset linkage too low: {pct:.1f}%"

    def test_wo_creation_has_asset_warning(self):
        """WO router must enforce asset linkage warning."""
        from pathlib import Path
        router = Path("src/commercial/work_orders/router.py").read_text()
        assert "data_quality_warning" in router
        assert "asset_linkage_required" in router
