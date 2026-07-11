from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from .repository import WorkOrderRepository
from .schemas import WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse

router = APIRouter()

@router.post('/', response_model=WorkOrderResponse, status_code=201)
def create_work_order(work_order_data: WorkOrderCreate, db: Session = Depends(get_db)):
    work_order_repo = WorkOrderRepository(db)
    return work_order_repo.create_work_order(work_order_data.dict())

@router.get('/', response_model=list[WorkOrderResponse])
def get_work_orders(db: Session = Depends(get_db)):
    work_order_repo = WorkOrderRepository(db)
    return work_order_repo.get_work_orders()

@router.get('/{work_order_id}', response_model=WorkOrderResponse)
def get_work_order_by_id(work_order_id: int, db: Session = Depends(get_db)):
    work_order_repo = WorkOrderRepository(db)
    work_order = work_order_repo.get_work_order_by_id(work_order_id)
    if not work_order:
        raise HTTPException(status_code=404, detail='Work Order not found')
    return work_order

@router.put('/{work_order_id}', response_model=WorkOrderResponse)
def update_work_order(work_order_id: int, work_order_data: WorkOrderUpdate, db: Session = Depends(get_db)):
    work_order_repo = WorkOrderRepository(db)
    updated_work_order = work_order_repo.update_work_order(work_order_id, work_order_data.dict())
    if not updated_work_order:
        raise HTTPException(status_code=404, detail='Work Order not found')
    return updated_work_order

@router.delete('/{work_order_id}', status_code=204)
def delete_work_order(work_order_id: int, db: Session = Depends(get_db)):
    work_order_repo = WorkOrderRepository(db)
    deleted_work_order = work_order_repo.delete_work_order(work_order_id)
    if not deleted_work_order:
        raise HTTPException(status_code=404, detail='Work Order not found')