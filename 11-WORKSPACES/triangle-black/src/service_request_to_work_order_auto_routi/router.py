"""Fallback router for: Service Request to Work Order Auto-Routing"""
from fastapi import APIRouter

router = APIRouter(prefix="/service_request_to_work_order_auto_routi", tags=["service_request_to_work_order_auto_routi"])


@router.get("/health")
def health():
    return {"ok": True, "module": "service_request_to_work_order_auto_routi"}
