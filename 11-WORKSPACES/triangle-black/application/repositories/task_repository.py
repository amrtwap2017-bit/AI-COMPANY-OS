from sqlalchemy.orm import Session
from domain.models import Task

class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_task(self, task_data: dict):
        task = Task(**task_data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_tasks_by_email(self, email: str):
        return self.db.query(Task).filter(Task.email == email).all()

    def get_tasks_by_status(self, status: str):
        return self.db.query(Task).filter(Task.status == status).all()

    def get_tasks_by_source(self, source: str):
        return self.db.query(Task).filter(Task.source == source).all()

    def get_tasks_by_assigned_agent_id(self, assigned_agent_id: int):
        return self.db.query(Task).filter(Task.assigned_agent_id == assigned_agent_id).all()