"""Fallback router for: Service Request to Work Order Auto-Routing"""
from fastapi import APIRouter

router = APIRouter(prefix="/service_request_to_work_order_auto_routi", tags=["service_request_to_work_order_auto_routi"])


@router.get("/health")
def health():
    return {"ok": True, "module": "service_request_to_work_order_auto_routi"}


# V10-DATA: WO Asset Classification endpoints
@router.get("/classify-unlinked", summary="Classify WOs without asset linkage")
def classify_unlinked_wos(
    limit: int = 100,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V10-DATA: Classify work orders that lack asset_id.
    Auto-applies HIGH confidence classifications.
    Returns suggestions for MEDIUM/LOW confidence for human review.
    """
    from src.commercial.work_orders.classification import WOClassificationService
    svc = WOClassificationService(db=db, hotel_id=hotel_id)
    return svc.classify_unlinked_wos(limit=limit)


@router.get("/linkage-summary", summary="WO→Asset linkage summary")
def get_linkage_summary(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V10-DATA: Complete WO→Asset linkage summary.
    Shows: linked, non-asset-classified, unclassified counts and percentages.
    """
    from src.commercial.work_orders.classification import WOClassificationService
    svc = WOClassificationService(db=db, hotel_id=hotel_id)
    return svc.get_linkage_summary()

