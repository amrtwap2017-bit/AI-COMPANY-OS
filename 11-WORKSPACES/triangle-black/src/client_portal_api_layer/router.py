"""Fallback router for: Client Portal API Layer"""
from fastapi import APIRouter

router = APIRouter(prefix="/client_portal_api_layer", tags=["client_portal_api_layer"])


@router.get("/health")
def health():
    return {"ok": True, "module": "client_portal_api_layer"}
