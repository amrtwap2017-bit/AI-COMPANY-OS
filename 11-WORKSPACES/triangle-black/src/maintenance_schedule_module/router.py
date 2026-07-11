"""Fallback router for: Maintenance Schedule Module"""
from fastapi import APIRouter

router = APIRouter(prefix="/maintenance_schedule_module", tags=["maintenance_schedule_module"])


@router.get("/health")
def health():
    return {"ok": True, "module": "maintenance_schedule_module"}
