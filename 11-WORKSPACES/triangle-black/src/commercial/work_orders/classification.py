"""
V10-DATA: Work Order Asset Linkage Classification Service
Provides non_asset_reason classification for WOs without asset links.
Supports: data quality improvement without fabricating asset relationships.
"""
from __future__ import annotations
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text


# Classification rules based on WO title/description patterns
FACILITY_WIDE_KEYWORDS = [
    "facility", "common area", "lobby", "corridor", "parking",
    "garden", "pool area", "general", "building", "exterior",
    "roof", "facade", "entrance", "exit", "hallway",
    "ground floor", "basement", "terrace", "reception",
    "restaurant", "kitchen", "laundry", "gym", "spa",
    "conference", "ballroom", "banquet", "beach", "marina",
    "landscape", "outdoor", "public area", "back of house",
    "fire escape", "staircase", "elevator shaft", "boiler room",
    "pump room", "electrical room", "generator room"
]

ADMINISTRATIVE_KEYWORDS = [
    "administrative", "admin", "policy", "procedure", "training",
    "inspection report", "audit", "compliance check", "review",
    "documentation", "meeting", "planning",
    "report", "update", "follow up", "follow-up", "coordination",
    "handover", "handoff", "sign off", "signoff", "close out",
    "warranty claim", "insurance", "certification", "permit",
    "license", "renewal", "register", "log entry", "record"
]

GENERAL_SERVICE_KEYWORDS = [
    "general maintenance", "routine check", "periodic",
    "service call", "follow up", "survey", "assessment",
    "deep clean", "pest control", "fumigation",
    "cleaning", "housekeeping", "janitorial", "sanitation",
    "waste disposal", "garbage", "trash", "recycling",
    "painting", "touch up", "touch-up", "refurbishment",
    "renovation", "upgrade", "modification", "installation",
    "commissioning", "decommissioning", "relocation",
    "inventory check", "stock count", "meter reading"
]


# V12: Hotel engineering equipment keywords — extracted from real WO data audit
EQUIPMENT_SPECIFIC_KEYWORDS = [
    # Chillers and HVAC
    "chiller", "ahu", "fcu", "hvac", "cooling tower", "condenser",
    "compressor", "refrigerant", "evaporator", "heat exchanger",
    "vrf", "split unit", "cassette", "fan coil",
    # Mechanical
    "bearing", "vibration", "shaft", "coupling", "seal", "gasket",
    "belt", "pulley", "gearbox", "motor", "pump", "impeller",
    "valve", "actuator", "damper",
    # Electrical
    "lv panel", "ups", "transformer", "switchgear", "breaker",
    "generator", "ats", "battery", "inverter",
    # Plumbing
    "boiler", "hot water", "cold water", "chilled water", "cooling water",
    "pressure vessel", "expansion tank", "water heater",
    # Fire & Safety
    "fire alarm", "fire pump", "sprinkler", "suppression", "smoke detector",
    "emergency", "exit light",
    # Elevators & Vertical
    "elevator", "lift", "escalator", "dumbwaiter",
    # BMS
    "bms", "scada", "controller", "sensor", "meter",
]

LOCATION_KEYWORDS = [
    # Room patterns
    "room", "suite", "floor", "tower", "wing", "block", "basement",
    "ground", "mezzanine", "roof", "plant room", "mechanical room",
    # Hotel-specific
    "lobby", "reception", "restaurant", "kitchen", "laundry",
    "gym", "spa", "pool", "ballroom", "conference", "parking",
]



class WOClassificationService:
    """
    Classify work orders that lack asset_id with appropriate non_asset_reason.
    
    Reasons:
    FACILITY_WIDE   - affects entire facility, no single asset
    LOCATION_ONLY   - specific location but no trackable asset  
    GENERAL         - general service, no asset applicable
    ADMINISTRATIVE  - administrative/documentation task
    NOT_APPLICABLE  - cannot determine (needs human review)
    ASSET_REQUIRED  - should have asset but doesn't (data gap)
    """

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def classify_unlinked_wos(self, limit: int = 100) -> Dict[str, Any]:
        """
        Classify work orders without asset_id.
        Returns classification suggestions for human review.
        """
        rows = self.db.execute(text("""
            SELECT id, title, description, type, site_id
            FROM work_orders
            WHERE hotel_id = :h
              AND asset_id IS NULL
              AND (non_asset_reason IS NULL OR non_asset_reason = '')
            ORDER BY created_at DESC
            LIMIT :limit
        """), {"h": self.hotel_id, "limit": limit}).fetchall()

        classified = []
        reason_counts: Dict[str, int] = {}

        for row in rows:
            d = dict(row._mapping)
            reason, confidence = self._classify(
                d.get("title", ""),
                d.get("description", ""),
                d.get("type", ""),
                d.get("site_id", "")
            )
            classified.append({
                "id": d["id"],
                "title": (d.get("title") or "")[:60],
                "type": d.get("type"),
                "suggested_reason": reason,
                "confidence": confidence,
                "action": "auto_apply" if confidence == "HIGH" else "needs_review"
            })
            reason_counts[reason] = reason_counts.get(reason, 0) + 1

        # Auto-apply HIGH confidence classifications
        auto_applied = 0
        for item in classified:
            if item["action"] == "auto_apply":
                try:
                    self.db.execute(text("""
                        UPDATE work_orders
                        SET non_asset_reason = :reason, updated_at = NOW()
                        WHERE id = :id AND hotel_id = :h
                    """), {
                        "reason": item["suggested_reason"],
                        "id": item["id"],
                        "h": self.hotel_id
                    })
                    auto_applied += 1
                except Exception:
                    pass

        try:
            self.db.commit()
        except Exception:
            self.db.rollback()

        # Get updated linkage stats
        stats = self._get_linkage_stats()

        return {
            "hotel_id": self.hotel_id,
            "classified": len(classified),
            "auto_applied": auto_applied,
            "needs_review": len([x for x in classified if x["action"] == "needs_review"]),
            "reason_distribution": reason_counts,
            "linkage_stats": stats,
            "suggestions": [x for x in classified if x["action"] == "needs_review"][:20]
        }

    def _classify(
        self,
        title: str,
        description: str,
        wo_type: str,
        location: str
    ):
        """Classify a single WO. Returns (reason, confidence)."""
        text_lower = (title + " " + (description or "") + " " + (location or "")).lower()

        # Service request type — should have asset (data gap)
        if wo_type == "service_request":
            return ("ASSET_REQUIRED", "MEDIUM")

        # Check facility-wide keywords
        if any(kw in text_lower for kw in FACILITY_WIDE_KEYWORDS):
            return ("FACILITY_WIDE", "HIGH")

        # Administrative
        if any(kw in text_lower for kw in ADMINISTRATIVE_KEYWORDS):
            return ("ADMINISTRATIVE", "HIGH")

        # General service
        if any(kw in text_lower for kw in GENERAL_SERVICE_KEYWORDS):
            return ("GENERAL", "HIGH")

        # Check equipment-specific keywords (HIGH confidence asset linkage needed)
        if any(kw in text_lower for kw in EQUIPMENT_SPECIFIC_KEYWORDS):
            return ("ASSET_REQUIRED", "HIGH")  # Should have asset — flag for linking
        
        # Check location keywords
        if any(kw in text_lower for kw in LOCATION_KEYWORDS):
            return ("LOCATION_ONLY", "HIGH")
        
        # Location-only (has location but no asset keyword)
        if location and len(location) > 3:
            return ("LOCATION_ONLY", "MEDIUM")

        # Cannot determine
        return ("NOT_APPLICABLE", "LOW")

    def _get_linkage_stats(self) -> Dict[str, Any]:
        """Get current WO→Asset linkage statistics."""
        try:
            total = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
            ), {"h": self.hotel_id}).scalar() or 0

            linked = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL"
            ), {"h": self.hotel_id}).scalar() or 0

            classified = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h "
                "AND asset_id IS NULL AND non_asset_reason IS NOT NULL"
            ), {"h": self.hotel_id}).scalar() or 0

            return {
                "total_wos": int(total),
                "asset_linked": int(linked),
                "non_asset_classified": int(classified),
                "unclassified": int(total - linked - classified),
                "asset_linkage_pct": round(linked / max(total, 1) * 100, 1),
                "total_classified_pct": round(
                    (linked + classified) / max(total, 1) * 100, 1
                )
            }
        except Exception:
            return {}

    def get_linkage_summary(self) -> Dict[str, Any]:
        """Full WO classification summary for pilot reporting."""
        stats = self._get_linkage_stats()

        # Get reason distribution
        try:
            reason_rows = self.db.execute(text("""
                SELECT non_asset_reason, COUNT(*) as cnt
                FROM work_orders
                WHERE hotel_id = :h AND non_asset_reason IS NOT NULL
                GROUP BY non_asset_reason
                ORDER BY cnt DESC
            """), {"h": self.hotel_id}).fetchall()
            reason_dist = {r[0]: r[1] for r in reason_rows}
        except Exception:
            reason_dist = {}

        return {
            "hotel_id": self.hotel_id,
            "linkage_stats": stats,
            "reason_distribution": reason_dist,
            "data_quality_note": (
                "IMPROVING" if stats.get("total_classified_pct", 0) > 50
                else "NEEDS_CLASSIFICATION"
            ),
            "action_needed": (
                f"{stats.get('unclassified', 0)} WOs need classification"
                if stats.get("unclassified", 0) > 0
                else "All WOs classified"
            )
        }
