"""Fallback router for: Vendor Portal API"""
from fastapi import APIRouter

router = APIRouter(prefix="/vendor_portal_api", tags=["vendor_portal_api"])


@router.get("/health")
def health():
    return {"ok": True, "module": "vendor_portal_api"}
