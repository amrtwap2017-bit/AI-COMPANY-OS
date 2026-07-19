"""
Project Reporter
─────────────────────────────────────────────────────
Generates different report formats from a project.
"""

from db.database import SessionLocal
from models.db.project import Project


class ProjectReporter:

    def get_full_report(self, project_id: int) -> dict | None:
        db = SessionLocal()
        try:
            project = db.query(Project).filter(
                Project.id == project_id
            ).first()
            if not project:
                return None

            return {
                "id": project.id,
                "name": project.name,
                "goal": project.goal,
                "status": project.status,
                "owner": project.owner,
                "eval_score": project.eval_score,
                "eval_feedback": project.eval_feedback,
                "critic_feedback": project.critic_feedback,
                "final_report": project.final_report,
                "task_results": project.task_results,
                "duration_seconds": project.duration_seconds,
                "created_at": project.created_at.isoformat(),
                "plan": project.plan,
            }
        finally:
            db.close()

    def get_summary(self, project_id: int) -> dict | None:
        db = SessionLocal()
        try:
            project = db.query(Project).filter(
                Project.id == project_id
            ).first()
            if not project:
                return None

            task_count = len(project.task_results or {})
            completed = sum(
                1 for v in (project.task_results or {}).values()
                if v.get("status") == "success"
            )

            return {
                "id": project.id,
                "name": project.name,
                "goal": project.goal,
                "status": project.status,
                "eval_score": project.eval_score,
                "tasks_completed": f"{completed}/{task_count}",
                "duration": f"{project.duration_seconds:.1f}s" if project.duration_seconds else None,
                "recommendation": self._get_recommendation(project),
            }
        finally:
            db.close()

    def _get_recommendation(self, project: Project) -> str:
        if not project.critic_feedback:
            return "No recommendation available"
        lines = project.critic_feedback.split("\n")
        for line in lines:
            if "recommendation" in line.lower():
                return line.split(":", 1)[-1].strip()
        return "See full report for details"


project_reporter = ProjectReporter()
