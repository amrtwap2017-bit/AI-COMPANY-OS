from typing import List
from domain.models.activity import Activity
from infrastructure.repositories.activity_repository import ActivityRepository

class ActivityService:
    def __init__(self, repository: ActivityRepository):
        self.repository = repository

    async def get_all_activities(self) -> List[Activity]:
        return await self.repository.get_all_sorted_by_created_at_desc()