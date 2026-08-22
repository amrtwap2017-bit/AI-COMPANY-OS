"""
Workflow Policy Engine — Triangle Black Enterprise OS
Evaluates dynamic approval thresholds, role hierarchies, and transition constraints.
"""
from typing import Dict, Any, Optional

ROLE_HIERARCHY = {
    "admin": 100,
    "finance_director": 80,
    "manager": 50,
    "technician": 20,
    "client": 10,
    "supplier": 10,
    "user": 10
}

class WorkflowPolicyEngine:
    """Evaluates transition policies and threshold approvals."""

    @staticmethod
    def evaluate_approval_policy(
        hotel_id: str,
        entity_type: str,
        amount: float = 0.0,
        current_state: str = "draft"
    ) -> Dict[str, Any]:
        """
        Evaluates whether an entity transition requires managerial or financial approval.
        """
        if amount <= 1000.0:
            return {
                "requires_approval": False,
                "target_state": "approved" if current_state == "draft" else "in_progress",
                "required_role": None,
                "tier": "auto"
            }
        elif 1000.0 < amount <= 5000.0:
            return {
                "requires_approval": True,
                "target_state": "pending_approval",
                "required_role": "manager",
                "tier": "tier_1_manager"
            }
        else:
            return {
                "requires_approval": True,
                "target_state": "pending_approval",
                "required_role": "finance_director",
                "tier": "tier_2_executive"
            }

    @staticmethod
    def can_user_approve(user_role: str, required_role: Optional[str]) -> bool:
        """Verifies if actor role meets or exceeds the required role level."""
        if not required_role:
            return True
        user_weight = ROLE_HIERARCHY.get(user_role.lower(), 0)
        req_weight = ROLE_HIERARCHY.get(required_role.lower(), 0)
        return user_weight >= req_weight
