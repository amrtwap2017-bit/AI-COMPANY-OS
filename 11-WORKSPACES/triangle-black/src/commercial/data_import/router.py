"""
Data Import Router — Triangle Black SaaS v5.2
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.data_import.service import DataImportService

router = APIRouter(prefix="/data-import", tags=["Data Import Engine"])

@router.post("/assets")
def import_assets_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Accepts raw CSV content string, validates, and imports assets atomically."""
    csv_content = payload.get("csv_content", "")
    if not csv_content:
        raise HTTPException(status_code=400, detail="csv_content payload is required")
    
    service = DataImportService(db=db)
    result = service.import_assets_csv(hotel_id=hotel_id, csv_content=csv_content)
    return result
