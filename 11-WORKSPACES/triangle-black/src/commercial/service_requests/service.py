"""
T-005: Application Service Layer — Service Request Domain
Extracts business logic from router into a testable service class.
The router delegates to OperationsService — no direct repo calls in router.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# ── Service Request Application Service ──────────────────────────────────────

class ServiceRequestService:
    """
    Application service for Service Request domain.
    Contains all business logic for SR lifecycle.
    Router calls this — service calls repository.
    """

    def __init__(self, db):
        self.db = db

    def create(
        self,
        hotel_id: str,
        actor_id: str,
        title: str,
        urgency: str = "normal",
        category: str = "General",
        description: Optional[str] = None,
        asset_id: Optional[str] = None,
        location: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a new Service Request.
        Enforces: hotel_id, actor, timestamp, correlation_id.
        Emits: SR_CREATED audit event.
        """
        from sqlalchemy import text as _text

        sr_id = str(uuid.uuid4())
        correlation_id = str(uuid.uuid4())
        now = datetime.utcnow()

        # Validate urgency
        valid_urgencies = {"low", "normal", "high", "critical"}
        if urgency not in valid_urgencies:
            raise ValueError(f"Invalid urgency: {urgency}. Must be one of {valid_urgencies}")

        try:
            self.db.execute(_text("""
                INSERT INTO service_requests
                    (id, hotel_id, title, description, urgency, category,
                     status, asset_id, location, created_by, created_at, updated_at)
                VALUES
                    (:id, :hotel_id, :title, :desc, :urgency, :category,
                     'open', :asset_id, :location, :created_by, :now, :now)
            """), {
                "id": sr_id,
                "hotel_id": hotel_id,
                "title": title,
                "desc": description,
                "urgency": urgency,
                "category": category,
                "asset_id": asset_id,
                "location": location,
                "created_by": actor_id,
                "now": now,
            })
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        self._emit_audit("SR_CREATED", hotel_id, actor_id, sr_id, {
            "title": title, "urgency": urgency, "category": category
        })

        return {
            "id": sr_id,
            "hotel_id": hotel_id,
            "title": title,
            "urgency": urgency,
            "category": category,
            "status": "open",
            "created_by": actor_id,
            "created_at": now.isoformat(),
            "correlation_id": correlation_id,
        }

    def get(self, sr_id: str, hotel_id: str) -> Optional[Dict[str, Any]]:
        """Get a single SR with hotel_id scope enforced."""
        from sqlalchemy import text as _text
        row = self.db.execute(_text("""
            SELECT * FROM service_requests
            WHERE id = :id AND hotel_id = :hotel_id
        """), {"id": sr_id, "hotel_id": hotel_id}).fetchone()
        if not row:
            return None
        return dict(row._mapping)

    def list(
        self,
        hotel_id: str,
        status: Optional[str] = None,
        urgency: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> Dict[str, Any]:
        """List SRs with hotel_id scope + optional filters."""
        from sqlalchemy import text as _text

        filters = ["hotel_id = :hotel_id"]
        params: Dict[str, Any] = {"hotel_id": hotel_id, "limit": limit, "skip": skip}

        if status:
            filters.append("status = :status")
            params["status"] = status
        if urgency:
            filters.append("urgency = :urgency")
            params["urgency"] = urgency

        where = " AND ".join(filters)

        rows = self.db.execute(_text(f"""
            SELECT * FROM service_requests
            WHERE {where}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :skip
        """), params).fetchall()

        count_row = self.db.execute(_text(f"""
            SELECT COUNT(*) FROM service_requests WHERE {where}
        """), {k: v for k, v in params.items() if k not in ("limit", "skip")}).fetchone()

        return {
            "count": count_row[0] if count_row else 0,
            "results": [dict(r._mapping) for r in rows],
            "hotel_id": hotel_id,
        }

    def transition(
        self,
        sr_id: str,
        hotel_id: str,
        actor_id: str,
        new_status: str
    ) -> Dict[str, Any]:
        """
        Transition SR to a new status.
        Validates allowed transitions.
        Emits audit event.
        """
        from sqlalchemy import text as _text

        ALLOWED_TRANSITIONS = {
            "open": {"in_progress", "cancelled"},
            "in_progress": {"resolved", "on_hold", "cancelled"},
            "on_hold": {"in_progress", "cancelled"},
            "resolved": {"closed", "in_progress"},
            "closed": set(),
            "cancelled": set(),
        }

        sr = self.get(sr_id, hotel_id)
        if not sr:
            raise ValueError(f"Service request {sr_id} not found")

        current = sr.get("status", "open")
        allowed = ALLOWED_TRANSITIONS.get(current, set())

        if new_status not in allowed:
            raise ValueError(
                f"Cannot transition SR from '{current}' to '{new_status}'. "
                f"Allowed: {allowed}"
            )

        self.db.execute(_text("""
            UPDATE service_requests
            SET status = :status, updated_at = :now
            WHERE id = :id AND hotel_id = :hotel_id
        """), {
            "status": new_status,
            "now": datetime.utcnow(),
            "id": sr_id,
            "hotel_id": hotel_id,
        })
        self.db.commit()

        self._emit_audit(f"SR_{new_status.upper()}", hotel_id, actor_id, sr_id, {
            "from_status": current, "to_status": new_status
        })

        return {**sr, "status": new_status, "updated_at": datetime.utcnow().isoformat()}

    def generate_work_order(
        self,
        sr_id: str,
        hotel_id: str,
        actor_id: str
    ) -> Dict[str, Any]:
        """
        Generate a Work Order from a Service Request.
        This is the SR→WO transition — core operational workflow.
        """
        sr = self.get(sr_id, hotel_id)
        if not sr:
            raise ValueError(f"Service request {sr_id} not found")

        if sr.get("status") == "cancelled":
            raise ValueError("Cannot generate WO from a cancelled service request")

        # Delegate to WorkOrderService
        from src.commercial.work_orders.service import WorkOrderService
        wo_service = WorkOrderService(self.db)

        wo = wo_service.create_from_sr(
            sr_id=sr_id,
            hotel_id=hotel_id,
            actor_id=actor_id,
            title=f"WO: {sr.get('title', 'Service Request')}",
            priority=self._urgency_to_priority(sr.get("urgency", "normal")),
            description=sr.get("description"),
            asset_id=sr.get("asset_id"),
            location=sr.get("location"),
        )

        # Transition SR to in_progress
        try:
            self.transition(sr_id, hotel_id, actor_id, "in_progress")
        except ValueError:
            pass  # Already in_progress or other valid state

        self._emit_audit("SR_WO_GENERATED", hotel_id, actor_id, sr_id, {
            "work_order_id": wo.get("id")
        })

        return {
            "service_request_id": sr_id,
            "work_order_id": wo.get("id"),
            "status": "work_order_created",
            "work_order": wo,
        }

    def _urgency_to_priority(self, urgency: str) -> str:
        return {"critical": "critical", "high": "high",
                "normal": "medium", "low": "low"}.get(urgency, "medium")

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
                entity_type="service_request",
                entity_id=entity_id,
                data=data
            )
        except Exception:
            pass  # Never block on audit failure

    # ── Compatibility Aliases for T-017 ──
    def get_by_id(self, sr_id: str, hotel_id: str) -> Optional[Dict[str, Any]]:
        return self.get(sr_id, hotel_id)

    def list_by_status(self, hotel_id: str, status: str, limit: int = 50, skip: int = 0) -> Dict[str, Any]:
        return self.list(hotel_id, status=status, limit=limit, skip=skip)

    def update_status(self, sr_id: str, hotel_id: str, actor_id: str, new_status: str) -> Dict[str, Any]:
        return self.transition(sr_id, hotel_id, actor_id, new_status)
