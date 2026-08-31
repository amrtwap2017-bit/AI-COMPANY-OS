"""
AI Predictive Failure Forecaster Router — Triangle Black Enterprise OS v6.0
Standalone router at /predictive prefix (separate from existing predictive_maintenance router).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id

from src.core.auth import get_current_user as _gcu_v7
from fastapi import Depends as _Dep_v7
router = APIRouter(prefix="/predictive", tags=["AI Predictive Failure Forecasting"], dependencies=[_Dep_v7(_gcu_v7)])


@router.get("/forecast")
def forecast_asset_failures_endpoint(
    horizon_days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Forecasts asset failure probabilities within the specified horizon using heuristic model."""
    from src.commercial.predictive_maintenance.forecaster import PredictiveFailureService
    service = PredictiveFailureService(db=db, hotel_id=hotel_id)
    return {"forecasts": service.forecast_asset_failures(horizon_days=horizon_days)}


@router.get("/anomalies")
def detect_asset_anomalies_endpoint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Detects statistical anomalies in asset operational telemetry."""
    from src.commercial.predictive_maintenance.forecaster import PredictiveFailureService
    service = PredictiveFailureService(db=db, hotel_id=hotel_id)
    return {"anomalies": service.detect_anomalies()}
