"""
Supplier Engine Router — Triangle Black A-006
NEW endpoints complementing existing supplier_intelligence.

Does NOT duplicate:
- /api/v1/supplier-intelligence/* (all 4 already 200)
- /api/v1/suppliers-v2/* (performance, top-spend)

NEW:
  GET /api/v1/supplier-engine/summary        → Executive overview
  GET /api/v1/supplier-engine/scores         → Per-supplier performance scores
  GET /api/v1/supplier-engine/concentration  → Concentration risk %
  GET /api/v1/supplier-engine/recommendations → Prefer/Avoid/Monitor
  GET /api/v1/supplier-engine/diversity      → Category diversity
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.core.auth import get_current_user
from src.commercial.supplier_engine.service import SupplierEngineService

router = APIRouter(
    prefix="/supplier-engine",
    tags=["Supplier Engine"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/summary", summary="Executive Supplier Intelligence Summary")
def get_supplier_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SupplierEngineService(db=db, hotel_id=hotel_id)
    return svc.executive_summary()


@router.get("/scores", summary="Per-Supplier Performance Scores")
def get_supplier_scores(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=200),
):
    svc = SupplierEngineService(db=db, hotel_id=hotel_id)
    scores = svc.performance_scores(limit=limit)
    return {"hotel_id": hotel_id, "count": len(scores), "suppliers": scores}


@router.get("/concentration", summary="Supplier Concentration Risk")
def get_concentration_risk(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SupplierEngineService(db=db, hotel_id=hotel_id)
    return svc.concentration_risk()


@router.get("/recommendations", summary="Prefer/Avoid/Monitor Recommendations")
def get_recommendations(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SupplierEngineService(db=db, hotel_id=hotel_id)
    return svc.recommendations()


@router.get("/diversity", summary="Supplier Category Diversity")
def get_category_diversity(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    svc = SupplierEngineService(db=db, hotel_id=hotel_id)
    return svc.category_diversity()
