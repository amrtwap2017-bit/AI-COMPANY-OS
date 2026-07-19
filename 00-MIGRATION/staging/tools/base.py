"""
Tool Base
─────────────────────────────────────────────────────
Every tool must implement this contract.
This ensures the Orchestrator can call any tool
with a unified interface.
"""

from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from typing import Any


@dataclass
class ToolResult:
    tool: str
    success: bool
    output: Any
    error: str | None = None
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "tool": self.tool,
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "metadata": self.metadata,
        }


class BaseTool(ABC):
    """
    Every tool must inherit from this.
    """
    name: str = "base"
    description: str = ""
    permissions_required: list[str] = []

    @abstractmethod
    def run(self, **kwargs) -> ToolResult:
        pass

    def safe_run(self, **kwargs) -> ToolResult:
        """
        Wraps run() with error handling.
        Always returns a ToolResult even on unexpected failure.
        """
        try:
            return self.run(**kwargs)
        except Exception as e:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(e),
            )
