"""
Enterprise SSO & SCIM 2.0 Router — Triangle Black SaaS v6.0
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.sso_scim.service import SSOSCIMService

router = APIRouter(prefix="/sso", tags=["Enterprise SSO & SCIM"])
scim_router = APIRouter(prefix="/scim/v2", tags=["SCIM 2.0 Identity Federation"])

# ── SSO Endpoints ────────────────────────────────────────────────────────────
@router.post("/config")
def set_sso_configuration_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SSOSCIMService(db=db, hotel_id=hotel_id)
    return service.configure_sso(payload)

@router.get("/config")
def get_sso_configuration_endpoint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SSOSCIMService(db=db, hotel_id=hotel_id)
    return service.get_sso_config()

# ── SCIM 2.0 Endpoints ───────────────────────────────────────────────────────
@scim_router.get("/Users")
def scim_list_users_endpoint(
    count: int = 50,
    startIndex: int = 1,
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SSOSCIMService(db=db, hotel_id=hotel_id)
    return service.scim_list_users(count=count, start_index=startIndex)

@scim_router.post("/Users", status_code=201)
def scim_create_user_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    service = SSOSCIMService(db=db, hotel_id=hotel_id)
    result = service.scim_create_user(payload)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
