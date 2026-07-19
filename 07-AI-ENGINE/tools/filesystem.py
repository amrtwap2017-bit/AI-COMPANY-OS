"""
Filesystem Tool
─────────────────────────────────────────────────────
Safe filesystem operations for agents.
Restricted to the project workspace by default.
"""

import os
from pathlib import Path

from tools.base import BaseTool, ToolResult

# Agents can only access within this root
WORKSPACE_ROOT = Path.home() / "AI" / "projects"


def _safe_path(path: str) -> Path:
    """
    Ensure path is within the workspace.
    Prevents directory traversal attacks.
    """
    resolved = (WORKSPACE_ROOT / path).resolve()
    if not str(resolved).startswith(str(WORKSPACE_ROOT)):
        raise PermissionError(
            f"Access denied: {path} is outside workspace"
        )
    return resolved


class FilesystemTool(BaseTool):
    name = "filesystem"
    description = "Read, write, list and create files and directories"
    permissions_required = ["filesystem"]

    def run(self, action: str, **kwargs) -> ToolResult:
        actions = {
            "read": self._read,
            "write": self._write,
            "list": self._list,
            "exists": self._exists,
            "create_dir": self._create_dir,
            "delete": self._delete,
        }
        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}. Available: {list(actions.keys())}",
            )
        return actions[action](**kwargs)

    def _read(self, path: str) -> ToolResult:
        try:
            full_path = _safe_path(path)
            content = full_path.read_text(encoding="utf-8")
            return ToolResult(
                tool=self.name,
                success=True,
                output=content,
                metadata={"path": str(full_path), "size": len(content)},
            )
        except Exception as e:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(e)
            )

    def _write(self, path: str, content: str) -> ToolResult:
        try:
            full_path = _safe_path(path)
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding="utf-8")
            return ToolResult(
                tool=self.name,
                success=True,
                output=f"Written {len(content)} characters to {path}",
                metadata={"path": str(full_path)},
            )
        except Exception as e:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(e)
            )

    def _list(self, path: str = "") -> ToolResult:
        try:
            full_path = _safe_path(path) if path else WORKSPACE_ROOT
            items = []
            for item in sorted(full_path.iterdir()):
                items.append({
                    "name": item.name,
                    "type": "dir" if item.is_dir() else "file",
                    "size": item.stat().st_size if item.is_file() else None,
                })
            return ToolResult(
                tool=self.name,
                success=True,
                output=items,
                metadata={"path": str(full_path), "count": len(items)},
            )
        except Exception as e:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(e)
            )

    def _exists(self, path: str) -> ToolResult:
        try:
            full_path = _safe_path(path)
            return ToolResult(
                tool=self.name,
                success=True,
                output=full_path.exists(),
                metadata={"path": str(full_path)},
            )
        except Exception as e:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(e)
            )

    def _create_dir(self, path: str) -> ToolResult:
        try:
            full_path = _safe_path(path)
            full_path.mkdir(parents=True, exist_ok=True)
            return ToolResult(
                tool=self.name,
                success=True,
                output=f"Directory created: {path}",
                metadata={"path": str(full_path)},
            )
        except Exception as e:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(e)
            )

    def _delete(self, path: str) -> ToolResult:
        try:
            full_path = _safe_path(path)
            if full_path.is_file():
                full_path.unlink()
            elif full_path.is_dir():
                import shutil
                shutil.rmtree(full_path)
            return ToolResult(
                tool=self.name,
                success=True,
                output=f"Deleted: {path}",
            )
        except Exception as e:
            return ToolResult(
                tool=self.name, success=False, output=None, error=str(e)
            )


filesystem_tool = FilesystemTool()
