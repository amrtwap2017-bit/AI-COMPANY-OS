from sqlalchemy.orm import Session
from src.core.database import get_db
from .models import RFQ, PurchaseOrder

class RFQRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_rfq(self, rfq_data: dict):
        rfq = RFQ(**rfq_data)
        self.db.add(rfq)
        self.db.commit()
        self.db.refresh(rfq)
        return rfq

    def get_rfq_by_id(self, rfq_id: str):
        return self.db.query(RFQ).filter(RFQ.id == rfq_id).first()

    def list_rfqs_for_vendor(self, vendor_id: str):
        return self.db.query(RFQ).filter(RFQ.vendor_id == vendor_id).all()

class PurchaseOrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_purchase_order(self, purchase_order_data: dict):
        po = PurchaseOrder(**purchase_order_data)
        self.db.add(po)
        self.db.commit()
        self.db.refresh(po)
        return po

    def get_po_by_id(self, po_id: str):
        return self.db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()

    def list_poes_for_vendor(self, vendor_id: str):
        return self.db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).all()
