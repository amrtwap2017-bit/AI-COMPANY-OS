"""Fallback router for: Admin Portal Foundation"""
from fastapi import APIRouter

router = APIRouter(prefix="/admin_portal_foundation", tags=["admin_portal_foundation"])


@router.get("/health")
def health():
    return {"ok": True, "module": "admin_portal_foundation"}
