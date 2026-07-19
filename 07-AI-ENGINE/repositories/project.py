from sqlalchemy.orm import Session

from repositories.base import BaseRepository
from models.db.project import Project


class ProjectRepository(BaseRepository[Project]):

    def __init__(self, db: Session):
        super().__init__(Project, db)

    def get_by_status(self, status: str) -> list[Project]:
        return (
            self.db.query(Project)
            .filter(Project.status == status)
            .order_by(Project.created_at.desc())
            .all()
        )

    def get_by_owner(self, owner: str) -> list[Project]:
        return (
            self.db.query(Project)
            .filter(Project.owner == owner)
            .order_by(Project.created_at.desc())
            .all()
        )

    def set_status(self, project_id: int, status: str) -> Project:
        project = self.get(project_id)
        project.status = status
        return self.update(project)

    def save_plan(self, project_id: int, plan: dict) -> Project:
        project = self.get(project_id)
        project.plan = plan
        project.status = "running"
        return self.update(project)

    def save_results(
        self,
        project_id: int,
        workflow_run_id: int,
        task_results: dict,
    ) -> Project:
        project = self.get(project_id)
        project.workflow_run_id = workflow_run_id
        project.task_results = task_results
        project.status = "evaluating"
        return self.update(project)

    def save_evaluation(
        self,
        project_id: int,
        score: float,
        feedback: str,
        critic_feedback: str,
    ) -> Project:
        project = self.get(project_id)
        project.eval_score = score
        project.eval_feedback = feedback
        project.critic_feedback = critic_feedback
        return self.update(project)

    def save_report(
        self,
        project_id: int,
        report: str,
        duration: float,
    ) -> Project:
        project = self.get(project_id)
        project.final_report = report
        project.duration_seconds = duration
        project.status = "complete"
        return self.update(project)

    def recent(self, limit: int = 20) -> list[Project]:
        return (
            self.db.query(Project)
            .order_by(Project.created_at.desc())
            .limit(limit)
            .all()
        )
