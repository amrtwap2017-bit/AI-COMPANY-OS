"""
Enterprise Integrations & Webhooks Service — Triangle Black SaaS v5.5
Manages HMAC-signed outbound webhook event dispatching and inbound IoT telemetry ingestion.
"""
import hmac
import hashlib
import json
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class IntegrationService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def create_subscription(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        sub_id = f"wh-{uuid.uuid4().hex[:10]}"
        target_url = payload.get("target_url", "").strip()
        event_types = payload.get("event_types", ["work_order.created", "sla.breached"])
        events_str = json.dumps(event_types)
        secret_key = f"tb_sec_{uuid.uuid4().hex}"

        try:
            self.db.execute(text(
                "INSERT INTO webhook_subscriptions (id, hotel_id, target_url, event_types, secret_key, status, created_at, updated_at) "
                "VALUES (:id, :hid, :url, :events, :sec, 'active', NOW(), NOW())"
            ), {
                "id": sub_id,
                "hid": self.hotel_id,
                "url": target_url,
                "events": events_str,
                "sec": secret_key
            })
            self.db.commit()

            return {
                "success": True,
                "subscription_id": sub_id,
                "target_url": target_url,
                "event_types": event_types,
                "secret_key": secret_key,
                "status": "active"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}

    def list_subscriptions(self) -> List[Dict[str, Any]]:
        rows = self.db.execute(text(
            "SELECT id, target_url, event_types, secret_key, status, created_at FROM webhook_subscriptions "
            "WHERE hotel_id = :h ORDER BY created_at DESC"
        ), {"h": self.hotel_id}).mappings().all()

        results = []
        for r in rows:
            events = json.loads(r["event_types"]) if r["event_types"] else []
            results.append({
                "id": r["id"],
                "target_url": r["target_url"],
                "event_types": events,
                "secret_key_masked": f"{r['secret_key'][:8]}...",
                "status": r["status"],
                "created_at": str(r["created_at"])
            })
        return results

    @staticmethod
    def generate_hmac_signature(payload_json: str, secret_key: str) -> str:
        """Generates HMAC-SHA256 signature for outbound webhook verification."""
        return hmac.new(
            secret_key.encode("utf-8"),
            payload_json.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def ingest_iot_telemetry(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Ingests live sensor data and triggers anomaly checks."""
        asset_id = payload.get("asset_id", "ast-chiller-01")
        vibration_rms = float(payload.get("vibration_rms", 1.2))
        temperature_c = float(payload.get("temperature_c", 65.0))
        runtime_hours = float(payload.get("runtime_hours", 2400.0))

        anomaly_detected = vibration_rms > 4.5 or temperature_c > 85.0
        audit_id = str(uuid.uuid4())

        if anomaly_detected:
            try:
                self.db.execute(text(
                    "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor_name, new_value, created_at) "
                    "VALUES (:id, :hid, 'asset', :aid, 'IOT_ANOMALY_TRIGGERED', 'iot_sensor_gateway', :val, NOW())"
                ), {
                    "id": audit_id,
                    "hid": self.hotel_id,
                    "aid": asset_id,
                    "val": f"Acoustic vibration spike: {vibration_rms} mm/s (Threshold: 4.5 mm/s)"
                })
                self.db.commit()
            except Exception:
                self.db.rollback()

        return {
            "success": True,
            "asset_id": asset_id,
            "vibration_rms": vibration_rms,
            "temperature_c": temperature_c,
            "anomaly_detected": anomaly_detected,
            "action_queued": "DISPATCH_AI_DIRECTOR" if anomaly_detected else "NONE"
        }
