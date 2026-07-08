from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from application.services.assignment_service import AssignmentService
from infrastructure.repositories.assignment_repository import AssignmentRepository
from domain.assignment import Assignment

router = APIRouter()

db_dependency = Depends(lambda: get_db())  # Assume get_db is defined elsewhere

@router.post('/assign_lead/')
def assign_lead(assignment: Assignment, repository: AssignmentRepository = Depends(AssignmentRepository), service: AssignmentService = Depends(AssignmentService)):
    return service.assign_lead(assignment)

@router.get('/next_available_agent/')
def get_next_available_agent(repository: AssignmentRepository = Depends(AssignmentRepository), service: AssignmentService = Depends(AssignmentService)):
    return service.get_next_available_agent()

@router.put('/update_workload/{agent_id}/{workload}')
def update_agent_workload(agent_id: int, workload: int, repository: AssignmentRepository = Depends(AssignmentRepository), service: AssignmentService = Depends(AssignmentService)):
    return service.update_agent_workload(agent_id, workload)