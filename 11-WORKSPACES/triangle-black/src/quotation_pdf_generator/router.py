"""Fallback router for: Quotation PDF Generator"""
from fastapi import APIRouter

router = APIRouter(prefix="/quotation_pdf_generator", tags=["quotation_pdf_generator"])


@router.get("/health")
def health():
    return {"ok": True, "module": "quotation_pdf_generator"}
