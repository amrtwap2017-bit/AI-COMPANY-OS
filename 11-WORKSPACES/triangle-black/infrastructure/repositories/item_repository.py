from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from domain.models import Item

class ItemRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, item_data: dict) -> Item:
        item = Item(**item_data)
        self.session.add(item)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def get(self, item_id: int) -> Item:
        result = await self.session.execute(select(Item).where(Item.id == item_id))
        return result.scalars().first()

    async def update(self, item_id: int, item_data: dict) -> Item:
        item = await self.get(item_id)
        for key, value in item_data.items():
            setattr(item, key, value)
        await self.session.commit()
        await self.session.refresh(item)
        return item

    async def delete(self, item_id: int):
        item = await self.get(item_id)
        self.session.delete(item)
        await self.session.commit()