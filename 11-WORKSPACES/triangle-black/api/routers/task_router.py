from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from infrastructure.db import get_db
from domain.models import Task
from application.services.task_service import TaskService

router = APIRouter()

task_service = TaskService(get_db())

@router.post('/tasks/', response_model=Task)
def create_task(task_data: dict, db: Session = Depends(get_db)):
    return task_service.create_task(task_data)

@router.get('/tasks/email/{email}', response_model=list[Task])
def get_tasks_by_email(email: str, db: Session = Depends(get_db)):
    return task_service.get_tasks_by_email(email)

@router.get('/tasks/status/{status}', response_model=list[Task])
def get_tasks_by_status(status: str, db: Session = Depends(get_db)):
    return task_service.get_tasks_by_status(status)

@router.get('/tasks/source/{source}', response_model=list[Task])
def get_tasks_by_source(source: str, db: Session = Depends(get_db)):
    return task_service.get_tasks_by_source(source)

@router.get('/tasks/agent/{assigned_agent_id}', response_model=list[Task])
def get_tasks_by_assigned_agent_id(assigned_agent_id: int, db: Session = Depends(get_db)):
    return task_service.get_tasks_by_assigned_agent_id(assigned_agent_id)