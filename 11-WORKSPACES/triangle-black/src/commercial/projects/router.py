from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.projects.models import Project
from src.commercial.projects.repository import ProjectRepository
from src.commercial.projects.schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter()

@router.post('/', response_model=ProjectResponse, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    project_data = payload.dict()
    project_data['hotel_id'] = hotel_id
    project_repo = ProjectRepository(db)
    return project_repo.create_project(project_data)

@router.get('/', response_model=list[ProjectResponse])
def get_projects_by_hotel_id(
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    project_repo = ProjectRepository(db)
    return project_repo.get_projects_by_hotel_id(hotel_id)

@router.get('/{project_id}', response_model=ProjectResponse)
def get_project_by_id(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    project_repo = ProjectRepository(db)
    project = project_repo.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail='Project not found')
    return project

@router.patch('/{project_id}', response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    project_repo = ProjectRepository(db)
    project_data = payload.dict()
    return project_repo.update_project(project_id, project_data)

@router.delete('/{project_id}', status_code=204)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    project_repo = ProjectRepository(db)
    project_repo.delete_project(project_id)
