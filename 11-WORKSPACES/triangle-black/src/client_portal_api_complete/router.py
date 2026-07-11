"""Fallback router for: Client Portal API Complete"""
from fastapi import APIRouter

router = APIRouter(prefix="/client_portal_api_complete", tags=["client_portal_api_complete"])


@router.get("/health")
def health():
    return {"ok": True, "module": "client_portal_api_complete"}
