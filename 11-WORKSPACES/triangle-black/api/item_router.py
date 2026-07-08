from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from application.services.item_service import ItemService
from infrastructure.repositories.item_repository import get_item_repo
from domain.models import Item

router = APIRouter()

@router.post('/items/', response_model=Item)
async def create_item(item_data: dict, session: AsyncSession = Depends(get_item_repo)):
    item_service = ItemService(session)
    return await item_service.create_item(item_data)

@router.get('/items/{item_id}', response_model=Item)
async def get_item(item_id: int, session: AsyncSession = Depends(get_item_repo)):
    item_service = ItemService(session)
    item = await item_service.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    return item

@router.put('/items/{item_id}', response_model=Item)
async def update_item(item_id: int, item_data: dict, session: AsyncSession = Depends(get_item_repo)):
    item_service = ItemService(session)
    item = await item_service.update_item(item_id, item_data)
    if not item:
        raise HTTPException(status_code=404, detail='Item not found')
    return item

@router.delete('/items/{item_id}', status_code=204)
async def delete_item(item_id: int, session: AsyncSession = Depends(get_item_repo)):
    item_service = ItemService(session)
    await item_service.delete_item(item_id)