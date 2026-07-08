from domain.workload import Workload
from infrastructure.repositories.workload_repository import WorkloadRepository

class WorkloadService:
    def __init__(self, repository: WorkloadRepository):
        self.repository = repository

    async def assign_lead(self, agent_id: int) -> bool:
        workload = await self.repository.get_by_agent(agent_id)
        if not workload or workload.leads_assigned < workload.max_leads:
            await self.repository.update_workload(agent_id, leads_assigned=workload.leads_assigned + 1)
            return True
        return False