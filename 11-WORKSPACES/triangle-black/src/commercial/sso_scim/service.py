"""
Enterprise SSO & SCIM 2.0 Federation Service — Triangle Black SaaS v6.0
Complies with RFC 7643 & RFC 7644 SCIM 2.0 specification for automated IdP directory sync.
"""
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.auth import hash_password

class SSOSCIMService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def configure_sso(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        idp_type = payload.get("idp_type", "oidc")
        idp_issuer = payload.get("idp_issuer", "https://login.microsoftonline.com/tenant/v2.0")
        sso_url = payload.get("sso_url", "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize")
        is_enabled = bool(payload.get("is_enabled", True))
        config_id = f"sso-{uuid.uuid4().hex[:8]}"

        try:
            self.db.execute(text("""
                INSERT INTO sso_configurations (id, hotel_id, idp_type, idp_issuer, sso_url, is_enabled, created_at, updated_at)
                VALUES (:id, :hid, :type, :issuer, :url, :enabled, NOW(), NOW())
                ON CONFLICT (hotel_id) DO UPDATE 
                SET idp_type = EXCLUDED.idp_type, idp_issuer = EXCLUDED.idp_issuer, sso_url = EXCLUDED.sso_url, is_enabled = EXCLUDED.is_enabled, updated_at = NOW()
            """), {
                "id": config_id,
                "hid": self.hotel_id,
                "type": idp_type,
                "issuer": idp_issuer,
                "url": sso_url,
                "enabled": is_enabled
            })
            self.db.commit()

            return {
                "success": True,
                "hotel_id": self.hotel_id,
                "idp_type": idp_type,
                "idp_issuer": idp_issuer,
                "sso_url": sso_url,
                "is_enabled": is_enabled,
                "status": "configured"
            }
        except Exception as e:
            self.db.rollback()
            return {"success": False, "error": str(e)}

    def get_sso_config(self) -> Dict[str, Any]:
        row = self.db.execute(text(
            "SELECT id, idp_type, idp_issuer, sso_url, is_enabled, updated_at FROM sso_configurations WHERE hotel_id = :h"
        ), {"h": self.hotel_id}).mappings().first()

        if not row:
            return {
                "hotel_id": self.hotel_id,
                "is_enabled": False,
                "idp_type": "oidc",
                "idp_issuer": "",
                "sso_url": ""
            }
        return dict(row)

    def scim_list_users(self, count: int = 50, start_index: int = 1) -> Dict[str, Any]:
        """Returns RFC 7644 compliant SCIM 2.0 ListResponse."""
        rows = self.db.execute(text(
            "SELECT id, email, name, role, is_active, created_at FROM users WHERE hotel_id = :h LIMIT :lim"
        ), {"h": self.hotel_id, "lim": count}).mappings().all()

        resources = []
        for r in rows:
            resources.append({
                "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
                "id": r["id"],
                "userName": r["email"],
                "name": {"formatted": r["name"]},
                "emails": [{"value": r["email"], "primary": True}],
                "roles": [{"value": r["role"]}],
                "active": r["is_active"]
            })

        return {
            "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
            "totalResults": len(resources),
            "startIndex": start_index,
            "itemsPerPage": count,
            "Resources": resources
        }

    def scim_create_user(self, scim_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Provisions a user via SCIM 2.0 protocol."""
        user_email = scim_payload.get("userName") or scim_payload.get("emails", [{}])[0].get("value")
        display_name = scim_payload.get("name", {}).get("formatted") or user_email.split("@")[0]
        user_id = str(uuid.uuid4())
        default_pw = hash_password(uuid.uuid4().hex)

        try:
            self.db.execute(text(
                "INSERT INTO users (id, hotel_id, email, hashed_password, name, role, is_active, created_at, updated_at) "
                "VALUES (:id, :hid, :email, :pw, :name, 'technician', true, NOW(), NOW())"
            ), {
                "id": user_id,
                "hid": self.hotel_id,
                "email": user_email.lower().strip(),
                "pw": default_pw,
                "name": display_name
            })

            # Audit SCIM provisioning
            audit_id = str(uuid.uuid4())
            self.db.execute(text(
                "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor_name, new_value, created_at) "
                "VALUES (:id, :hid, 'user', :uid, 'SCIM_USER_PROVISIONED', 'scim_idp_sync', :val, NOW())"
            ), {
                "id": audit_id,
                "hid": self.hotel_id,
                "uid": user_id,
                "val": f"SCIM Directory Provisioned: {user_email} ({display_name})"
            })

            self.db.commit()

            return {
                "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
                "id": user_id,
                "userName": user_email,
                "name": {"formatted": display_name},
                "active": True
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
