from __future__ import annotations
from src.core.auth import get_current_user
from src.commercial.auth.models import User
from fastapi import Depends
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from typing import Optional
import uuid, datetime

def row_to_dict(row):
    if row is None: return None
    if hasattr(row, "_mapping"): d = dict(row._mapping)
    elif hasattr(row, "__dict__"): d = {k:v for k,v in row.__dict__.items() if not k.startswith("_")}
    else: return {}
    return {k: (v.isoformat() if hasattr(v,"isoformat") else v) for k,v in d.items()}

def rows(result): return [row_to_dict(r) for r in result]
router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", summary="List projects")
def list_projects(
    hotel_id: str = Depends(get_hotel_id),
    status:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = "SELECT * FROM projects WHERE 1=1"
    p: dict = {}
    if hotel_id: q += " AND hotel_id=:hotel_id"; p["hotel_id"] = hotel_id
    if status:   q += " AND status=:status";     p["status"]   = status
    q += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    p["limit"] = limit; p["skip"] = skip
    return rows(db.execute(text(q), p).fetchall())



@router.get("/dashboard", summary="Projects dashboard")
def projects_dashboard(hotel_id: str = Depends(get_hotel_id), db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    total     = db.execute(text("SELECT COUNT(*) FROM projects WHERE hotel_id=:hotel_id"), h).scalar() or 0
    active    = db.execute(text("SELECT COUNT(*) FROM projects WHERE hotel_id=:hotel_id AND status='active'"), h).scalar() or 0
    completed = db.execute(text("SELECT COUNT(*) FROM projects WHERE hotel_id=:hotel_id AND status='completed'"), h).scalar() or 0
    at_risk   = rows(db.execute(text("SELECT * FROM project_risks WHERE status='open' ORDER BY created_at DESC LIMIT 5")).fetchall())
    return {"total": total, "active": active, "completed": completed, "at_risk_count": len(at_risk), "top_risks": at_risk}

@router.post("/", status_code=201, summary="Create project")
def create_project(data: dict, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    pid = str(uuid.uuid4())
    now = _dt.utcnow()
    db.execute(text(
        "INSERT INTO projects (id, hotel_id, title, description, status, completion_pct,"
        " budget, manager_id, start_date, end_date, created_at, updated_at)"
        " VALUES (:id, :hotel_id, :title, :description, :status, :completion_pct,"
        " :budget, :manager_id, :start_date, :end_date, :created_at, :updated_at)"
    ), {
        "id":             pid,
        "hotel_id":       data.get("hotel_id","tb-default-hotel-000000000001"),
        "title":          data.get("title","New Project"),
        "description":    data.get("description"),
        "status":         data.get("status","planning"),
        "completion_pct": data.get("completion_pct",0),
        "budget":         data.get("budget",0),
        "manager_id":     data.get("manager_id"),
        "start_date":     data.get("start_date"),
        "end_date":       data.get("end_date"),
        "created_at":     now, "updated_at": now,
    })
    db.commit()
    return get_project(pid, db)

@router.get("/intelligence/summary", summary="Projects intelligence")
def projects_intelligence(db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    at_risk  = rows(db.execute(text("SELECT * FROM project_risks WHERE status='open' ORDER BY created_at DESC LIMIT 10")).fetchall())
    overdue  = rows(db.execute(text("SELECT * FROM project_milestones WHERE due_date < NOW() AND status!='completed' ORDER BY due_date LIMIT 10")).fetchall())
    return {"open_risks": at_risk, "overdue_milestones": overdue, "signals": {"risks": len(at_risk), "overdue": len(overdue)}}

# ── S69-01: Project Phase State Machine ──

from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException, Depends
from sqlalchemy import text
from datetime import datetime as _dt

PROJECT_TRANSITIONS = {
    "planning": ["active", "cancelled"],
    "active": ["on_hold", "completed", "cancelled"],
    "on_hold": ["active", "cancelled"],
    "completed": ["closed"],
    "closed": [],
    "cancelled": []
}

@router.get("/portfolio/summary", summary="All projects portfolio summary")
def portfolio_summary(db: Session = Depends(get_db)):
    """Portfolio-level view of all projects with financial health."""
    try:
        rows = db.execute(text("""
            SELECT id, name, status,
                   COALESCE(budget, total_value, contract_value, 0) as budget,
                   COALESCE(progress_percentage, completion_pct, 0) as progress
            FROM projects
            ORDER BY created_at DESC
            LIMIT 50
        """)).fetchall()
    except Exception:
        try:
            rows = db.execute(text("SELECT id, status FROM projects LIMIT 50")).fetchall()
        except Exception:
            rows = []

    total_budget = 0
    by_status = {}
    projects_list = []

    for row in rows:
        p = row_to_dict(row)
        status = p.get("status", "unknown")
        budget = float(p.get("budget") or 0)
        total_budget += budget
        by_status[status] = by_status.get(status, 0) + 1
        projects_list.append({
            "id":       p.get("id"),
            "name":     p.get("name") or p.get("title") or p.get("id"),
            "status":   status,
            "budget":   budget,
            "progress": float(p.get("progress") or 0),
        })

    return {
        "total_projects":   len(projects_list),
        "total_budget_egp": round(total_budget, 2),
        "by_status":        by_status,
        "projects":         projects_list,
        "currency":         "EGP",
        "generated_at":     _dt.utcnow().isoformat(),
    }
@router.get("/{project_id}", summary="Get project")
def get_project(project_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM projects WHERE id=:id"), {"id": project_id}).fetchone()
    if not r: raise HTTPException(404, "Project not found")
    return row_to_dict(r)

@router.get("/{project_id}/phases", summary="Project phases")
def project_phases(project_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    return rows(db.execute(text("SELECT * FROM project_phases WHERE project_id=:id ORDER BY created_at"), {"id": project_id}).fetchall())

@router.get("/{project_id}/risks", summary="Project risks")
def project_risks(project_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    return rows(db.execute(text("SELECT * FROM project_risks WHERE project_id=:id ORDER BY created_at DESC"), {"id": project_id}).fetchall())

@router.get("/{project_id}/milestones", summary="Project milestones")
def project_milestones(project_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    return rows(db.execute(text("SELECT * FROM project_milestones WHERE project_id=:id ORDER BY due_date"), {"id": project_id}).fetchall())

@router.post("/{project_id}/transition")
def project_transition(project_id: str, data: dict, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    try:
        pid = uuid.UUID(project_id)
        project = db.execute(text("SELECT * FROM projects WHERE id=:id"), {"id": pid}).fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        current_status = project.status
        to_status = data.get("to")
        comment = data.get("comment", "")
        changed_by = data.get("changed_by", "")

        if to_status not in PROJECT_TRANSITIONS[current_status]:
            raise HTTPException(status_code=400, detail="Invalid transition")

        db.execute(text("UPDATE projects SET status=:status, updated_at=:updated_at WHERE id=:id"),
                   {"status": to_status, "updated_at": datetime.now(), "id": pid})

        log_id = uuid4()
        db.execute(text("INSERT INTO project_transition_logs (id, project_id, from_status, to_status, comment, changed_by, created_at) "
                       "VALUES (:id, :project_id, :from_status, :to_status, :comment, :changed_by, :created_at)"),
                   {"id": log_id, "project_id": pid, "from_status": current_status, "to_status": to_status,
                    "comment": comment, "changed_by": changed_by, "created_at": datetime.now()})

        db.commit()
        return {
            "success": True,
            "project": get_project(pid, db),
            "transition": {"from": current_status, "to": to_status},
            "message": f"Project {pid} transitioned from {current_status} to {to_status}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/transitions")
def project_transitions(project_id: str, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    try:
        pid = uuid.UUID(project_id)
        project = db.execute(text("SELECT * FROM projects WHERE id=:id"), {"id": pid}).fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        current_status = project.status
        allowed_transitions = PROJECT_TRANSITIONS[current_status]

        return {
            "current_status": current_status,
            "allowed_transitions": allowed_transitions,
            "project_id": pid
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── S70-03: Earned Value + Project Financial Metrics (Program E) ──────────────

@router.get("/{project_id}/financials", summary="Project earned value metrics")
def project_financials(project_id: str, db: Session = Depends(get_db)):
    """
    Returns earned value analysis for a project.
    EV Metrics: BAC, PV, EV, AC, CPI, SPI, VAC, EAC
    """
    row = db.execute(
        text("SELECT * FROM projects WHERE id = :id"), {"id": project_id}
    ).fetchone()
    if not row:
        raise HTTPException(404, "Project not found")

    proj = row_to_dict(row)

    # Budget At Completion
    bac = float(proj.get("budget") or proj.get("total_value") or proj.get("contract_value") or 0)

    # Progress % from project record
    progress_pct = float(proj.get("progress_percentage") or proj.get("completion_pct") or 0) / 100

    # Actual Cost — from work orders linked to this project
    try:
        ac_row = db.execute(text("""
            SELECT COALESCE(sum(actual_cost), 0) as actual_cost
            FROM work_orders WHERE project_id = :id
        """), {"id": project_id}).fetchone()
        ac = float(row_to_dict(ac_row).get("actual_cost") or 0)
    except Exception:
        # Fallback: count WOs * avg cost estimate
        try:
            wo_count = db.execute(text(
                "SELECT count(*) as cnt FROM work_orders WHERE project_id = :id"
            ), {"id": project_id}).fetchone()
            ac = float(row_to_dict(wo_count).get("cnt") or 0) * 5000  # 5000 EGP avg
        except Exception:
            ac = 0.0

    # Earned Value metrics
    ev  = bac * progress_pct          # Earned Value
    pv  = bac * progress_pct          # Planned Value (simplified — same as EV here)
    cpi = ev / ac if ac > 0 else 1.0  # Cost Performance Index
    spi = ev / pv if pv > 0 else 1.0  # Schedule Performance Index
    vac = bac - (ac / cpi if cpi > 0 else bac)  # Variance At Completion
    eac = bac / cpi if cpi > 0 else bac          # Estimate At Completion

    # Status flags
    cost_status = "on_budget" if cpi >= 0.95 else "over_budget" if cpi < 0.9 else "at_risk"
    sched_status = "on_schedule" if spi >= 0.95 else "behind" if spi < 0.9 else "at_risk"

    return {
        "project_id":   project_id,
        "project_name": proj.get("name") or proj.get("title"),
        "currency":     "EGP",
        "earned_value": {
            "bac":     round(bac, 2),
            "ev":      round(ev, 2),
            "pv":      round(pv, 2),
            "ac":      round(ac, 2),
            "cpi":     round(cpi, 3),
            "spi":     round(spi, 3),
            "vac":     round(vac, 2),
            "eac":     round(eac, 2),
            "progress_pct": round(progress_pct * 100, 1),
        },
        "status": {
            "cost":     cost_status,
            "schedule": sched_status,
        },
        "generated_at": _dt.utcnow().isoformat(),
    }

