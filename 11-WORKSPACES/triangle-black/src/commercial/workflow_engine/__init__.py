"""
workflow_engine — Sprint-230: Minimal state machine engine for Triangle Black.
Exports TriangleWorkflowEngine for use in routers and services.
"""
from src.commercial.workflow_engine.engine import TriangleWorkflowEngine

__all__ = ["TriangleWorkflowEngine"]
