from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from domain.workload import Workload

class WorkloadRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_agent(self, agent_id: int) -> Workload | None:
        result = await self.session.execute(select(Workload).where(Workload.agent_id == agent_id))
        return result.scalars().first()

    async def update_workload(self, agent_id: int, leads_assigned: int):
        workload = await self.get_by_agent(agent_id)
        if workload:
            workload.leads_assigned = leads_assigned
            self.session.add(workload)
            await self.session.commit()