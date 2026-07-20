from __future__ import annotations
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from fastapi import Depends
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional

def row_to_dict(row):
    if row is None: return None
    if hasattr(row, "_mapping"): d = dict(row._mapping)
    elif hasattr(row, "__dict__"): d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
    else: return {}
    return {k: (v.isoformat() if hasattr(v,"isoformat") else v) for k,v in d.items()}

def rows(result): return [row_to_dict(r) for r in result]

router = APIRouter(prefix="/customers", tags=["customer-success"])

@router.get("/", summary="Customer list derived from won leads")
def list_customers(
    hotel_id: Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001",
         "limit": limit, "skip": skip}
    # leads columns: id, name, email, phone, company, status, created_at, updated_at
    # Use GROUP BY to avoid DISTINCT ON / window function conflict
    customer_rows = rows(db.execute(text(
        "SELECT company AS company_name,"
        " MAX(email) AS email,"
        " MAX(phone) AS phone,"
        " COUNT(*) AS lead_count,"
        " MAX(status) AS status,"
        " MAX(updated_at) AS last_activity"
        " FROM leads"
        " WHERE hotel_id=:hotel_id"
        " AND status IN ('won','negotiation','qualified')"
        " AND company IS NOT NULL AND company != ''"
        " GROUP BY company"
        " ORDER BY MAX(updated_at) DESC"
        " LIMIT :limit OFFSET :skip"
    ), h).fetchall())
    return {"customers": customer_rows, "total": len(customer_rows)}


@router.get("", summary="Customer list derived from won leads")
def list_customers_root(
    hotel_id: Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001",
         "limit": limit, "skip": skip}
    # leads columns: id, name, email, phone, company, status, created_at, updated_at
    # Use GROUP BY to avoid DISTINCT ON / window function conflict
    customer_rows = rows(db.execute(text(
        "SELECT company AS company_name,"
        " MAX(email) AS email,"
        " MAX(phone) AS phone,"
        " COUNT(*) AS lead_count,"
        " MAX(status) AS status,"
        " MAX(updated_at) AS last_activity"
        " FROM leads"
        " WHERE hotel_id=:hotel_id"
        " AND status IN ('won','negotiation','qualified')"
        " AND company IS NOT NULL AND company != ''"
        " GROUP BY company"
        " ORDER BY MAX(updated_at) DESC"
        " LIMIT :limit OFFSET :skip"
    ), h).fetchall())
    return {"customers": customer_rows, "total": len(customer_rows)}

@router.get("", summary="Customer list derived from won leads")
def list_noslash_customers(
    hotel_id: Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001",
         "limit": limit, "skip": skip}
    # leads columns: id, name, email, phone, company, status, created_at, updated_at
    # Use GROUP BY to avoid DISTINCT ON / window function conflict
    customer_rows = rows(db.execute(text(
        "SELECT company AS company_name,"
        " MAX(email) AS email,"
        " MAX(phone) AS phone,"
        " COUNT(*) AS lead_count,"
        " MAX(status) AS status,"
        " MAX(updated_at) AS last_activity"
        " FROM leads"
        " WHERE hotel_id=:hotel_id"
        " AND status IN ('won','negotiation','qualified')"
        " AND company IS NOT NULL AND company != ''"
        " GROUP BY company"
        " ORDER BY MAX(updated_at) DESC"
        " LIMIT :limit OFFSET :skip"
    ), h).fetchall())
    return {"customers": customer_rows, "total": len(customer_rows)}


@router.get("/360", summary="Customer 360 view")
def customer_360(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    won_leads  = rows(db.execute(text(
        "SELECT * FROM leads WHERE hotel_id=:hotel_id AND status='won'"
        " ORDER BY updated_at DESC LIMIT 10"
    ), h).fetchall())
    contracts  = rows(db.execute(text(
        "SELECT * FROM contracts WHERE hotel_id=:hotel_id AND status='active'"
        " ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    invoices   = rows(db.execute(text(
        "SELECT * FROM invoices WHERE hotel_id=:hotel_id"
        " ORDER BY created_at DESC LIMIT 10"
    ), h).fetchall())
    try:
        health = rows(db.execute(text(
            "SELECT * FROM customer_health_scores ORDER BY created_at DESC LIMIT 10"
        )).fetchall())
    except Exception:
        health = []
    return {
        "won_customers":    won_leads,
        "active_contracts": contracts,
        "recent_invoices":  invoices,
        "health_scores":    health,
        "summary": {
            "won_count":      len(won_leads),
            "contracts":      len(contracts),
            "invoices":       len(invoices),
        },
    }

@router.get("/review", summary="Customer review and renewal signals")
def customer_review(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    try:
        renewals = rows(db.execute(text(
            "SELECT * FROM customer_renewals ORDER BY created_at DESC LIMIT 10"
        )).fetchall())
    except Exception:
        renewals = []
    try:
        meetings = rows(db.execute(text(
            "SELECT * FROM customer_meetings ORDER BY scheduled_at DESC LIMIT 10"
        )).fetchall())
    except Exception:
        meetings = []
    expiring = rows(db.execute(text(
        "SELECT * FROM contracts WHERE hotel_id=:hotel_id"
        " AND end_date IS NOT NULL AND end_date < NOW() + INTERVAL '30 days'"
        " AND status='active' ORDER BY end_date ASC LIMIT 10"
    ), h).fetchall())
    return {
        "renewals":           renewals,
        "meetings":           meetings,
        "expiring_contracts": expiring,
        "total_renewals":     len(renewals),
    }
