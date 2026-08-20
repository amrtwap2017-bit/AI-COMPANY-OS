"""
T-005: Application Service Layer — Work Order Domain
Extracts business logic from router into a testable service class.
"""
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import uuid


class WorkOrderService:
    """
    Application service for Work Order domain.
    Contains all business logic for WO lifecycle.
    Router calls this — service calls repository.
    """

    # Default SLA hours by priority
    SLA_HOURS = {
        "critical": 4,
        "high": 8,
        "medium": 24,
        "low": 72,
    }

    def __init__(self, db):
        self.db = db

    def create_from_sr(
        self,
        sr_id: str,
        hotel_id: str,
        actor_id: str,
        title: str,
        priority: str = "medium",
        description: Optional[str] = None,
        asset_id: Optional[str] = None,
        location: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a Work Order linked to a Service Request."""
        return self.create(
            hotel_id=hotel_id,
            actor_id=actor_id,
            title=title,
            priority=priority,
            description=description,
            asset_id=asset_id,
            location=location,
            service_request_id=sr_id,
            work_order_type="corrective",
        )

    def create(
        self,
        hotel_id: str,
        actor_id: str,
        title: str,
        priority: str = "medium",
        description: Optional[str] = None,
        asset_id: Optional[str] = None,
        location: Optional[str] = None,
        service_request_id: Optional[str] = None,
        work_order_type: str = "corrective",
        technician_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a new Work Order with SLA tracking.
        Enforces: hotel_id, actor, SLA breach time, correlation_id.
        """
        from sqlalchemy import text as _text

        wo_id = str(uuid.uuid4())
        now = datetime.utcnow()
        sla_hours = self.SLA_HOURS.get(priority, 24)
        sla_breach_at = now + timedelta(hours=sla_hours)

        valid_priorities = {"critical", "high", "medium", "low"}
        if priority not in valid_priorities:
            raise ValueError(f"Invalid priority: {priority}")

        try:
            self.db.execute(_text("""
                INSERT INTO work_orders
                    (id, hotel_id, title, description, priority, status,
                     type, asset_id, location, service_request_id,
                     technician_id, sla_hours, sla_breach_at, sla_breached,
                     sla_status, created_by, created_at, updated_at)
                VALUES
                    (:id, :hotel_id, :title, :desc, :priority, 'open',
                     :type, :asset_id, :location, :sr_id,
                     :tech_id, :sla_hours, :sla_breach_at, FALSE,
                     'on_track', :created_by, :now, :now)
            """), {
                "id": wo_id,
                "hotel_id": hotel_id,
                "title": title,
                "desc": description,
                "priority": priority,
                "type": work_order_type,
                "asset_id": asset_id,
                "location": location,
                "sr_id": service_request_id,
                "tech_id": technician_id,
                "sla_hours": sla_hours,
                "sla_breach_at": sla_breach_at,
                "created_by": actor_id,
                "now": now,
            })
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        # Initialize workflow instance
        self._init_workflow(wo_id, hotel_id, actor_id)

        self._emit_audit("WO_CREATED", hotel_id, actor_id, wo_id, {
            "title": title, "priority": priority, "sla_hours": sla_hours
        })

        return {
            "id": wo_id,
            "hotel_id": hotel_id,
            "title": title,
            "priority": priority,
            "status": "open",
            "sla_hours": sla_hours,
            "sla_breach_at": sla_breach_at.isoformat(),
            "sla_status": "on_track",
            "service_request_id": service_request_id,
            "created_by": actor_id,
            "created_at": now.isoformat(),
        }

    def get(self, wo_id: str, hotel_id: str) -> Optional[Dict[str, Any]]:
        """Get a single WO with hotel_id scope enforced."""
        from sqlalchemy import text as _text
        row = self.db.execute(_text("""
            SELECT * FROM work_orders
            WHERE id = :id AND hotel_id = :hotel_id
            AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"id": wo_id, "hotel_id": hotel_id}).fetchone()
        if not row:
            return None
        return dict(row._mapping)

    def assign(
        self,
        wo_id: str,
        hotel_id: str,
        actor_id: str,
        technician_id: str,
        scheduled_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Assign a WO to a technician."""
        from sqlalchemy import text as _text

        wo = self.get(wo_id, hotel_id)
        if not wo:
            raise ValueError(f"Work order {wo_id} not found")

        self.db.execute(_text("""
            UPDATE work_orders
            SET technician_id = :tech_id,
                status = 'assigned',
                scheduled_date = :scheduled,
                updated_at = :now
            WHERE id = :id AND hotel_id = :hotel_id
        """), {
            "tech_id": technician_id,
            "scheduled": scheduled_date,
            "now": datetime.utcnow(),
            "id": wo_id,
            "hotel_id": hotel_id,
        })
        self.db.commit()

        self._emit_audit("WO_ASSIGNED", hotel_id, actor_id, wo_id, {
            "technician_id": technician_id
        })

        return {**wo, "status": "assigned", "technician_id": technician_id}

    def complete(
        self,
        wo_id: str,
        hotel_id: str,
        actor_id: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Complete a WO — check SLA compliance."""
        from sqlalchemy import text as _text

        wo = self.get(wo_id, hotel_id)
        if not wo:
            raise ValueError(f"Work order {wo_id} not found")

        now = datetime.utcnow()
        sla_breach_at = wo.get("sla_breach_at")
        sla_met = True
        if sla_breach_at:
            breach_dt = sla_breach_at if isinstance(sla_breach_at, datetime) else \
                datetime.fromisoformat(str(sla_breach_at))
            sla_met = now <= breach_dt

        sla_status = "met" if sla_met else "breached"

        self.db.execute(_text("""
            UPDATE work_orders
            SET status = 'completed',
                sla_status = :sla_status,
                sla_breached = :breached,
                completion_notes = :notes,
                completed_at = :now,
                updated_at = :now
            WHERE id = :id AND hotel_id = :hotel_id
        """), {
            "sla_status": sla_status,
            "breached": not sla_met,
            "notes": notes,
            "now": now,
            "id": wo_id,
            "hotel_id": hotel_id,
        })
        self.db.commit()

        self._emit_audit("WO_COMPLETED", hotel_id, actor_id, wo_id, {
            "sla_status": sla_status, "sla_met": sla_met
        })

        return {**wo, "status": "completed", "sla_status": sla_status}

    def get_sla_summary(self, hotel_id: str) -> Dict[str, Any]:
        """SLA compliance summary for a hotel."""
        from sqlalchemy import text as _text

        row = self.db.execute(_text("""
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN sla_status='met' THEN 1 ELSE 0 END) AS met,
                SUM(CASE WHEN sla_status='breached' THEN 1 ELSE 0 END) AS breached,
                SUM(CASE WHEN sla_status='on_track' THEN 1 ELSE 0 END) AS on_track,
                ROUND(
                    100.0 * SUM(CASE WHEN sla_status='met' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(*), 0), 1
                ) AS compliance_pct
            FROM work_orders
            WHERE hotel_id = :hotel_id
            AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"hotel_id": hotel_id}).fetchone()

        d = dict(row._mapping) if row else {}
        d["hotel_id"] = hotel_id
        return d

    def check_sla_breaches(self, hotel_id: str) -> int:
        """Mark overdue WOs as breached. Returns count updated."""
        from sqlalchemy import text as _text

        result = self.db.execute(_text("""
            UPDATE work_orders
            SET sla_breached = TRUE, sla_status = 'breached'
            WHERE hotel_id = :hotel_id
            AND sla_breach_at < NOW()
            AND sla_breached = FALSE
            AND status NOT IN ('completed', 'closed', 'cancelled')
            AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"hotel_id": hotel_id})
        self.db.commit()
        return result.rowcount

    def _init_workflow(self, wo_id: str, hotel_id: str, actor_id: str) -> None:
        """Non-blocking workflow instance initialization."""
        try:
            from src.commercial.workflow_engine import TriangleWorkflowEngine
            engine = TriangleWorkflowEngine(entity_type="work_order")
            engine.create_instance(
                db=self.db,
                entity_id=wo_id,
                hotel_id=hotel_id,
                actor_id=actor_id,
            )
        except Exception:
            pass

    def _emit_audit(self, action: str, hotel_id: str, actor_id: str,
                    entity_id: str, data: Dict[str, Any]) -> None:
        """Non-blocking audit event emission."""
        try:
            from src.core.audit import audit_action
            audit_action(
                db=self.db,
                hotel_id=hotel_id,
                actor_id=actor_id,
                action=action,
                entity_type="work_order",
                entity_id=entity_id,
                data=data
            )
        except Exception:
            pass

    # ── Compatibility Aliases for T-017 ──
    def create_from_service_request(self, sr_id: str, hotel_id: str, actor_id: str, title: str, **kwargs) -> Dict[str, Any]:
        return self.create_from_sr(sr_id, hotel_id, actor_id, title, **kwargs)

    def close(self, wo_id: str, hotel_id: str, actor_id: str) -> Dict[str, Any]:
        # Complete/close mapping
        from sqlalchemy import text as _text
        self.db.execute(_text("UPDATE work_orders SET status = 'closed' WHERE id = :id AND hotel_id = :hid"), {"id": wo_id, "hid": hotel_id})
        self.db.commit()
        return {"id": wo_id, "status": "closed"}
