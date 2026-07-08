from typing import List
from domain.lead import Lead
from infrastructure.repositories.lead_repository import LeadRepository

class LeadService:
    def __init__(self, lead_repo: LeadRepository):
        self.lead_repo = lead_repo

    async def get_recent_leads(self) -> List[Lead]:
        return await self.lead_repo.get_recent_leads()
