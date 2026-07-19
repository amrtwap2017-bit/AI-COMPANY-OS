"""
Git Tool
─────────────────────────────────────────────────────
Git operations for the AI Company OS project.
"""

import subprocess
from pathlib import Path
from tools.base import BaseTool, ToolResult

PROJECT_ROOT = str(Path.home() / "AI" / "projects" / "ai-company-os")


def _git(command: str, cwd: str = PROJECT_ROOT) -> tuple[str, str, int]:
    result = subprocess.run(
        f"git {command}",
        shell=True,
        capture_output=True,
        text=True,
        cwd=cwd,
        timeout=30,
    )
    return result.stdout.strip(), result.stderr.strip(), result.returncode


class GitTool(BaseTool):
    name = "git"
    description = "Git operations: status, diff, log, branch, commit"
    permissions_required = ["git"]

    def run(self, action: str, **kwargs) -> ToolResult:
        actions = {
            "status": self._status,
            "diff": self._diff,
            "log": self._log,
            "branch": self._branch,
            "add": self._add,
            "commit": self._commit,
            "show": self._show,
        }
        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )
        return actions[action](**kwargs)

    def _status(self) -> ToolResult:
        stdout, stderr, code = _git("status")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
            error=stderr if code != 0 else None,
        )

    def _diff(self, file: str = "") -> ToolResult:
        cmd = f"diff {file}" if file else "diff"
        stdout, stderr, code = _git(cmd)
        return ToolResult(
            tool=self.name,
            success=True,
            output=stdout or "No changes",
        )

    def _log(self, count: int = 10) -> ToolResult:
        stdout, stderr, code = _git(
            f"log --oneline -{count}"
        )
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
            error=stderr if code != 0 else None,
        )

    def _branch(self) -> ToolResult:
        stdout, stderr, code = _git("branch -a")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
        )

    def _add(self, path: str = ".") -> ToolResult:
        stdout, stderr, code = _git(f"add {path}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Staged: {path}",
            error=stderr if code != 0 else None,
        )

    def _commit(self, message: str) -> ToolResult:
        stdout, stderr, code = _git(f'commit -m "{message}"')
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
            error=stderr if code != 0 else None,
        )

    def _show(self, ref: str = "HEAD") -> ToolResult:
        stdout, stderr, code = _git(f"show --stat {ref}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
        )


git_tool = GitTool()
