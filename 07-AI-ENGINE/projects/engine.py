"""
Project Engine
─────────────────────────────────────────────────────
Top-level interface for project management.
Wraps ProjectRunner with DB query methods.
"""

from projects.runner import project_runner, ProjectResult
from db.database import SessionLocal
from models.db.project import Project
from repositories.project import ProjectRepository


class ProjectEngine:

    def create_and_run(
        self,
        name: str,
        goal: str,
        owner: str = "admin",
        template: str | None = None,
        use_ai_planner: bool = False,
    ) -> ProjectResult:
        return project_runner.run(
            name=name,
            goal=goal,
            owner=owner,
            template=template,
            use_ai_planner=use_ai_planner,
        )

    def get(self, project_id: int) -> dict | None:
        db = SessionLocal()
        try:
            project = db.query(Project).filter(
                Project.id == project_id
            ).first()
            return self._to_dict(project) if project else None
        finally:
            db.close()

    def list(self, limit: int = 20) -> list[dict]:
        db = SessionLocal()
        try:
            projects = (
                db.query(Project)
                .order_by(Project.created_at.desc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(p) for p in projects]
        finally:
            db.close()

    def get_report(self, project_id: int) -> str | None:
        db = SessionLocal()
        try:
            project = db.query(Project).filter(
                Project.id == project_id
            ).first()
            return project.final_report if project else None
        finally:
            db.close()

    def _to_dict(self, project: Project) -> dict:
        return {
            "id": project.id,
            "name": project.name,
            "goal": project.goal,
            "description": project.description,
            "status": project.status,
            "owner": project.owner,
            "workflow_run_id": project.workflow_run_id,
            "eval_score": project.eval_score,
            "eval_feedback": project.eval_feedback,
            "critic_feedback": project.critic_feedback,
            "duration_seconds": project.duration_seconds,
            "has_report": bool(project.final_report),
            "created_at": project.created_at.isoformat(),
        }


project_engine = ProjectEngine()
