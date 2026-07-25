from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/sales-pipeline", tags=["sales-pipeline"])

def rows(result):
    return [dict(r._mapping) for r in result if r]

@router.get("/")
def get_full_pipeline(
    hotel_id: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """Complete sales funnel: Leads → Quotes → Contracts → Revenue"""
    p = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}

    leads = rows(db.execute(text(
        "SELECT status, count(*) as count FROM leads GROUP BY status"
    ), p).fetchall())

    quotes = rows(db.execute(text(
        "SELECT status, count(*) as count, COALESCE(sum(total_value),0) as value FROM quotes GROUP BY status"
    ), p).fetchall())

    contracts = rows(db.execute(text(
        "SELECT status, count(*) as count, COALESCE(sum(total_value),0) as value FROM contracts GROUP BY status"
    ), p).fetchall())

    revenue = rows(db.execute(text(
        "SELECT status, count(*) as count, COALESCE(sum(amount),0) as value FROM invoices GROUP BY status"
    ), p).fetchall())

    return {
        "funnel": {
            "leads": leads,
            "quotes": quotes,
            "contracts": contracts,
            "revenue": revenue,
        },
        "kpis": {
            "total_leads": sum(r["count"] for r in leads),
            "total_quotes": sum(r["count"] for r in quotes),
            "total_contracts": sum(r["count"] for r in contracts),
            "total_revenue_egp": sum(float(r["value"]) for r in revenue if r.get("status") == "paid"),
            "pipeline_value_egp": sum(float(r["value"]) for r in quotes if r.get("status") not in ["rejected","expired"]),
        }
    }

@router.get("/conversion")
def conversion_rates(db: Session = Depends(get_db)):
    """Lead → Quote → Contract conversion rates"""
    total_leads = db.execute(text("SELECT count(*) FROM leads")).scalar() or 1
    total_quotes = db.execute(text("SELECT count(*) FROM quotes")).scalar() or 0
    won_quotes = db.execute(text("SELECT count(*) FROM quotes WHERE status='approved'")).scalar() or 0
    total_contracts = db.execute(text("SELECT count(*) FROM contracts")).scalar() or 0
    active_contracts = db.execute(text("SELECT count(*) FROM contracts WHERE status='active'")).scalar() or 0

    return {
        "lead_to_quote_rate": round(total_quotes / total_leads * 100, 1),
        "quote_win_rate": round(won_quotes / max(total_quotes,1) * 100, 1),
        "contract_active_rate": round(active_contracts / max(total_contracts,1) * 100, 1),
        "totals": {
            "leads": total_leads,
            "quotes": total_quotes,
            "won_quotes": won_quotes,
            "contracts": total_contracts,
            "active_contracts": active_contracts,
        }
    }
