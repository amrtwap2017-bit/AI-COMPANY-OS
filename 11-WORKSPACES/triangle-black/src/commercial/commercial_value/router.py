"""
Commercial Value Certification Router — Triangle Black Commercial v5.5
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.commercial_value.service import CommercialValueService

router = APIRouter(prefix="/commercial-value", tags=["Commercial Value & ROI"])

@router.get("/certification")
def get_commercial_value_certification_endpoint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns the formal quantified ROI and operational value certification report."""
    service = CommercialValueService(db=db, hotel_id=hotel_id)
    return service.get_value_certification_report()
