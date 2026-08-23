"""
Pricing & Entitlement Router — Triangle Black SaaS v5.4
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.pricing.service import PricingPlanService

router = APIRouter(prefix="/plans", tags=["SaaS Pricing & Entitlements"])

@router.get("/matrix")
def get_plans_matrix_endpoint():
    """Public endpoint returning all commercial packaging tiers and feature lists."""
    return {"plans": PricingPlanService.get_plans_matrix()}

@router.get("/my-entitlements")
def get_tenant_entitlements_endpoint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Returns active subscription tier, limits, and feature permissions for tenant."""
    service = PricingPlanService(db=db, hotel_id=hotel_id)
    return service.get_tenant_entitlements()
