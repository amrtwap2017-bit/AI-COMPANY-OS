from domain.lead import Lead
from infrastructure.repository import LeadRepository

class LeadService:
    def __init__(self, repository: LeadRepository):
        self.repository = repository

    def get_all_leads(self) -> list[Lead]:
        return self.repository.get_all()
