from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import require_manager
from .schemas import ExecutiveDashboardResponse
from .repository import get_dashboard_repo

router = APIRouter()

def get_dashboard_repo(db: Session = Depends(get_db), hotel_id: str = Depends(get_hotel_id)):
    return db.execute("SELECT COUNT(*) FROM leads WHERE hotel_id = :hotel_id", {'hotel_id': hotel_id}).scalar()

@router.get('/dashboard/executive', response_model=ExecutiveDashboardResponse)
def get_executive_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
    hotel_id: str = Query(None, description='Filter by hotel ID')
):
    query_params = {'hotel_id': hotel_id} if hotel_id else {}
    active_leads = db.execute("SELECT COUNT(*) FROM leads WHERE hotel_id = :hotel_id", query_params).scalar()
    quotes_pending_approval = db.execute("SELECT COUNT(*) FROM quotes WHERE hotel_id = :hotel_id AND status = 'pending'", query_params).scalar()
    active_contracts = db.execute("SELECT COUNT(*) FROM contracts WHERE hotel_id = :hotel_id AND status = 'active'", query_params).scalar()
    open_work_orders = db.execute("SELECT COUNT(*) FROM work_orders WHERE hotel_id = :hotel_id AND status = 'open'", query_params).scalar()
    overdue_invoices_count = db.execute("SELECT COUNT(*) FROM invoices WHERE hotel_id = :hotel_id AND due_date < NOW()", query_params).scalar()
    overdue_invoices_amount = db.execute("SELECT SUM(amount) FROM invoices WHERE hotel_id = :hotel_id AND due_date < NOW()", query_params).scalar()
    pending_purchase_orders = db.execute("SELECT COUNT(*) FROM purchase_orders WHERE hotel_id = :hotel_id AND status = 'pending'", query_params).scalar()
    low_stock_items = db.execute("SELECT COUNT(*) FROM inventory WHERE hotel_id = :hotel_id AND stock < 10", query_params).scalar()

    return ExecutiveDashboardResponse(
        active_leads=active_leads,
        quotes_pending_approval=quotes_pending_approval,
        active_contracts=active_contracts,
        open_work_orders=open_work_orders,
        overdue_invoices_count=overdue_invoices_count,
        overdue_invoices_amount=overdue_invoices_amount,
        pending_purchase_orders=pending_purchase_orders,
        low_stock_items=low_stock_items
    )