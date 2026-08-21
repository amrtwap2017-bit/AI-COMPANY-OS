"""
Application Service for Projects Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.projects.repository import ProjectRepository
from src.core.audit import audit_create, audit_update, audit_action

class ProjectService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = ProjectRepository(db)

    def get_by_id(self, project_id: str) -> Optional[Dict[str, Any]]:
        p = self.repo.get_by_id(project_id, self.hotel_id)
        return getattr(p, "to_dict", lambda: dict(p.__dict__))() if p else None

    def list_projects(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_projects(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_project(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        p = self.repo.create(payload)
        pid = str(getattr(p, "id", ""))
        try:
            audit_create(self.db, "project", pid, self.actor, self.hotel_id)
        except Exception:
            pass
        return getattr(p, "to_dict", lambda: dict(p.__dict__))()

    def complete_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        updated = self.repo.update(project_id, self.hotel_id, {
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        if updated:
            try:
                audit_action(self.db, "project", project_id, "COMPLETE", self.actor)
            except Exception:
                pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
