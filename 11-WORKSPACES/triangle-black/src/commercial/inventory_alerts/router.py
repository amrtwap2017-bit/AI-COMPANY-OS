from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from .repository import InventoryAlertRepository
from .schemas import InventoryAlertCreate, InventoryAlertUpdate, InventoryAlertResponse

router = APIRouter()

@router.post('/alerts/', response_model=InventoryAlertResponse, status_code=201)
def create_alert(alert_data: InventoryAlertCreate, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    alert_repo = InventoryAlertRepository(db)
    return alert_repo.create_alert(alert_data.dict())

@router.get('/alerts/', response_model=list[InventoryAlertResponse])
def get_alerts(hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    alert_repo = InventoryAlertRepository(db)
    alerts = alert_repo.get_alerts()
    return [InventoryAlertResponse(**alert.__dict__) for alert in alerts]

@router.post('/alerts/{id}/acknowledge/', response_model=InventoryAlertResponse, status_code=201)
def acknowledge_alert(id: int, hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)):
    alert_repo = InventoryAlertRepository(db)
    alert = alert_repo.acknowledge_alert(id)
    if not alert:
        raise HTTPException(status_code=404, detail='Alert not found')
    return InventoryAlertResponse(**alert.__dict__)
