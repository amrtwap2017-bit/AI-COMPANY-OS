"""
Asset Intelligence Engine Router — Triangle Black A-015
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.asset_engine.service import AssetEngineService

router = APIRouter(
    prefix="/asset-engine",
    tags=["Asset Engine"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/summary", summary="Asset Portfolio Intelligence Summary")
def get_asset_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    return AssetEngineService(db=db, hotel_id=hotel_id).summary()

@router.get("/health-scores", summary="Per-Asset Health Scores")
def get_asset_health_scores(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=200),
):
    svc = AssetEngineService(db=db, hotel_id=hotel_id)
    scores = svc.health_scores(limit=limit)
    return {"hotel_id": hotel_id, "count": len(scores), "assets": scores}

@router.get("/by-category", summary="Asset Risk by Category")
def get_asset_by_category(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = AssetEngineService(db=db, hotel_id=hotel_id)
    cats = svc.by_category()
    return {"hotel_id": hotel_id, "count": len(cats), "categories": cats}

@router.get("/critical", summary="Critical Assets Requiring Attention")
def get_critical_assets(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = AssetEngineService(db=db, hotel_id=hotel_id)
    critical = svc.critical_assets()
    return {
        "hotel_id": hotel_id,
        "total_critical": len(critical),
        "assets": critical
    }
