from domain.models import Item
from infrastructure.repositories.item_repository import ItemRepository

class ItemService:
    def __init__(self, item_repo: ItemRepository):
        self.item_repo = item_repo

    async def create_item(self, item_data: dict) -> Item:
        return await self.item_repo.create(item_data)

    async def get_item(self, item_id: int) -> Item:
        return await self.item_repo.get(item_id)

    async def update_item(self, item_id: int, item_data: dict) -> Item:
        return await self.item_repo.update(item_id, item_data)

    async def delete_item(self, item_id: int):
        await self.item_repo.delete(item_id)