from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from domain.models.activity import Activity

class ActivityRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_sorted_by_created_at_desc(self) -> List[Activity]:
        query = await self.session.execute(self.session.query(Activity).order_by(Activity.created_at.desc()))
        return query.scalars().all()