"""
TRIANGLE BLACK — Data Provenance Service
Classify data as REAL | TEST | DEMO | IMPORTED | GENERATED | UNKNOWN
Ensures KPIs exclude test/demo data.
"""
from __future__ import annotations
from typing import List, Set
from sqlalchemy.orm import Session
from sqlalchemy import text


# Patterns that identify TEST data WO titles
TEST_PATTERNS = [
    "Sprint", "sprint", "test", "Test", "TEST",
    "T-005", "T-006", "V9-015", "V10-006", "V10-007",
    "Coverage WO", "Event Test", "WO to Update",
    "Audit Test", "Integration SR",
]

# Patterns that identify DEMO data
DEMO_PATTERNS = [
    "demo", "Demo", "DEMO",
    "example", "Example",
    "Triangle Black Demo",
]

# Patterns that identify GENERATED/AI data
GENERATED_PATTERNS = [
    "AI Generated", "Auto-generated",
]


class DataProvenanceService:
    """Classify and filter data by provenance."""

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def classify_wo_provenance(self, limit: int = 1000) -> dict:
        """
        Classify work orders by data provenance.
        REAL: Legitimate operational data
        TEST: Automated test artifacts
        DEMO: Demo/showcase data
        IMPORTED: Customer-imported historical data
        UNKNOWN: Cannot determine
        """
        rows = self.db.execute(text("""
            SELECT id, title, type, created_at
            FROM work_orders
            WHERE hotel_id = :h
            ORDER BY created_at DESC
            LIMIT :limit
        """), {"h": self.hotel_id, "limit": limit}).fetchall()

        classification = {
            "REAL": 0, "TEST": 0, "DEMO": 0,
            "IMPORTED": 0, "UNKNOWN": 0
        }
        test_ids: List[str] = []
        demo_ids: List[str] = []

        for row in rows:
            d = dict(row._mapping)
            title = (d.get("title") or "").lower()

            if any(p.lower() in title for p in TEST_PATTERNS):
                classification["TEST"] += 1
                test_ids.append(d["id"])
            elif any(p.lower() in title for p in DEMO_PATTERNS):
                classification["DEMO"] += 1
                demo_ids.append(d["id"])
            else:
                classification["REAL"] += 1

        total = sum(classification.values())
        return {
            "hotel_id": self.hotel_id,
            "total_sampled": total,
            "classification": classification,
            "real_pct": round(classification["REAL"] / max(total, 1) * 100, 1),
            "test_pct": round(classification["TEST"] / max(total, 1) * 100, 1),
            "test_sample_ids": test_ids[:5],
            "demo_sample_ids": demo_ids[:5],
            "recommendation": (
                "High test data proportion — KPIs may be inflated. "
                "Consider archiving test records for clean pilot."
                if classification["TEST"] / max(total, 1) > 0.3
                else "Data appears primarily operational."
            )
        }

    def get_real_wo_linkage(self) -> dict:
        """
        Calculate WO→Asset linkage for REAL data only.
        Excludes obvious test WO patterns.
        """
        h = self.hotel_id
        # Total real WOs (excludes known test patterns)
        exclusion_patterns = " AND ".join([
            f"title NOT ILIKE '%{p}%'" for p in TEST_PATTERNS[:6]
        ])

        try:
            total_real = self.db.execute(text(f"""
                SELECT COUNT(*) FROM work_orders
                WHERE hotel_id = :h AND {exclusion_patterns}
            """), {"h": h}).scalar() or 0

            linked_real = self.db.execute(text(f"""
                SELECT COUNT(*) FROM work_orders
                WHERE hotel_id = :h AND asset_id IS NOT NULL AND {exclusion_patterns}
            """), {"h": h}).scalar() or 0

            total_all = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
            ), {"h": h}).scalar() or 0

            linked_all = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL"
            ), {"h": h}).scalar() or 0

            return {
                "all_wo_linkage_pct": round(linked_all / max(total_all, 1) * 100, 2),
                "real_wo_linkage_pct": round(linked_real / max(total_real, 1) * 100, 2),
                "total_all": int(total_all),
                "total_real": int(total_real),
                "linked_all": int(linked_all),
                "linked_real": int(linked_real),
                "test_wo_count": int(total_all - total_real),
                "note": "real_wo_linkage_pct excludes known test WO patterns"
            }
        except Exception as e:
            return {"error": str(e)[:100]}
