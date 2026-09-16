"""
Evidence Ledger API — ROI Claim Verification Endpoints
Authentication required on all endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import get_current_user
from src.core.tenant import get_hotel_id
from src.commercial.evidence_ledger.service import EvidenceLedgerService

router = APIRouter(prefix="/evidence", tags=["evidence_ledger"])


@router.post("/", summary="Record new evidence entry (L0-L4)")
def record_evidence(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Record ROI evidence. Level determines credibility:
    0=Internal 1=Measured 2=Operator 3=Customer 4=Financial
    Only L3+ counts as customer-verified ROI.
    """
    svc = EvidenceLedgerService(db=db, hotel_id=hotel_id)
    return svc.record_evidence(
        metric_name=payload.get("metric_name", ""),
        evidence_level=payload.get("evidence_level", 0),
        baseline_value=payload.get("baseline_value"),
        observed_value=payload.get("observed_value"),
        financial_value=payload.get("financial_value", 0.0),
        recommendation_id=payload.get("recommendation_id"),
        calculation_method=payload.get("calculation_method", ""),
        confidence=payload.get("confidence", "MEDIUM"),
        notes=payload.get("notes", ""),
        approved_by=getattr(current_user, "email", "unknown"),
    )


@router.get("/summary", summary="ROI summary by evidence level")
def get_evidence_summary(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Shows internal vs customer-verified ROI breakdown.
    RULE: Only L3+ is customer-verified. L0-2 = internal only.
    """
    svc = EvidenceLedgerService(db=db, hotel_id=hotel_id)
    return svc.get_evidence_summary()


@router.get("/verified-roi", summary="Customer-verified ROI only (L3+)")
def get_verified_roi(
    min_level: int = 3,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Returns ONLY customer-verified evidence (L3+).
    Safe for executive reports and customer presentations.
    """
    svc = EvidenceLedgerService(db=db, hotel_id=hotel_id)
    return svc.get_verified_roi(min_level=min_level)


@router.get("/", summary="List all evidence records")
def list_evidence(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """List evidence records for this hotel."""
    from sqlalchemy import text
    rows = db.execute(
        text("SELECT * FROM evidence_records WHERE hotel_id=:h ORDER BY created_at DESC LIMIT 50"),
        {"h": hotel_id}
    ).fetchall()
    return {
        "hotel_id": hotel_id,
        "count": len(rows),
        "records": [dict(r._mapping) for r in rows],
    }


@router.patch("/{evidence_id}/verify", summary="Upgrade evidence level")
def upgrade_evidence(
    evidence_id: str,
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Upgrade evidence level (e.g., from L1 system-measured to L3 customer-confirmed).
    Requires the customer or operator to explicitly confirm.
    """
    actor = getattr(current_user, "email", None) or getattr(current_user, "name", "unknown")
    svc = EvidenceLedgerService(db=db, hotel_id=hotel_id)
    return svc.upgrade_evidence_level(
        evidence_id=evidence_id,
        new_level=payload.get("new_level", 2),
        actor=actor,
        notes=payload.get("notes", ""),
    )
