from domain.lead import Lead
from application.repository import LeadRepository

class LeadService:
    def __init__(self, repository: LeadRepository):
        self.repository = repository

    def update_lead_qualification(self, lead_id: int, qualification_status: str) -> None:
        self.repository.update_lead_qualification(lead_id, qualification_status)