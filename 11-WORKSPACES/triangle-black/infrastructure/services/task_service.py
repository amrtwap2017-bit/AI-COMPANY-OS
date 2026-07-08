from application.repositories.task_repository import TaskRepository
from domain.models import Task

class TaskService:
    def __init__(self, db: Session):
        self.repository = TaskRepository(db)

    def create_task(self, task_data: dict) -> Task:
        return self.repository.create_task(task_data)

    def get_tasks_by_email(self, email: str) -> list[Task]:
        return self.repository.get_tasks_by_email(email)

    def get_tasks_by_status(self, status: str) -> list[Task]:
        return self.repository.get_tasks_by_status(status)

    def get_tasks_by_source(self, source: str) -> list[Task]:
        return self.repository.get_tasks_by_source(source)

    def get_tasks_by_assigned_agent_id(self, assigned_agent_id: int) -> list[Task]:
        return self.repository.get_tasks_by_assigned_agent_id(assigned_agent_id)