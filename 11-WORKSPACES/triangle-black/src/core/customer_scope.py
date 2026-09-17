"""
CustomerDataScope — Centralized Customer Data Filter
V15: Prevents test/demo/generated data from contaminating customer dashboards.

RULE: All customer-facing KPI and dashboard queries MUST use this scope.
      Never let TEST, DEMO, GENERATED data appear as real operational data.

Usage:
    from src.core.customer_scope import CustomerDataScope, CUSTOMER_CLASSIFICATIONS

    # In a service/repository:
    scope = CustomerDataScope(hotel_id=hotel_id)
    query = scope.filter_work_orders(db, base_query)

    # Or use the classification constant:
    .filter(WorkOrder.data_classification.in_(CUSTOMER_CLASSIFICATIONS))
"""
from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime

# Classifications that represent real operational customer data
CUSTOMER_CLASSIFICATIONS = ("REAL", "IMPORTED", "VERIFIED")

# Classifications that must NEVER appear in customer dashboards
EXCLUDED_CLASSIFICATIONS = ("TEST", "DEMO", "GENERATED", "UNKNOWN", "INTERNAL")

# All valid classification values
ALL_CLASSIFICATIONS = CUSTOMER_CLASSIFICATIONS + EXCLUDED_CLASSIFICATIONS


class CustomerDataScope:
    """
    Central authority for what data a customer sees.
    All customer-facing KPIs must use this scope.

    The scope enforces:
      - Only REAL + IMPORTED + VERIFIED data in dashboards
      - TEST + DEMO + GENERATED never mix with customer data
      - hotel_id always applied (tenant isolation)
    """

    def __init__(self, hotel_id: str, include_classifications: Optional[tuple] = None):
        self.hotel_id = hotel_id
        self.classifications = include_classifications or CUSTOMER_CLASSIFICATIONS

    def where_clause(self) -> str:
        """SQL WHERE clause fragment for raw queries."""
        cls_list = ", ".join(f"'{c}'" for c in self.classifications)
        return (
            f"hotel_id = '{self.hotel_id}' "
            f"AND (data_classification IS NULL OR data_classification IN ({cls_list}))"
        )

    def params(self) -> dict:
        """Parameters for parameterized queries."""
        return {
            "hotel_id": self.hotel_id,
            "classifications": list(self.classifications),
        }

    def apply_to_query(self, query: Any, model: Any) -> Any:
        """Apply scope to SQLAlchemy query if model has data_classification."""
        query = query.filter(model.hotel_id == self.hotel_id)
        if hasattr(model, "data_classification"):
            query = query.filter(
                model.data_classification.in_(self.classifications)
                | model.data_classification.is_(None)
            )
        return query

    @classmethod
    def from_hotel_id(cls, hotel_id: str) -> "CustomerDataScope":
        """Standard customer scope — REAL + IMPORTED only."""
        return cls(hotel_id=hotel_id, include_classifications=CUSTOMER_CLASSIFICATIONS)

    @classmethod
    def all_data(cls, hotel_id: str) -> "CustomerDataScope":
        """Full scope including test data — for admin/debug only."""
        return cls(hotel_id=hotel_id, include_classifications=ALL_CLASSIFICATIONS)


def classify_record(
    source: str = "system",
    is_real_data: bool = False,
    is_imported: bool = False,
    is_demo: bool = False,
) -> str:
    """
    Determine the correct data_classification for a new record.
    Use this when creating any data record to ensure honest provenance.
    """
    if is_real_data:
        return "REAL"
    if is_imported:
        return "IMPORTED"
    if is_demo:
        return "DEMO"
    if source in ("api", "customer", "portal"):
        return "REAL"
    if source in ("import", "csv", "upload"):
        return "IMPORTED"
    if source in ("seed", "fixture", "test"):
        return "TEST"
    if source in ("ai", "generated", "automation"):
        return "GENERATED"
    return "UNKNOWN"
