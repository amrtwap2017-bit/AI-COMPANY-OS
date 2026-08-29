"""
Sprint 2 — Operational Report Router
GET /reports/operational-summary        → JSON summary
GET /reports/operational-summary/pdf    → PDF download
"""
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.reports.service import OperationalReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


def _svc(db: Session = Depends(get_db),
         hotel_id: str = Depends(get_hotel_id)) -> OperationalReportService:
    return OperationalReportService(db=db, hotel_id=hotel_id)


@router.get("/operational-summary")
def get_operational_summary(
    current_user=Depends(get_current_user),
    svc: OperationalReportService = Depends(_svc),
):
    """JSON operational summary — all KPIs in one response."""
    return svc.generate_summary_dict()


@router.get("/operational-summary/pdf")
def download_operational_summary_pdf(
    current_user=Depends(get_current_user),
    svc: OperationalReportService = Depends(_svc),
):
    """
    Download operational summary as PDF.
    Returns: application/pdf
    Content-Disposition: attachment; filename=TB-Operational-Report-YYYYMMDD.pdf
    """
    from datetime import datetime
    pdf_bytes = svc.generate_pdf()
    filename = f"TB-Operational-Report-{datetime.now().strftime('%Y%m%d')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
            "Cache-Control": "no-cache",
        }
    )
