from sqlalchemy.orm import Session
from src.core.database import get_db
from src.commercial.projects.models import Project

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, project_data: dict):
        project = Project(**project_data)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_projects_by_hotel_id(self, hotel_id: str):
        return self.db.query(Project).filter(Project.hotel_id == hotel_id).all()

    def get_project_by_id(self, project_id: str):
        return self.db.query(Project).filter(Project.id == project_id).first()

    def update_project(self, project_id: str, project_data: dict):
        project = self.get_project_by_id(project_id)
        if not project:
            raise ValueError('Project not found')
        for key, value in project_data.items():
            setattr(project, key, value)
        self.db.commit()
        return project

    def delete_project(self, project_id: str):
        project = self.get_project_by_id(project_id)
        if not project:
            raise ValueError('Project not found')
        self.db.delete(project)
        self.db.commit()
