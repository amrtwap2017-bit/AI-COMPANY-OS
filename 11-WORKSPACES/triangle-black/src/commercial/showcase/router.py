"""
Golden Thread Showcase Router — Triangle Black Commercial Showcase v5.2
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.showcase.service import GoldenThreadTraceService

router = APIRouter(prefix="/showcase", tags=["Showcase"])

@router.get("/trace/{work_order_id}")
def get_golden_thread_trace(
    work_order_id: str,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns the complete 8-stage operational golden thread for a work order."""
    service = GoldenThreadTraceService(db=db, hotel_id=hotel_id)
    return service.get_lifecycle_trace(work_order_id)
