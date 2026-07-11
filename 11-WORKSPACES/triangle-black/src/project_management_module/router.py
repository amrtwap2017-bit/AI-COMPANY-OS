"""Fallback router for: Project Management Module"""
from fastapi import APIRouter

router = APIRouter(prefix="/project_management_module", tags=["project_management_module"])


@router.get("/health")
def health():
    return {"ok": True, "module": "project_management_module"}
