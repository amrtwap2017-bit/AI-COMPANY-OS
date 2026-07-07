"""
Tool Protocol
=============
Defines the structural contract for all tools registered in the
MCP Gateway (07-TOOLS).

Every tool execution must:
1. Pass through the MCP Gateway — never called directly
2. Be scoped to a workspace
3. Be attributed to a run_group
4. Be audited in the tool_audit_log table
5. Respect rate limits declared by the tool

Tools are the ONLY mechanism by which agents interact with:
- The filesystem
- The network
- External APIs
- Databases
- Docker
- Git
- Browsers
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Protocol, runtime_checkable
from uuid import UUID


class ToolScope(str, Enum):
    """
    Security scopes for tool access.
    Agents must have matching scope to call a tool.
    """
    FILESYSTEM_READ = "filesystem:read"
    FILESYSTEM_WRITE = "filesystem:write"
    GIT_READ = "git:read"
    GIT_WRITE = "git:write"
    SHELL_EXECUTE = "shell:execute"
    DOCKER_READ = "docker:read"
    DOCKER_WRITE = "docker:write"
    DATABASE_READ = "database:read"
    DATABASE_WRITE = "database:write"
    NETWORK_READ = "network:read"
    NETWORK_WRITE = "network:write"
    BROWSER_READ = "browser:read"
    BROWSER_WRITE = "browser:write"
    TEST_EXECUTE = "test:execute"
    DEPLOY_TRIGGER = "deploy:trigger"


class ToolResult:
    """
    Standardised result envelope for every tool execution.
    The MCP Gateway wraps all tool outputs in this structure.
    """

    def __init__(
        self,
        tool_name: str,
        run_group: UUID,
        workspace_id: UUID,
        exit_code: int,
        stdout: str,
        stderr: str,
        duration_ms: int,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.tool_name = tool_name
        self.run_group = run_group
        self.workspace_id = workspace_id
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr
        self.duration_ms = duration_ms
        self.metadata = metadata or {}
        self.success = exit_code == 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "tool_name": self.tool_name,
            "run_group": str(self.run_group),
            "workspace_id": str(self.workspace_id),
            "exit_code": self.exit_code,
            "stdout": self.stdout,
            "stderr": self.stderr,
            "duration_ms": self.duration_ms,
            "metadata": self.metadata,
            "success": self.success,
        }


@runtime_checkable
class ToolProtocol(Protocol):
    """
    Structural contract for all MCP Gateway tools.

    Implementors:
        07-TOOLS/registered_tools/git.py::GitTool
        07-TOOLS/registered_tools/shell.py::ShellTool
        07-TOOLS/registered_tools/playwright.py::PlaywrightTool
        07-TOOLS/registered_tools/pytest.py::PytestTool

    All tools are invoked ONLY via:
        07-TOOLS/mcp_gateway.py::MCPGateway.execute_tool()
    """

    @property
    def tool_name(self) -> str:
        """Unique tool identifier. e.g. 'git.commit', 'shell.run'"""
        ...

    @property
    def required_scopes(self) -> list[ToolScope]:
        """Security scopes the calling agent must possess."""
        ...

    @property
    def rate_limit_per_minute(self) -> int:
        """Maximum calls per minute per workspace."""
        ...

    async def execute(
        self,
        workspace_id: UUID,
        run_group: UUID,
        arguments: dict[str, Any],
        workspace_path: str,
    ) -> ToolResult:
        """
        Execute the tool within the workspace boundary.

        Args:
            workspace_id:   Enforces isolation — tool must not escape this
            run_group:      Correlation ID for audit attribution
            arguments:      Tool-specific parameters
            workspace_path: Validated absolute path to workspace root

        Returns:
            ToolResult with exit_code, stdout, stderr, duration_ms

        Raises:
            ToolExecutionError: on unrecoverable tool failure
            ToolScopeError: if called without required scope
            ToolRateLimitError: if rate limit exceeded
            ToolBoundaryViolationError: if path escapes workspace
        """
        ...

    async def validate_arguments(
        self,
        arguments: dict[str, Any],
    ) -> bool:
        """
        Validate tool arguments before execution.
        Returns True if valid, raises ToolValidationError if not.
        """
        ...

    def get_schema(self) -> dict[str, Any]:
        """
        Return JSON Schema for this tool's arguments.
        Used by the MCP Gateway to validate incoming requests.
        """
        ...
