from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import WorkOrder

class WorkOrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_work_order(self, work_order_data: dict):
        work_order = WorkOrder(**work_order_data)
        self.db.add(work_order)
        self.db.commit()
        self.db.refresh(work_order)
        return work_order

    def get_work_orders(self):
        return self.db.query(WorkOrder).all()

    def get_work_order_by_id(self, work_order_id: int):
        return self.db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()

    def update_work_order(self, work_order_id: int, work_order_data: dict):
        work_order = self.get_work_order_by_id(work_order_id)
        if not work_order:
            return None
        for key, value in work_order_data.items():
            setattr(work_order, key, value)
        self.db.commit()
        self.db.refresh(work_order)
        return work_order

    def delete_work_order(self, work_order_id: int):
        work_order = self.get_work_order_by_id(work_order_id)
        if not work_order:
            return None
        self.db.delete(work_order)
        self.db.commit()