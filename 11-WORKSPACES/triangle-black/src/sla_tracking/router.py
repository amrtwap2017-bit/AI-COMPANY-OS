"""Fallback router for: SLA Tracking"""
from fastapi import APIRouter

router = APIRouter(prefix="/sla_tracking", tags=["sla_tracking"])


@router.get("/health")
def health():
    return {"ok": True, "module": "sla_tracking"}
