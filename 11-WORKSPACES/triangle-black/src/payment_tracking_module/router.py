"""Fallback router for: Payment Tracking Module"""
from fastapi import APIRouter

router = APIRouter(prefix="/payment_tracking_module", tags=["payment_tracking_module"])


@router.get("/health")
def health():
    return {"ok": True, "module": "payment_tracking_module"}
