from __future__ import annotations
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/tenant-audit", tags=["tenant-audit"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

HOTEL_SCOPED_TABLES = [
    "work_orders", "assets", "technicians", "maintenance_plans",
    "service_requests", "inventory_items", "warehouses",
    "purchase_orders", "invoices", "projects",
]

@router.get("/isolation-check", summary="Multi-hotel data isolation audit")
def isolation_check(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Audits which tables have hotel_id scoping.
    Identifies any records without hotel_id (isolation risk).
    """
    results = []
    for table in HOTEL_SCOPED_TABLES:
        try:
            # Check if hotel_id column exists
            col_check = db.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = :tbl AND column_name = 'hotel_id'
            """), {"tbl": table}).fetchone()

            has_hotel_id = col_check is not None

            if has_hotel_id:
                # Count records missing hotel_id
                row = db.execute(text(f"""
                    SELECT count(*) as total,
                           sum(CASE WHEN hotel_id IS NULL OR hotel_id = '' THEN 1 ELSE 0 END) as missing
                    FROM {table}
                """)).fetchone()
                d = row_to_dict(row)
                total   = int(d.get("total") or 0)
                missing = int(d.get("missing") or 0)
                isolated = missing == 0

                # Count distinct hotels
                hotels_row = db.execute(text(
                    f"SELECT count(DISTINCT hotel_id) as hotels FROM {table} WHERE hotel_id IS NOT NULL"
                )).fetchone()
                hotel_count = int(row_to_dict(hotels_row).get("hotels") or 0)
            else:
                total = missing = hotel_count = 0
                isolated = False

            results.append({
                "table":          table,
                "has_hotel_id":   has_hotel_id,
                "total_records":  total,
                "missing_hotel":  missing,
                "hotel_count":    hotel_count,
                "isolation_ok":   isolated and has_hotel_id,
                "risk":           "none" if (isolated and has_hotel_id) else
                                  "no_hotel_id_column" if not has_hotel_id else
                                  f"{missing}_records_without_hotel",
            })
        except Exception as e:
            results.append({
                "table": table,
                "error": str(e),
                "isolation_ok": False,
                "risk": "query_failed",
            })

    isolated_count = sum(1 for r in results if r.get("isolation_ok"))
    risk_count     = sum(1 for r in results if not r.get("isolation_ok"))

    return {
        "audit_date":      datetime.datetime.utcnow().isoformat(),
        "tables_audited":  len(results),
        "fully_isolated":  isolated_count,
        "needs_attention": risk_count,
        "isolation_score": round(isolated_count / len(results) * 100, 1) if results else 0,
        "results":         results,
    }

@router.get("/hotel-breakdown", summary="Data volume per hotel")
def hotel_breakdown(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """Shows data distribution across hotels."""
    breakdown = {}
    for table in ["work_orders", "assets", "technicians", "invoices", "projects"]:
        try:
            rows = db.execute(text(f"""
                SELECT h.name as hotel_name, count(*) as count
                FROM {table} t
                LEFT JOIN hotels h ON h.id = t.hotel_id
                GROUP BY h.name
                ORDER BY count(*) DESC
                LIMIT 10
            """)).fetchall()
            breakdown[table] = [row_to_dict(r) for r in rows]
        except Exception:
            breakdown[table] = []

    return {
        "breakdown":    breakdown,
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }
