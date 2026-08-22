"""
Demo Scenarios Router — Triangle Black Commercial v5.2
"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.demo_scenarios.service import DemoScenarioService

router = APIRouter(prefix="/demo", tags=["Demo Scenarios Sandbox"])

@router.get("/scenarios")
def list_scenarios_endpoint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns the catalog of 5 interactive demo scenarios."""
    service = DemoScenarioService(db=db, hotel_id=hotel_id)
    return service.list_available_scenarios()

@router.post("/trigger-scenario")
def trigger_scenario_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Executes a commercial demonstration scenario in real-time."""
    scenario_id = payload.get("scenario_id", "chiller_vibration")
    service = DemoScenarioService(db=db, hotel_id=hotel_id)
    return service.trigger_scenario(scenario_id)
