"""
V6-E04 — ROI Measurement Router
POST /roi/snapshot  — capture current KPI baseline
GET  /roi/snapshots — list captured snapshots
GET  /roi/delta     — before/after comparison
GET  /roi/report    — full ROI report
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.roi.service import ROIService

router = APIRouter(prefix="/roi", tags=["ROI Measurement"])


def _svc(db: Session = Depends(get_db),
         hotel_id: str = Depends(get_hotel_id)) -> ROIService:
    return ROIService(db=db, hotel_id=hotel_id)


@router.post("/snapshot")
def capture_roi_snapshot(
    payload: dict = None,
    current_user=Depends(get_current_user),
    service: ROIService = Depends(_svc),
):
    """
    Capture current KPI state as a snapshot.
    Call BEFORE an intervention to establish baseline.
    Call AFTER to measure improvement.
    label: 'before_intervention' | 'after_intervention' | 'monthly' | custom
    """
    payload = payload or {}
    label = payload.get("label", "manual")
    period = payload.get("period", "current")
    return service.capture_snapshot(label=label, period=period)


@router.get("/snapshots")
def list_roi_snapshots(
    limit: int = Query(default=20, ge=1, le=100),
    current_user=Depends(get_current_user),
    service: ROIService = Depends(_svc),
):
    """List all captured KPI snapshots for this hotel, newest first."""
    return service.list_snapshots(limit=limit)


@router.get("/delta")
def get_roi_delta(
    current_user=Depends(get_current_user),
    service: ROIService = Depends(_svc),
):
    """
    Compare the two most recent snapshots.
    Shows: before KPIs, after KPIs, delta per KPI, improvement rate.
    Capture at least 2 snapshots (before + after) to see delta.
    """
    return service.compute_delta()


@router.get("/report")
def get_roi_report(
    current_user=Depends(get_current_user),
    service: ROIService = Depends(_svc),
):
    """
    Full ROI measurement report.
    Includes: current performance, improvement potential,
    cost avoidance estimate, delta analysis, and recommendations.
    """
    return service.get_roi_report()
