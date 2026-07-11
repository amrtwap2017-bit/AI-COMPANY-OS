from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from .repository import ExecutiveDashboardRepository
from .schemas import ExecutiveDashboardResponse

router = APIRouter()

@router.get('/executive', response_model=ExecutiveDashboardResponse)
def get_executive_dashboard(db: Session = Depends(get_db)):
    repository = ExecutiveDashboardRepository(db)
    dashboard = repository.get_executive_dashboard()
    return dashboard