from application.services.assignment_service import AssignmentService
from infrastructure.repositories.mock_assignment_repository import MockAssignmentRepository

def test_assign_lead():
    repository = MockAssignmentRepository()
    service = AssignmentService(repository)
    assignment = Assignment(agent_id=1, lead_id=2)
    result = service.assign_lead(assignment)
    assert result == 'Lead assigned to agent'

def test_get_next_available_agent():
    repository = MockAssignmentRepository()
    service = AssignmentService(repository)
    result = service.get_next_available_agent()
    assert result == 1

def test_update_agent_workload():
    repository = MockAssignmentRepository()
    service = AssignmentService(repository)
    result = service.update_agent_workload(1, 5)
    assert result == 'Workload updated'