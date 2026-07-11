"""Fallback router for: Mobile API for Field Technicians"""
from fastapi import APIRouter

router = APIRouter(prefix="/mobile_api_for_field_technicians", tags=["mobile_api_for_field_technicians"])


@router.get("/health")
def health():
    return {"ok": True, "module": "mobile_api_for_field_technicians"}
