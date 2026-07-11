"""Fallback router for: Analytics API"""
from fastapi import APIRouter

router = APIRouter(prefix="/analytics_api", tags=["analytics_api"])


@router.get("/health")
def health():
    return {"ok": True, "module": "analytics_api"}
