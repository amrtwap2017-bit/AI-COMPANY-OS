"""
AI Company OS — Foundation Protocols
=====================================
This package defines the structural contracts (Python Protocols) that all
platform subsystems must implement. These are the immutable architectural
boundaries of the system.

Every protocol here is:
- Pure interface — no implementation logic
- Runtime-checkable — can be used in isinstance() guards
- Workspace-scoped — every method carries workspace_id
- Fully typed — no Any types in signatures

Import order rule:
  00-FOUNDATION imports NOTHING from the platform.
  Everything else imports FROM here.
"""

from .workspace import WorkspaceManagerProtocol, WorkspaceLifecycleState
from .agent import AgentProtocol, AgentCapability, AgentStatus
from .tool import ToolProtocol, ToolResult, ToolScope
from .router import ModelRouterProtocol, ModelRoute, TaskType

__all__ = [
    # Workspace
    "WorkspaceManagerProtocol",
    "WorkspaceLifecycleState",
    # Agent
    "AgentProtocol",
    "AgentCapability",
    "AgentStatus",
    # Tool
    "ToolProtocol",
    "ToolResult",
    "ToolScope",
    # Router
    "ModelRouterProtocol",
    "ModelRoute",
    "TaskType",
]
