"""
Application Service for Contracts Domain (Sprint U-003)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from src.commercial.contracts.repository import ContractRepository
from src.core.audit import audit_create, audit_update, audit_action

class ContractService:
    def __init__(self, db: Session, hotel_id: str, actor: Optional[str] = None):
        self.db = db
        self.hotel_id = hotel_id
        self.actor = actor or "system"
        self.repo = ContractRepository(db)

    def get_contract(self, contract_id: str) -> Optional[Dict[str, Any]]:
        contract = self.repo.get_by_id(contract_id, self.hotel_id)
        return getattr(contract, "to_dict", lambda: dict(contract.__dict__))() if contract else None

    def list_contracts(self, status: Optional[str] = None, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
        return self.repo.list_contracts(hotel_id=self.hotel_id, status=status, limit=limit, skip=skip)

    def create_contract(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["hotel_id"] = self.hotel_id
        contract = self.repo.create(payload)
        cid = str(getattr(contract, "id", ""))
        try:
            audit_create(self.db, "contract", cid, self.actor, self.hotel_id)
        except Exception:
            pass
        return getattr(contract, "to_dict", lambda: dict(contract.__dict__))()

    def renew_contract(self, contract_id: str, new_duration_months: int = 12) -> Optional[Dict[str, Any]]:
        contract = self.repo.get_by_id(contract_id, self.hotel_id)
        if not contract:
            return None
        renew_count = int(getattr(contract, "renewal_count", 0) or 0) + 1
        updated = self.repo.update(contract_id, self.hotel_id, {
            "renewal_count": renew_count,
            "status": "active",
            "duration_months": new_duration_months,
            "updated_at": datetime.utcnow()
        })
        try:
            audit_action(self.db, "contract", contract_id, "RENEWAL", self.actor, {"renewal_count": renew_count})
        except Exception:
            pass
        return getattr(updated, "to_dict", lambda: dict(updated.__dict__))() if updated else None
