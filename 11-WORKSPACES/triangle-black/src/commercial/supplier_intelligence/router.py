"""Supplier Intelligence Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.supplier_intelligence.service import SupplierIntelligenceService

router = APIRouter(prefix="/supplier-intelligence", tags=["Supplier Intelligence"])

@router.get("/report")
def get_procurement_intelligence_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SupplierIntelligenceService(db=db, hotel_id=hotel_id)
    return service.get_procurement_intelligence_report()

@router.get("/scorecards")
def get_vendor_scorecards(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SupplierIntelligenceService(db=db, hotel_id=hotel_id)
    return {"scorecards": service._get_vendor_scorecards()}

@router.get("/savings-opportunities")
def get_savings_opportunities(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SupplierIntelligenceService(db=db, hotel_id=hotel_id)
    return {"opportunities": service._get_savings_opportunities()}

@router.get("/risk")
def get_procurement_risk(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SupplierIntelligenceService(db=db, hotel_id=hotel_id)
    return service._get_procurement_risk()
