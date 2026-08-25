from __future__ import annotations
import time, datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/performance", tags=["performance-audit"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _timed_query(db, sql, params=None, label=""):
    """Run a query and return result + duration in ms."""
    start = time.time()
    try:
        rows = db.execute(text(sql), params or {}).fetchall()
        duration_ms = round((time.time() - start) * 1000, 2)
        return {"label": label, "rows": len(rows), "duration_ms": duration_ms, "status": "ok"}
    except Exception as e:
        duration_ms = round((time.time() - start) * 1000, 2)
        return {"label": label, "rows": 0, "duration_ms": duration_ms,
                "status": "error", "error": str(e)[:100]}

@router.get("/query-audit", summary="Audit critical query performance")
def query_audit(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Times critical queries across all modules.
    Returns duration in ms — flags queries > 500ms as slow.
    """
    queries = [
        ("work_orders_list",     "SELECT * FROM work_orders LIMIT 50"),
        ("work_orders_open",     "SELECT count(*) FROM work_orders WHERE status='open'"),
        ("assets_all",           "SELECT * FROM assets LIMIT 50"),
        ("technicians_capacity", "SELECT id,name,current_work_orders,max_work_orders FROM technicians WHERE is_active=true"),
        ("inventory_low_stock",  "SELECT ii.id,ii.name,COALESCE(sb.quantity,0) as qty FROM inventory_items ii LEFT JOIN stock_balances sb ON sb.item_id=ii.id WHERE COALESCE(sb.quantity,0)<=ii.min_stock"),
        ("invoices_summary",     "SELECT status,sum(total_amount),count(*) FROM invoices GROUP BY status"),
        ("maintenance_overdue",  "SELECT count(*) FROM maintenance_plans WHERE next_due_date < NOW() AND status='active'"),
        ("contracts_expiring",   "SELECT count(*) FROM contracts WHERE end_date BETWEEN NOW() AND NOW()+INTERVAL '30 days' AND status='active'"),
        ("leads_by_stage",       "SELECT status,count(*) FROM leads GROUP BY status"),
        ("pm_health_check",      "SELECT a.id,a.name,(SELECT count(*) FROM work_orders w WHERE w.asset_id=a.id AND w.created_at>NOW()-INTERVAL '90 days') as wo_count FROM assets a LIMIT 20"),
    ]

    results = []
    for label, sql in queries:
        result = _timed_query(db, sql, label=label)
        results.append(result)

    slow_queries = [r for r in results if r["duration_ms"] > 500]
    avg_ms = round(sum(r["duration_ms"] for r in results) / len(results), 2) if results else 0
    max_ms = max(r["duration_ms"] for r in results) if results else 0

    return {
        "audit_date":    datetime.datetime.utcnow().isoformat(),
        "total_queries": len(results),
        "slow_queries":  len(slow_queries),
        "avg_ms":        avg_ms,
        "max_ms":        max_ms,
        "threshold_ms":  500,
        "status":        "ok" if not slow_queries else "needs_optimization",
        "results":       sorted(results, key=lambda x: x["duration_ms"], reverse=True),
        "slow_details":  slow_queries,
    }

@router.get("/table-sizes", summary="Database table sizes and row counts")
def table_sizes(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """Returns row counts and estimated sizes for all tables."""
    try:
        rows = db.execute(text("""
            SELECT
                schemaname,
                tablename,
                n_live_tup as row_count,
                pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) as total_size
            FROM pg_stat_user_tables
            ORDER BY n_live_tup DESC
            LIMIT 30
        """)).fetchall()
        tables = [row_to_dict(r) for r in rows]
    except Exception as e:
        # Fallback: use information_schema
        try:
            rows = db.execute(text("""
                SELECT table_name,
                       (SELECT count(*) FROM information_schema.columns
                        WHERE table_name=t.table_name) as column_count
                FROM information_schema.tables t
                WHERE table_schema='public'
                ORDER BY table_name
                LIMIT 30
            """)).fetchall()
            tables = [row_to_dict(r) for r in rows]
        except Exception:
            tables = []

    return {
        "tables":      tables,
        "total_shown": len(tables),
        "generated_at": datetime.datetime.utcnow().isoformat(),
    }

@router.get("/index-check", summary="Check for missing indexes on key columns")
def index_check(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    """
    Identifies tables that likely need indexes based on query patterns.
    Checks for indexes on: hotel_id, status, priority, asset_id, technician_id.
    """
    KEY_COLUMNS = [
        ("work_orders",      "hotel_id"),
        ("work_orders",      "status"),
        ("work_orders",      "priority"),
        ("work_orders",      "technician_id"),
        ("work_orders",      "asset_id"),
        ("assets",           "hotel_id"),
        ("assets",           "criticality"),
        ("maintenance_plans","status"),
        ("maintenance_plans","next_due_date"),
        ("invoices",         "status"),
        ("invoices",         "hotel_id"),
        ("purchase_requests","status"),
        ("contracts",        "end_date"),
        ("contracts",        "status"),
        ("leads",            "status"),
    ]

    try:
        # Get existing indexes
        idx_rows = db.execute(text("""
            SELECT tablename, indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
        """)).fetchall()
        existing_indexes = set()
        for row in idx_rows:
            r = row_to_dict(row)
            existing_indexes.add(f"{r.get('tablename')}::{r.get('indexdef','')}")
        idx_text = " ".join(str(r) for r in idx_rows).lower()
    except Exception:
        idx_text = ""
        existing_indexes = set()

    recommendations = []
    for table, column in KEY_COLUMNS:
        col_in_idx = f"{table}_{column}" in idx_text or f"({column})" in idx_text
        if not col_in_idx:
            recommendations.append({
                "table":      table,
                "column":     column,
                "sql":        f"CREATE INDEX IF NOT EXISTS idx_{table}_{column} ON {table}({column});",
                "priority":   "high" if table in ("work_orders","assets","invoices") else "medium",
            })

    return {
        "total_checked":    len(KEY_COLUMNS),
        "missing_indexes":  len(recommendations),
        "recommendations":  recommendations,
        "existing_count":   len(idx_rows) if "idx_rows" in dir() else 0,
        "generated_at":     datetime.datetime.utcnow().isoformat(),
    }
