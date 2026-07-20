from __future__ import annotations
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from fastapi import Depends
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from typing import Optional
import uuid, datetime

def row_to_dict(row):
    if row is None: return None
    if hasattr(row, "_mapping"): d = dict(row._mapping)
    elif hasattr(row, "__dict__"): d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
    else: return {}
    return {k: (v.isoformat() if hasattr(v,"isoformat") else v) for k,v in d.items()}

def rows(result): return [row_to_dict(r) for r in result]
router = APIRouter(prefix="/maintenance", tags=["maintenance"])

# ── Dashboard ─────────────────────────────────────────────────
@router.get("/dashboard", summary="Maintenance dashboard KPIs")
def maintenance_dashboard(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    total_assets  = db.execute(text("SELECT COUNT(*) FROM assets WHERE hotel_id=:hotel_id"), h).scalar() or 0
    open_wos      = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='open'"), h).scalar() or 0
    in_prog_wos   = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND status='in_progress'"), h).scalar() or 0
    critical_wos  = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hotel_id AND priority IN ('critical','high')"), h).scalar() or 0
    active_plans  = db.execute(text("SELECT COUNT(*) FROM maintenance_plans WHERE status='active'")).scalar() or 0
    due_today     = db.execute(text("SELECT COUNT(*) FROM maintenance_plans WHERE next_due_date = CURRENT_DATE::text")).scalar() or 0
    return {
        "total_assets":     total_assets,
        "open_work_orders": open_wos,
        "in_progress":      in_prog_wos,
        "critical":         critical_wos,
        "active_pm_plans":  active_plans,
        "due_today":        due_today,
        "health": "good" if critical_wos == 0 else "attention_needed",
    }

# ── PM Plans ──────────────────────────────────────────────────
@router.get("/pm-plans", summary="List preventive maintenance plans")
def list_pm_plans(
    status: Optional[str] = None,
    skip:   int = 0,
    limit:  int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = "SELECT * FROM maintenance_plans WHERE 1=1"
    p: dict = {}
    if status: q += " AND status=:status"; p["status"] = status
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    p["limit"] = limit; p["skip"] = skip
    return rows(db.execute(text(q), p).fetchall())

@router.get("/pm-plans/{plan_id}", summary="Get PM plan")
def get_pm_plan(plan_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM maintenance_plans WHERE id=:id"), {"id": plan_id}).fetchone()
    if not r: raise HTTPException(404, "PM plan not found")
    return row_to_dict(r)

@router.post("/pm-plans", status_code=201, summary="Create PM plan")
def create_pm_plan(data: dict, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    pid = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    db.execute(text(
        "INSERT INTO maintenance_plans (id, asset_node_id, title, plan_type, frequency,"
        " next_due_date, status, owner, notes, created_at, updated_at)"
        " VALUES (:id, :asset_node_id, :title, :plan_type, :frequency,"
        " :next_due_date, :status, :owner, :notes, :created_at, :updated_at)"
    ), {
        "id": pid, "asset_node_id": data.get("asset_node_id"),
        "title": data.get("title","New PM Plan"),
        "plan_type": data.get("plan_type","preventive"),
        "frequency": data.get("frequency","monthly"),
        "next_due_date": data.get("next_due_date"),
        "status": data.get("status","active"),
        "owner": data.get("owner"),
        "notes": data.get("notes"),
        "created_at": now, "updated_at": now,
    })
    db.commit()
    return get_pm_plan(pid, db)

# ── Work Items ────────────────────────────────────────────────
@router.get("/work-items", summary="Maintenance work items")
def list_work_items(
    status: Optional[str] = None,
    skip:   int = 0,
    limit:  int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = "SELECT * FROM maintenance_work_items WHERE 1=1"
    p: dict = {}
    if status: q += " AND status=:status"; p["status"] = status
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    p["limit"] = limit; p["skip"] = skip
    return rows(db.execute(text(q), p).fetchall())

# ── Schedule ──────────────────────────────────────────────────
@router.get("/schedule", summary="Maintenance schedule")
def maintenance_schedule(db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    r = rows(db.execute(text(
        "SELECT * FROM maintenance_plans WHERE status='active' ORDER BY next_due_date ASC LIMIT 100"
    )).fetchall())
    return {"schedule": r, "total": len(r)}

# ── Asset Tree ────────────────────────────────────────────────
@router.get("/asset-tree", summary="Hierarchical asset tree")
def asset_tree(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = hotel_id or "tb-default-hotel-000000000001"
    asset_rows = rows(db.execute(text(
        "SELECT * FROM assets WHERE hotel_id=:h ORDER BY category, name"
    ), {"h": h}).fetchall())
    tree: dict = {}
    for a in asset_rows:
        cat = a.get("category","uncategorized")
        tree.setdefault(cat, {"category": cat, "count": 0, "assets": []})
        tree[cat]["assets"].append(a)
        tree[cat]["count"] += 1
    return {"tree": list(tree.values()), "total_assets": len(asset_rows)}

# ── Intelligence ──────────────────────────────────────────────
@router.get("/intelligence", summary="Maintenance intelligence summary")
def maintenance_intelligence(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    critical = rows(db.execute(text(
        "SELECT * FROM work_orders WHERE hotel_id=:hotel_id AND priority='critical' AND status!='completed' ORDER BY created_at DESC LIMIT 5"
    ), h).fetchall())
    overdue_plans = rows(db.execute(text(
        "SELECT * FROM maintenance_plans WHERE next_due_date < CURRENT_DATE::text AND status='active' LIMIT 10"
    )).fetchall())
    return {
        "critical_work_orders": critical,
        "overdue_pm_plans": overdue_plans,
        "insights": [
            {"type": "critical", "message": f"{len(critical)} critical work orders require immediate attention"} if critical else None,
            {"type": "warning", "message": f"{len(overdue_plans)} PM plans are overdue"} if overdue_plans else None,
        ],
    }

# ── Actions ───────────────────────────────────────────────────
@router.get("/actions", summary="Maintenance action items")
def maintenance_actions(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    open_wos = rows(db.execute(text(
        "SELECT * FROM work_orders WHERE hotel_id=:hotel_id AND status IN ('open','in_progress') ORDER BY priority DESC, created_at DESC LIMIT 20"
    ), h).fetchall())
    return {"actions": open_wos, "total": len(open_wos)}

# ── Costs Review ──────────────────────────────────────────────
@router.get("/costs", summary="Maintenance costs review")
def maintenance_costs(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    cost_rows = rows(db.execute(text(
        "SELECT * FROM maintenance_cost_records ORDER BY created_at DESC LIMIT 50"
    )).fetchall())
    total = sum(float(r.get("amount",0) or 0) for r in cost_rows)
    return {"records": cost_rows, "total_cost": total, "currency": "EGP"}

# ── Downtime ──────────────────────────────────────────────────
@router.get("/downtime", summary="Asset downtime records")
def maintenance_downtime(db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    r = rows(db.execute(text(
        "SELECT * FROM maintenance_downtime_records ORDER BY created_at DESC LIMIT 50"
    )).fetchall())
    return {"records": r, "total": len(r)}
