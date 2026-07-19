"""
Shell Tool
─────────────────────────────────────────────────────
Execute shell commands safely with:
  - Timeout enforcement
  - Output capture
  - Blocked dangerous commands
"""

import subprocess
from app.tools.base import BaseTool, ToolResult

# Commands that are never allowed
BLOCKED_COMMANDS = [
    "rm -rf /",
    "mkfs",
    "dd if=/dev/zero",
    ":(){:|:&};:",
    "chmod -R 777 /",
    "> /dev/sda",
]

DEFAULT_TIMEOUT = 30  # seconds
MAX_OUTPUT_LENGTH = 10000


def _is_blocked(command: str) -> bool:
    command_lower = command.lower().strip()
    return any(blocked in command_lower for blocked in BLOCKED_COMMANDS)


class ShellTool(BaseTool):
    name = "shell"
    description = "Execute shell commands and capture output"
    permissions_required = ["shell"]

    def run(
        self,
        command: str,
        timeout: int = DEFAULT_TIMEOUT,
        working_dir: str | None = None,
    ) -> ToolResult:

        if _is_blocked(command):
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Blocked command: {command}",
            )

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=working_dir,
            )

            stdout = result.stdout[:MAX_OUTPUT_LENGTH]
            stderr = result.stderr[:MAX_OUTPUT_LENGTH]
            output = stdout if stdout else stderr

            return ToolResult(
                tool=self.name,
                success=result.returncode == 0,
                output=output,
                error=stderr if result.returncode != 0 else None,
                metadata={
                    "returncode": result.returncode,
                    "command": command,
                },
            )

        except subprocess.TimeoutExpired:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Command timed out after {timeout}s: {command}",
            )
        except Exception as e:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(e),
            )


shell_tool = ShellTool()
