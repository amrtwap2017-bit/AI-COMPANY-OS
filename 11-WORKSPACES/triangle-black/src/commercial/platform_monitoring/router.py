"""Platform Production Monitoring Router — Triangle Black Enterprise OS v6.0"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.platform_monitoring.service import PlatformMonitoringService

router = APIRouter(prefix="/platform-monitoring", tags=["Platform Production Monitoring"])

@router.get("/health")
def get_platform_health_report(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = PlatformMonitoringService(db=db, hotel_id=hotel_id)
    return service.get_platform_health_report()

@router.get("/db-health")
def get_database_health(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = PlatformMonitoringService(db=db, hotel_id=hotel_id)
    return service._get_db_health()

@router.get("/modules")
def get_module_status(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = PlatformMonitoringService(db=db, hotel_id=hotel_id)
    return {"modules": service._get_module_status()}

@router.get("/metrics")
def get_platform_metrics(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = PlatformMonitoringService(db=db, hotel_id=hotel_id)
    return service._get_platform_metrics()
