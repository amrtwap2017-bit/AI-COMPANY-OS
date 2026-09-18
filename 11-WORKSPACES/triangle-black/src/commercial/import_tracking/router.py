"""Import Batch Tracking Router — V15 P1."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user  # ALWAYS import

router = APIRouter(prefix="/import-tracking", tags=["import_tracking"])


@router.get("/history", summary="List import batches")
def list_import_batches(
    entity_type: str = None,
    limit: int = 20,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """List recent import operations for this hotel."""
    from src.commercial.import_tracking.service import ImportBatchService
    svc = ImportBatchService(db=db, hotel_id=hotel_id)
    batches = svc.list_batches(entity_type=entity_type, limit=limit)
    return {
        "hotel_id": hotel_id,
        "count": len(batches),
        "batches": batches,
    }


@router.get("/history/{batch_id}", summary="Get batch details")
def get_batch(
    batch_id: str,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Get details of a specific import batch."""
    from sqlalchemy import text
    row = db.execute(text("""
        SELECT * FROM import_batches WHERE id = :id AND hotel_id = :h
    """), {"id": batch_id, "h": hotel_id}).fetchone()

    if not row:
        from fastapi import HTTPException
        raise HTTPException(404, "Import batch not found")
    return dict(row._mapping)


@router.post("/rollback/{batch_id}", summary="Invalidate import batch")
def rollback_batch(
    batch_id: str,
    payload: dict = None,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Mark a batch as rolled back.
    Note: Records remain in DB — this flags the batch as invalid.
    """
    from src.commercial.import_tracking.service import ImportBatchService
    svc = ImportBatchService(db=db, hotel_id=hotel_id)
    reason = (payload or {}).get("reason", "Manual rollback")
    actor = getattr(current_user, "email", str(current_user))
    return svc.invalidate_batch(batch_id, reason=f"{reason} (by {actor})")


@router.post("/check-duplicate", summary="Check if file was already imported")
def check_duplicate(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Check if file content was already imported.
    Send: {csv_content: '...', entity_type: 'assets'}
    Returns: {duplicate: bool, batch_id?, message?}
    """
    from src.commercial.import_tracking.service import ImportBatchService
    csv_content = payload.get("csv_content", "")
    entity_type = payload.get("entity_type", "unknown")

    if not csv_content:
        return {"duplicate": False, "message": "No content provided"}

    svc = ImportBatchService(db=db, hotel_id=hotel_id)
    file_hash = svc.compute_file_hash(csv_content)
    result = svc.check_duplicate(file_hash, entity_type)
    return result or {"duplicate": False, "file_hash": file_hash}
