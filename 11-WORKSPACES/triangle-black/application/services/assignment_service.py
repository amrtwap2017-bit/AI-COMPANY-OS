from domain.models import Assignment
from infrastructure.repositories.assignment_repository import AssignmentRepository

class AssignmentService:
    def __init__(self, repository: AssignmentRepository):
        self.repository = repository

    def log_assignment(self, assignment: Assignment):
        return self.repository.create(assignment)