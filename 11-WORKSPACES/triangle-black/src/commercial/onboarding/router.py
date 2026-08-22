"""
Organization Onboarding Router — Triangle Black SaaS v5.2
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.commercial.onboarding.service import OrganizationProvisioningService

router = APIRouter(prefix="/onboarding", tags=["Onboarding & Provisioning"])

@router.post("/provision-property")
def provision_property_endpoint(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Self-service onboarding endpoint to provision an organization, site, admin, and workflows."""
    service = OrganizationProvisioningService(db=db)
    result = service.provision_property(payload)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Provisioning failed"))
    return result
