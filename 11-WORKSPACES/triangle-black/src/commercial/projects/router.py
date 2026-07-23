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
router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", summary="List projects")
def list_projects(
    hotel_id: Optional[str] = None,
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


@router.get("", summary="List projects")
def list_projects_root(
    hotel_id: Optional[str] = None,
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

@router.get("", summary="List projects")
def list_noslash_projects(
    hotel_id: Optional[str] = None,
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
def projects_dashboard(hotel_id: Optional[str] = None, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    h = {"hotel_id": hotel_id or "tb-default-hotel-000000000001"}
    total     = db.execute(text("SELECT COUNT(*) FROM projects WHERE hotel_id=:hotel_id"), h).scalar() or 0
    active    = db.execute(text("SELECT COUNT(*) FROM projects WHERE hotel_id=:hotel_id AND status='active'"), h).scalar() or 0
    completed = db.execute(text("SELECT COUNT(*) FROM projects WHERE hotel_id=:hotel_id AND status='completed'"), h).scalar() or 0
    at_risk   = rows(db.execute(text("SELECT * FROM project_risks WHERE status='open' ORDER BY created_at DESC LIMIT 5")).fetchall())
    return {"total": total, "active": active, "completed": completed, "at_risk_count": len(at_risk), "top_risks": at_risk}

@router.get("/{project_id}", summary="Get project")
def get_project(project_id: str, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    r = db.execute(text("SELECT * FROM projects WHERE id=:id"), {"id": project_id}).fetchone()
    if not r: raise HTTPException(404, "Project not found")
    return row_to_dict(r)

@router.post("/", status_code=201, summary="Create project")
def create_project(data: dict, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    pid = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
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

PROJECT_TRANSITIONS = {
    "planning": ["active", "cancelled"],
    "active": ["on_hold", "completed", "cancelled"],
    "on_hold": ["active", "cancelled"],
    "completed": ["closed"],
    "closed": [],
    "cancelled": []
}

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