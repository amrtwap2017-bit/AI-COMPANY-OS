from src.commercial.auth.models import User

from datetime import datetime
from datetime import datetime
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import require_vendor
from .models import RFQ, PurchaseOrder
from .repository import RFQRepository, PurchaseOrderRepository
from .schemas import RFQCreate, RFQUpdate, RFQResponse, PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse

router = APIRouter()

@router.get('/rfqs', response_model=list[RFQResponse], status_code=200)
def list_rfqs_for_vendor(db: Session = Depends(get_db), _: User = Depends(require_vendor)):
    rfq_repo = RFQRepository(db)
    rfqs = rfq_repo.list_rfqs_for_vendor(_.id)
    return [RFQResponse.from_orm(rfq) for rfq in rfqs]

@router.post('/rfqs/{id}/quote', response_model=PurchaseOrderResponse, status_code=201)
def submit_quote(id: str, payload: PurchaseOrderCreate, db: Session = Depends(get_db), _: User = Depends(require_vendor)):
    po_repo = PurchaseOrderRepository(db)
    rfq = rfq_repo.get_rfq_by_id(id)
    if not rfq:
        raise HTTPException(status_code=404, detail='RFQ not found')
    purchase_order_data = payload.dict()
    purchase_order_data['hotel_id'] = rfq.hotel_id
    purchase_order_data['vendor_id'] = _.id
    purchase_order_data['rfq_id'] = id
    po = po_repo.create_purchase_order(purchase_order_data)
    return PurchaseOrderResponse.from_orm(po)

@router.get('/purchase-orders', response_model=list[PurchaseOrderResponse], status_code=200)
def list_poes_for_vendor(db: Session = Depends(get_db), _: User = Depends(require_vendor)):
    po_repo = PurchaseOrderRepository(db)
    pocs = po_repo.list_poes_for_vendor(_.id)
    return [PurchaseOrderResponse.from_orm(po) for po in pocs]

@router.patch('/purchase-orders/{id}/deliver', status_code=204)
def confirm_delivery(id: str, db: Session = Depends(get_db), _: User = Depends(require_vendor)):
    po_repo = PurchaseOrderRepository(db)
    po = po_repo.get_po_by_id(id)
    if not po:
        raise HTTPException(status_code=404, detail='Purchase Order not found')
    po.delivery_date = datetime.utcnow()
    db.commit()
