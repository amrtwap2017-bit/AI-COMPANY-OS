from application.service.qualification_service import QualificationService
from domain.lead import Lead

def test_qualify():
    lead = Lead(id=1, name="John Doe", email="john@example.com")
    service = QualificationService()
    qualified_lead = service.qualify(lead)
    assert qualified_lead.score == 1.0