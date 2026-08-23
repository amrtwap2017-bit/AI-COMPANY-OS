"""
Enterprise Integrations Router — Triangle Black SaaS v5.5
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.integrations.service import IntegrationService

router = APIRouter(prefix="/integrations", tags=["Enterprise Integrations & Webhooks"])

@router.post("/webhooks/subscribe")
def create_webhook_subscription_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Registers a new outbound webhook endpoint with automated HMAC secret generation."""
    service = IntegrationService(db=db, hotel_id=hotel_id)
    result = service.create_subscription(payload)
    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Subscription failed"))
    return result

@router.get("/webhooks/subscriptions")
def list_webhook_subscriptions_endpoint(
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Lists all active webhook subscriptions for tenant."""
    service = IntegrationService(db=db, hotel_id=hotel_id)
    return {"subscriptions": service.list_subscriptions()}

@router.post("/webhooks/test-ping")
def test_ping_webhook_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Sends a mock test payload with valid HMAC-SHA256 signature."""
    secret = payload.get("secret_key", "tb_sec_test_secret_123")
    sample_payload = '{"event":"ping","hotel_id":"' + hotel_id + '","message":"Triangle Black Webhook Test"}'
    sig = IntegrationService.generate_hmac_signature(sample_payload, secret)
    return {
        "success": True,
        "signature": sig,
        "sample_payload": sample_payload,
        "status": "delivered_simulated"
    }

@router.post("/ingest/iot")
def ingest_iot_sensor_endpoint(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    hotel_id: str = Depends(get_hotel_id)
):
    """Inbound telemetry ingestion endpoint for IoT equipment sensors."""
    service = IntegrationService(db=db, hotel_id=hotel_id)
    return service.ingest_iot_telemetry(payload)
