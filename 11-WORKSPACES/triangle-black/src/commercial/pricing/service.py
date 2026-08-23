"""
Pricing & Entitlement Service — Triangle Black SaaS v5.4
Manages commercial tiers, feature entitlements, and tenant quota limits.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.cache import cache_get, cache_set, make_cache_key

class PricingPlanService:
    def __init__(self, db: Session, hotel_id: str = "tb-default-hotel-000000000001"):
        self.db = db
        self.hotel_id = hotel_id

    @staticmethod
    def get_plans_matrix() -> List[Dict[str, Any]]:
        return [
            {
                "id": "foundation",
                "name": "Foundation Operations",
                "tagline": "Core CMMS and asset tracking for single-property engineering teams.",
                "monthly_price_usd": 499,
                "annual_price_usd": 399,
                "badge": "Standard",
                "limits": {
                    "max_assets": 150,
                    "max_sites": 1,
                    "max_users": 10,
                    "data_retention_months": 12
                },
                "features": [
                    "Asset Registry & QR Mobile Scanning",
                    "Reactive & Preventative Work Orders",
                    "Technician Mobile Dispatch (PWA)",
                    "Basic Inventory & Spare Parts Log",
                    "Standard Email SLA Breach Alerts"
                ]
            },
            {
                "id": "intelligence",
                "name": "Operational Intelligence",
                "tagline": "AI predictive maintenance & financial leakage governance for luxury resorts.",
                "monthly_price_usd": 1299,
                "annual_price_usd": 999,
                "badge": "Most Popular",
                "is_featured": True,
                "limits": {
                    "max_assets": 500,
                    "max_sites": 3,
                    "max_users": 35,
                    "data_retention_months": 36
                },
                "features": [
                    "All Foundation Features Included",
                    "5-Pillar Operational Intelligence Dashboard",
                    "Governed AI Maintenance Director (Vibration & Failure Triage)",
                    "Procurement Spend Leakage & Supplier Scorecards",
                    "Sub-300ms Executive Read Models & Telemetry",
                    "Multi-tier Workflow Approval Policies"
                ]
            },
            {
                "id": "enterprise",
                "name": "Enterprise Cluster",
                "tagline": "Multi-property portfolio governance and real-time Digital Twin projection.",
                "monthly_price_usd": 2999,
                "annual_price_usd": 2499,
                "badge": "Full Capability",
                "limits": {
                    "max_assets": 2500,
                    "max_sites": 15,
                    "max_users": 150,
                    "data_retention_months": 120
                },
                "features": [
                    "All Intelligence Features Included",
                    "Digital Twin 2.0 Semantic Graph & Failure Impact Traversal",
                    "Custom Multi-Stage Workflow State Machines",
                    "Multi-Organization Self-Service Provisioning",
                    "Dedicated SRE Account Manager & 99.9% Uptime SLA",
                    "Custom ERP/PMS Webhook Integration Connectors"
                ]
            }
        ]

    def get_tenant_entitlements(self) -> Dict[str, Any]:
        cache_key = make_cache_key("tenant_entitlements", self.hotel_id)
        cached = cache_get(cache_key)
        if cached:
            return cached

        try:
            asset_count = self.db.execute(text(
                "SELECT COUNT(*) FROM assets WHERE hotel_id = :h AND deleted_at IS NULL"
            ), {"h": self.hotel_id}).scalar() or 0
            
            user_count = self.db.execute(text(
                "SELECT COUNT(*) FROM users WHERE hotel_id = :h"
            ), {"h": self.hotel_id}).scalar() or 1
        except Exception:
            asset_count, user_count = 15, 3

        result = {
            "hotel_id": self.hotel_id,
            "active_plan": "intelligence",
            "tier_name": "Operational Intelligence",
            "status": "active",
            "usage": {
                "assets_used": asset_count,
                "assets_limit": 500,
                "users_active": user_count,
                "users_limit": 35
            },
            "enabled_features": [
                "ai_maintenance_director",
                "operational_intelligence_5_pillars",
                "executive_dashboard_read_models",
                "telemetry_stream",
                "multi_tier_workflow_approvals"
            ]
        }

        cache_set(cache_key, result, ttl=60)
        return result
