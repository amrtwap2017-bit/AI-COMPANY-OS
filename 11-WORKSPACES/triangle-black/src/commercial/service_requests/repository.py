"""
Service Request Repository — Triangle Black Enterprise OS
Standard DDD Repository Pattern with strict hotel_id tenant scoping.
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from src.commercial.service_requests.models import ServiceRequest

class ServiceRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_requests(
        self,
        hotel_id: str,
        status: Optional[str] = None,
        urgency: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ServiceRequest]:
        query = self.db.query(ServiceRequest).filter(
            ServiceRequest.hotel_id == hotel_id,
            ServiceRequest.deleted_at.is_(None) if hasattr(ServiceRequest, "deleted_at") else True
        )
        if status:
            query = query.filter(ServiceRequest.status == status)
        if urgency:
            query = query.filter(ServiceRequest.urgency == urgency)
        return query.order_by(ServiceRequest.created_at.desc()).offset(offset).limit(limit).all()

    def get_by_id(self, sr_id: str, hotel_id: str) -> Optional[ServiceRequest]:
        return self.db.query(ServiceRequest).filter(
            ServiceRequest.id == sr_id,
            ServiceRequest.hotel_id == hotel_id,
            ServiceRequest.deleted_at.is_(None) if hasattr(ServiceRequest, "deleted_at") else True
        ).first()

    def create(self, hotel_id: str, data: Dict[str, Any]) -> ServiceRequest:
        data["hotel_id"] = hotel_id
        sr = ServiceRequest(**data)
        self.db.add(sr)
        self.db.commit()
        self.db.refresh(sr)
        return sr

    def update_status(self, sr_id: str, hotel_id: str, status: str) -> Optional[ServiceRequest]:
        sr = self.get_by_id(sr_id, hotel_id)
        if not sr:
            return None
        sr.status = status
        self.db.commit()
        self.db.refresh(sr)
        return sr

    def get_triage_summary(self, hotel_id: str) -> Dict[str, Any]:
        base = self.db.query(ServiceRequest).filter(
            ServiceRequest.hotel_id == hotel_id,
            ServiceRequest.deleted_at.is_(None) if hasattr(ServiceRequest, "deleted_at") else True
        )
        total = base.count()
        pending = base.filter(ServiceRequest.status == "pending").count()
        triaged = base.filter(ServiceRequest.status == "triaged").count()
        converted = base.filter(ServiceRequest.status == "converted_to_wo").count()

        return {
            "total_requests": total,
            "pending_triage": pending,
            "triaged": triaged,
            "converted_to_wo": converted
        }
