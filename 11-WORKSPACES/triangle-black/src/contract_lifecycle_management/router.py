"""Fallback router for: Contract Lifecycle Management"""
from fastapi import APIRouter

router = APIRouter(prefix="/contract_lifecycle_management", tags=["contract_lifecycle_management"])


@router.get("/health")
def health():
    return {"ok": True, "module": "contract_lifecycle_management"}
