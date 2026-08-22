"""
Organization Provisioning Service — Triangle Black SaaS v5.2
Handles atomic customer onboarding from company creation to user, site, and workflow initialization.
"""
import uuid
import re
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.auth import get_password_hash

class OrganizationProvisioningService:
    def __init__(self, db: Session):
        self.db = db

    def provision_property(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        company_name = payload.get("company_name", "Grand Hospitality Group")
        hotel_name = payload.get("hotel_name", "Sharm Resort & Spa")
        brand = payload.get("brand", "Luxury Collection")
        site_name = payload.get("site_name", "Main Resort Compound")
        admin_email = payload.get("admin_email", "manager@resort.com").lower().strip()
        admin_name = payload.get("admin_name", "Property General Manager")
        admin_password = payload.get("admin_password", "AdminPass123!")

        # Generate deterministic slug tenant ID
        slug = re.sub(r'[^a-zA-Z0-9]', '', hotel_name.lower())[:12]
        unique_suffix = str(uuid.uuid4())[:8]
        new_hotel_id = f"tb-hotel-{slug}-{unique_suffix}"
        new_site_id = f"site-{unique_suffix}"
        user_id = str(uuid.uuid4())

        try:
            # 1. Insert Hotel record
            self.db.execute(text(
                "INSERT INTO hotels (id, hotel_id, name, brand, is_active, created_at, updated_at) "
                "VALUES (:id, :hid, :name, :brand, true, NOW(), NOW())"
            ), {"id": new_hotel_id, "hid": new_hotel_id, "name": hotel_name, "brand": brand})

            # 2. Insert Site record
            self.db.execute(text(
                "INSERT INTO sites (id, hotel_id, name, location, is_active, created_at, updated_at) "
                "VALUES (:id, :hid, :name, :loc, true, NOW(), NOW())"
            ), {"id": new_site_id, "hid": new_hotel_id, "name": site_name, "loc": "South Sinai, Sharm El-Sheikh"})

            # 3. Create Admin User
            hashed_pw = get_password_hash(admin_password)
            self.db.execute(text(
                "INSERT INTO users (id, hotel_id, email, hashed_password, full_name, role, is_active, created_at) "
                "VALUES (:id, :hid, :email, :pw, :name, 'manager', true, NOW())"
            ), {"id": user_id, "hid": new_hotel_id, "email": admin_email, "pw": hashed_pw, "name": admin_name})

            # 4. Seed Standard Work Order Workflow Definition
            wf_id = str(uuid.uuid4())
            self.db.execute(text(
                "INSERT INTO workflow_definitions (id, hotel_id, entity_type, name, initial_state, states, is_active, created_at) "
                "VALUES (:id, :hid, 'work_order', 'Standard Maintenance Flow', 'open', "
                "'["open", "assigned", "in_progress", "completed", "closed"]', true, NOW())"
            ), {"id": wf_id, "hid": new_hotel_id})

            # 5. Log audit entry
            audit_id = str(uuid.uuid4())
            self.db.execute(text(
                "INSERT INTO platform_audit_log (id, hotel_id, entity_type, entity_id, action, actor, details, created_at) "
                "VALUES (:id, :hid, 'organization', :hid, 'ORGANIZATION_PROVISIONED', :actor, :details, NOW())"
            ), {
                "id": audit_id,
                "hid": new_hotel_id,
                "actor": admin_email,
                "details": f"Provisioned new hotel property: {hotel_name} ({company_name})"
            })

            self.db.commit()

            return {
                "success": True,
                "status": "provisioned",
                "hotel_id": new_hotel_id,
                "hotel_name": hotel_name,
                "site_id": new_site_id,
                "admin_email": admin_email,
                "audit_reference": audit_id,
                "ready_for_login": True
            }

        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "status": "error",
                "error": str(e),
                "hotel_id": new_hotel_id
            }
