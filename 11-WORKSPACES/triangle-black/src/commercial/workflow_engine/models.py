"""
Triangle Black — Workflow Engine Models (Sprint-230)
Three tables that power the state machine:
  workflow_definitions  — stores the allowed transitions per entity type
  workflow_instances    — tracks current state of one running workflow
  workflow_transitions  — immutable log of every state change

Design rules:
  - All IDs are VARCHAR(36) UUIDs — consistent with platform pattern
  - All tables require hotel_id — non-negotiable multi-tenancy
  - state_machine_json stored as TEXT (JSON serialized dict)
  - Never duplicates ownership of work_orders/service_requests status fields
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Index
from src.core.base import Base


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _uuid():
    return str(uuid.uuid4())


class WorkflowDefinition(Base):
    """
    Defines the allowed state transitions for an entity type within a hotel.
    state_machine_json = JSON string of:
    {
      "states": {
        "open": ["assigned", "cancelled"],
        "assigned": ["in_progress", "open", "cancelled"],
        ...
      }
    }
    """
    __tablename__ = "workflow_definitions"

    id               = Column(String(36), primary_key=True, default=_uuid)
    hotel_id         = Column(String(36), nullable=False, index=True)
    name             = Column(String(200), nullable=False)
    entity_type      = Column(String(50),  nullable=False)  # work_order, service_request, contract
    version          = Column(String(20),  nullable=False, default="1.0")
    state_machine_json = Column(Text,      nullable=False)
    is_active        = Column(String(5),   nullable=False, default="true")
    created_at       = Column(DateTime,    nullable=False, default=_now)
    updated_at       = Column(DateTime,    nullable=False, default=_now, onupdate=_now)

    __table_args__ = (
        Index("ix_wf_def_hotel_entity", "hotel_id", "entity_type"),
        Index("ix_wf_def_active",       "hotel_id", "is_active"),
    )


class WorkflowInstance(Base):
    """
    Tracks one running workflow — one per entity per active workflow.
    Links back to the entity via entity_type + entity_id (no FK to allow flexibility).
    """
    __tablename__ = "workflow_instances"

    id              = Column(String(36), primary_key=True, default=_uuid)
    hotel_id        = Column(String(36), nullable=False, index=True)
    definition_id   = Column(String(36), nullable=False, index=True)
    entity_type     = Column(String(50), nullable=False, index=True)
    entity_id       = Column(String(36), nullable=False, index=True)
    current_state   = Column(String(50), nullable=False)
    status          = Column(String(20), nullable=False, default="active")
    started_by      = Column(String(100), nullable=True)
    completed_at    = Column(DateTime,   nullable=True)
    created_at      = Column(DateTime,   nullable=False, default=_now)
    updated_at      = Column(DateTime,   nullable=False, default=_now, onupdate=_now)

    __table_args__ = (
        Index("ix_wf_inst_entity",  "entity_type", "entity_id"),
        Index("ix_wf_inst_hotel",   "hotel_id", "status"),
        Index("ix_wf_inst_active",  "hotel_id", "entity_type", "status"),
    )


class WorkflowTransition(Base):
    """
    Immutable audit log of every state change in every workflow instance.
    Never deleted. Hotel-scoped. Referenced by audit reports and KPI.
    """
    __tablename__ = "workflow_transitions"

    id           = Column(String(36), primary_key=True, default=_uuid)
    hotel_id     = Column(String(36), nullable=False, index=True)
    instance_id  = Column(String(36), nullable=False, index=True)
    entity_type  = Column(String(50), nullable=False)
    entity_id    = Column(String(36), nullable=False, index=True)
    from_state   = Column(String(50), nullable=False)
    to_state     = Column(String(50), nullable=False)
    triggered_by = Column(String(100), nullable=True)
    notes        = Column(Text,       nullable=True)
    created_at   = Column(DateTime,   nullable=False, default=_now)

    __table_args__ = (
        Index("ix_wf_trans_instance", "instance_id"),
        Index("ix_wf_trans_entity",   "entity_type", "entity_id"),
        Index("ix_wf_trans_hotel",    "hotel_id", "created_at"),
    )
