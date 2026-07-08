from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from domain.lead import Lead
from infrastructure.database import Base, async_session_factory

Base.metadata.create_all(async_session_factory.bind)

class LeadRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_recent_leads(self) -> List[Lead]:
        query = await self.session.execute(self.session.query(Lead).order_by(Lead.id.desc()).limit(10))
        return query.scalars().all()
