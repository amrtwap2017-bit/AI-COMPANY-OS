from __future__ import annotations
import uuid, datetime
from datetime import datetime as _dt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/customer-success", tags=["customer-success"], dependencies=[_Dep_v7(_gcu_v7)])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _ensure_nps_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS customer_nps (
            id          VARCHAR(36) PRIMARY KEY,
            hotel_id    VARCHAR(36) NOT NULL,
            score       INTEGER NOT NULL CHECK (score BETWEEN 0 AND 10),
            comment     TEXT,
            category    VARCHAR(20),
            surveyed_by VARCHAR(36),
            created_at  TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.get("/overview", summary="Customer success overview")
def customer_success_overview(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        contracts = db.execute(text("""
            SELECT
                count(*) as total,
                sum(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                sum(CASE WHEN end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
                         AND status = 'active' THEN 1 ELSE 0 END) as expiring_30,
                COALESCE(sum(CASE WHEN end_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'
                         AND status = 'active' THEN total_value ELSE 0 END), 0) as renewal_pipeline
            FROM contracts
        """)).fetchone()
        c = row_to_dict(contracts)
    except Exception:
        c = {"total": 0, "active": 0, "expiring_30": 0, "renewal_pipeline": 0}

    try:
        at_risk = db.execute(text("""
            SELECT count(DISTINCT hotel_id) as count FROM work_orders
            WHERE priority = 'critical'
              AND status NOT IN ('completed','closed','cancelled')
              AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY hotel_id
            HAVING count(*) >= 3
        """)).fetchall()
        at_risk_count = len(at_risk)
    except Exception:
        at_risk_count = 0

    try:
        nps_row = db.execute(text(
            "SELECT COALESCE(avg(score),0) as avg_score FROM customer_nps"
        )).fetchone()
        avg_nps = round(float(row_to_dict(nps_row).get("avg_score", 0)), 1)
    except Exception:
        avg_nps = 0.0

    return {
        "total_clients":             int(c.get("total") or 0),
        "active_contracts":          int(c.get("active") or 0),
        "contracts_expiring_30_days": int(c.get("expiring_30") or 0),
        "avg_satisfaction_score":    avg_nps,
        "renewal_pipeline_value_egp": float(c.get("renewal_pipeline") or 0),
        "at_risk_count":             at_risk_count,
        "currency":                  "EGP",
        "generated_at":              _dt.utcnow().isoformat(),
    }

@router.get("/renewals", summary="Contracts expiring in 90 days")
def get_renewals(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT c.id, c.title, c.end_date, c.total_value, c.status,
                   h.name as hotel_name,
                   DATE_PART('day', c.end_date - NOW()) as days_remaining
            FROM contracts c
            LEFT JOIN hotels h ON h.id = c.hotel_id
            WHERE c.end_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'
              AND c.status = 'active'
            ORDER BY c.end_date ASC
            LIMIT 50
        """)).fetchall()
    except Exception:
        rows = []

    renewals = []
    for row in rows:
        r = row_to_dict(row)
        days = int(r.get("days_remaining") or 90)
        risk = "high" if days < 30 else "medium" if days < 60 else "low"
        r["risk_level"] = risk
        r["days_remaining"] = days
        renewals.append(r)

    return {"renewals": renewals, "total": len(renewals)}

@router.post("/nps", summary="Submit NPS survey response")
def submit_nps(data: dict, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    hotel_id    = data.get("hotel_id")
    score       = data.get("score")
    comment     = data.get("comment", "")
    surveyed_by = data.get("surveyed_by", "")

    if score is None or not (0 <= int(score) <= 10):
        raise HTTPException(400, "score must be 0-10")

    score = int(score)
    category = "promoter" if score >= 9 else "passive" if score >= 7 else "detractor"

    _ensure_nps_table(db)
    nps_id = str(uuid.uuid4())
    now = _dt.utcnow()

    db.execute(text("""
        INSERT INTO customer_nps (id, hotel_id, score, comment, category, surveyed_by, created_at)
        VALUES (:id, :hotel_id, :score, :comment, :category, :surveyed_by, :now)
    """), {
        "id": nps_id, "hotel_id": hotel_id, "score": score,
        "comment": comment, "category": category,
        "surveyed_by": surveyed_by, "now": now,
    })
    db.commit()

    return {
        "success":  True,
        "nps_id":   nps_id,
        "score":    score,
        "category": category,
        "message":  f"NPS submitted — {category}",
    }

@router.get("/nps/summary", summary="NPS score summary")
def nps_summary(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        _ensure_nps_table(db)
        row = db.execute(text("""
            SELECT
                count(*) as total,
                sum(CASE WHEN category = 'promoter'  THEN 1 ELSE 0 END) as promoters,
                sum(CASE WHEN category = 'passive'   THEN 1 ELSE 0 END) as passives,
                sum(CASE WHEN category = 'detractor' THEN 1 ELSE 0 END) as detractors
            FROM customer_nps
        """)).fetchone()
        d = row_to_dict(row)
        total      = int(d.get("total") or 0)
        promoters  = int(d.get("promoters") or 0)
        passives   = int(d.get("passives") or 0)
        detractors = int(d.get("detractors") or 0)
        nps_score  = round((promoters - detractors) / total * 100, 1) if total > 0 else 0.0
    except Exception:
        total = promoters = passives = detractors = 0
        nps_score = 0.0

    return {
        "total_responses": total,
        "promoters":       promoters,
        "passives":        passives,
        "detractors":      detractors,
        "nps_score":       nps_score,
        "scale":           "(-100 to +100)",
        "generated_at":    _dt.utcnow().isoformat(),
    }

@router.get("/at-risk", summary="At-risk clients by critical WO count")
def get_at_risk_clients(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT wo.hotel_id,
                   h.name as hotel_name,
                   count(*) as critical_wo_count,
                   max(wo.created_at) as last_critical_date,
                   COALESCE(c.total_value, 0) as contract_value
            FROM work_orders wo
            LEFT JOIN hotels h ON h.id = wo.hotel_id
            LEFT JOIN contracts c ON c.hotel_id = wo.hotel_id AND c.status = 'active'
            WHERE wo.priority = 'critical'
              AND wo.status NOT IN ('completed','closed','cancelled')
              AND wo.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY wo.hotel_id, h.name, c.total_value
            HAVING count(*) >= 3
            ORDER BY count(*) DESC
            LIMIT 20
        """)).fetchall()
        return {"at_risk": [row_to_dict(r) for r in rows], "total": len(rows)}
    except Exception as e:
        return {"at_risk": [], "total": 0, "note": str(e)}
