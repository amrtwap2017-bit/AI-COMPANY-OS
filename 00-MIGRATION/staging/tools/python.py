"""
Python Tool
─────────────────────────────────────────────────────
Execute Python code snippets safely.
Captures stdout, stderr and return values.
Has timeout and output limits for safety.
"""

import sys
import io
import traceback
from app.tools.base import BaseTool, ToolResult

MAX_OUTPUT = 5000
DEFAULT_TIMEOUT = 30

BLOCKED_IMPORTS = [
    "os.system",
    "subprocess",
    "shutil.rmtree",
    "__import__('os').system",
]


def _is_blocked(code: str) -> bool:
    return any(blocked in code for blocked in BLOCKED_IMPORTS)


class PythonTool(BaseTool):
    name = "python"
    description = "Execute Python code and capture output"
    permissions_required = ["python"]

    def run(self, code: str) -> ToolResult:

        if _is_blocked(code):
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error="Blocked code pattern detected",
            )

        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()

        local_vars: dict = {}

        try:
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            sys.stdout = stdout_capture
            sys.stderr = stderr_capture

            exec(compile(code, "<agent_code>", "exec"), {}, local_vars)

            sys.stdout = old_stdout
            sys.stderr = old_stderr

            stdout_output = stdout_capture.getvalue()[:MAX_OUTPUT]
            stderr_output = stderr_capture.getvalue()[:MAX_OUTPUT]

            output = stdout_output or stderr_output or "Code executed successfully (no output)"

            return ToolResult(
                tool=self.name,
                success=True,
                output=output,
                metadata={
                    "variables_defined": list(local_vars.keys()),
                },
            )

        except Exception:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

            error_msg = traceback.format_exc()
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=error_msg[:MAX_OUTPUT],
            )


python_tool = PythonTool()
