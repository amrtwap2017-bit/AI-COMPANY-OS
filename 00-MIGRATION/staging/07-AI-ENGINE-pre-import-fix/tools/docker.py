"""
Docker Tool
─────────────────────────────────────────────────────
Read-only Docker operations for agents.
Agents can observe containers but not destroy them.
"""

import subprocess
from app.tools.base import BaseTool, ToolResult


def _docker(command: str) -> tuple[str, str, int]:
    result = subprocess.run(
        f"docker {command}",
        shell=True,
        capture_output=True,
        text=True,
        timeout=30,
    )
    return result.stdout.strip(), result.stderr.strip(), result.returncode


class DockerTool(BaseTool):
    name = "docker"
    description = "Inspect Docker containers, images and logs"
    permissions_required = ["docker"]

    def run(self, action: str, **kwargs) -> ToolResult:
        actions = {
            "ps": self._ps,
            "logs": self._logs,
            "stats": self._stats,
            "inspect": self._inspect,
            "images": self._images,
            "restart": self._restart,
        }
        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )
        return actions[action](**kwargs)

    def _ps(self, all: bool = False) -> ToolResult:
        flag = "-a" if all else ""
        stdout, stderr, code = _docker(
            f"ps {flag} --format 'table {{{{.Names}}}}\t{{{{.Image}}}}\t{{{{.Status}}}}\t{{{{.Ports}}}}'"
        )
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
            error=stderr if code != 0 else None,
        )

    def _logs(self, container: str, tail: int = 50) -> ToolResult:
        stdout, stderr, code = _docker(
            f"logs --tail {tail} {container}"
        )
        output = stdout or stderr
        return ToolResult(
            tool=self.name,
            success=True,
            output=output,
            metadata={"container": container},
        )

    def _stats(self) -> ToolResult:
        stdout, stderr, code = _docker(
            "stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}'"
        )
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
        )

    def _inspect(self, container: str) -> ToolResult:
        stdout, stderr, code = _docker(f"inspect {container}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout[:5000],
            error=stderr if code != 0 else None,
        )

    def _images(self) -> ToolResult:
        stdout, stderr, code = _docker("images")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=stdout,
        )

    def _restart(self, container: str) -> ToolResult:
        stdout, stderr, code = _docker(f"restart {container}")
        return ToolResult(
            tool=self.name,
            success=code == 0,
            output=f"Restarted: {container}",
            error=stderr if code != 0 else None,
        )


docker_tool = DockerTool()
