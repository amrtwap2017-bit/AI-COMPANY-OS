"""
app/tools/code_execution.py
────────────────────────────────────────────────────────────────
Code Execution Feedback Loop.

The most important sprint for software automation.
Closes the gap between "AI thinks about code" and
"AI writes code, runs it, reads errors, fixes, repeats."

Pipeline per iteration:
  1. Agent generates code (file content)
  2. Save code to temp working directory
  3. Execute via shell (python/pytest/npm/cargo/etc.)
  4. Capture stdout + stderr + exit code
  5. If failed: send error back to agent → agent rewrites
  6. If passed: return success + final output
  7. Repeat up to MAX_ITERATIONS

This is stateful — the working directory persists across
iterations so files accumulate correctly.
"""

from __future__ import annotations

import os
import logging
import tempfile
import shutil
import time
from dataclasses import dataclass, field
from pathlib import Path

from app.tools.base import BaseTool, ToolResult
from app.tools.shell import shell_tool

log = logging.getLogger(__name__)

MAX_ITERATIONS  = 8
DEFAULT_TIMEOUT = 120   # seconds per execution
WORKSPACE_ROOT  = Path.home() / "AI" / "workspace" / "code"


@dataclass
class ExecutionIteration:
    """One attempt: write + run."""
    iteration:    int
    code:         str
    filename:     str
    command:      str
    exit_code:    int
    stdout:       str
    stderr:       str
    success:      bool
    duration_s:   float


@dataclass
class CodeExecutionResult:
    """Full result of the execution loop."""
    success:         bool
    iterations:      int
    final_output:    str
    working_dir:     str
    files_created:   list[str]
    history:         list[ExecutionIteration] = field(default_factory=list)
    error:           str | None = None


class CodeExecutionEngine:
    """
    Manages the write→run→fix loop for any language.

    Usage:
        engine = CodeExecutionEngine()
        result = engine.run_loop(
            agent_name="backend",
            task="Write a Python function that sorts a list",
            language="python",
        )
    """

    def __init__(self) -> None:
        WORKSPACE_ROOT.mkdir(parents=True, exist_ok=True)

    def run_loop(
        self,
        agent_name:     str,
        task:           str,
        language:       str           = "python",
        initial_code:   str | None    = None,
        test_command:   str | None    = None,
        working_dir:    str | None    = None,
        max_iterations: int           = MAX_ITERATIONS,
        timeout_s:      int           = DEFAULT_TIMEOUT,
    ) -> CodeExecutionResult:
        """
        Run the code execution feedback loop.

        Args:
            agent_name:   Which agent writes/fixes the code
            task:         What the code should do
            language:     python | javascript | bash | typescript
            initial_code: Optional starting code (else agent generates)
            test_command: Command to run (default: python file.py)
            working_dir:  Reuse an existing working directory
            max_iterations: Max fix attempts
            timeout_s:    Timeout per execution

        Returns:
            CodeExecutionResult with success, history, final output
        """
        # Set up working directory
        if working_dir and Path(working_dir).exists():
            work_dir = Path(working_dir)
        else:
            work_dir = self._create_workspace(agent_name)

        extension   = self._language_extension(language)
        filename    = f"solution{extension}"
        filepath    = work_dir / filename
        command     = test_command or self._default_command(language, str(filepath))

        history:    list[ExecutionIteration] = []
        files_created: list[str]             = []
        current_code = initial_code

        log.info(
            "Code execution loop: agent=%s lang=%s max_iter=%d",
            agent_name, language, max_iterations,
        )

        for iteration in range(1, max_iterations + 1):
            log.info("Iteration %d/%d", iteration, max_iterations)

            # Step 1: Generate or fix code
            if current_code is None or (iteration > 1 and history[-1].exit_code != 0):
                current_code = self._generate_or_fix(
                    agent_name=agent_name,
                    task=task,
                    language=language,
                    previous_code=current_code,
                    error=history[-1].stderr if history else None,
                    iteration=iteration,
                )

            if not current_code:
                break

            # Step 2: Write code to file
            filepath.write_text(current_code, encoding="utf-8")
            if str(filepath) not in files_created:
                files_created.append(str(filepath))

            # Step 3: Execute
            start   = time.time()
            result  = shell_tool.run(
                command=command,
                timeout=timeout_s,
                working_dir=str(work_dir),
            )
            duration = time.time() - start

            iteration_result = ExecutionIteration(
                iteration=iteration,
                code=current_code,
                filename=filename,
                command=command,
                exit_code=result.metadata.get("returncode", -1),
                stdout=result.output or "",
                stderr=result.error  or "",
                success=result.success,
                duration_s=round(duration, 2),
            )
            history.append(iteration_result)

            log.info(
                "Iteration %d: exit_code=%d success=%s",
                iteration, iteration_result.exit_code, result.success,
            )

            if result.success:
                return CodeExecutionResult(
                    success=True,
                    iterations=iteration,
                    final_output=result.output or "",
                    working_dir=str(work_dir),
                    files_created=files_created,
                    history=history,
                )

        # All iterations failed
        last = history[-1] if history else None
        return CodeExecutionResult(
            success=False,
            iterations=len(history),
            final_output=last.stdout if last else "",
            working_dir=str(work_dir),
            files_created=files_created,
            history=history,
            error=last.stderr if last else "No iterations completed",
        )

    def write_and_run(
        self,
        code:        str,
        filename:    str,
        command:     str | None = None,
        working_dir: str | None = None,
        timeout_s:   int        = DEFAULT_TIMEOUT,
    ) -> ExecutionIteration:
        """
        Simple: write code to file and execute once.
        No agent involved — caller provides the code.
        """
        work_dir = Path(working_dir) if working_dir else self._create_workspace("manual")
        filepath = work_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(code, encoding="utf-8")

        cmd   = command or self._default_command_from_file(filename, str(filepath))
        start = time.time()
        result = shell_tool.run(command=cmd, timeout=timeout_s, working_dir=str(work_dir))

        return ExecutionIteration(
            iteration=1,
            code=code,
            filename=filename,
            command=cmd,
            exit_code=result.metadata.get("returncode", -1),
            stdout=result.output or "",
            stderr=result.error  or "",
            success=result.success,
            duration_s=round(time.time() - start, 2),
        )

    def _generate_or_fix(
        self,
        agent_name:    str,
        task:          str,
        language:      str,
        previous_code: str | None,
        error:         str | None,
        iteration:     int,
    ) -> str:
        """Ask the agent to write or fix code."""
        try:
            from app.orchestrator.manager import orchestrator

            if iteration == 1 or not previous_code:
                prompt = (
                    f"Write {language} code to accomplish this task:\n\n"
                    f"{task}\n\n"
                    f"Return ONLY the code, no explanation. "
                    f"The code must be complete and executable."
                )
            else:
                prompt = (
                    f"The following {language} code has an error. Fix it.\n\n"
                    f"TASK: {task}\n\n"
                    f"CURRENT CODE:\n{previous_code}\n\n"
                    f"ERROR:\n{error}\n\n"
                    f"Return ONLY the fixed code, no explanation."
                )

            result = orchestrator.run(
                agent_name=agent_name,
                user_input=prompt,
                use_memory=False,
                use_knowledge=False,
            )

            if result.success:
                return self._extract_code(result.content, language)
            return previous_code or ""

        except Exception as exc:
            log.error("Code generation failed: %s", exc)
            return previous_code or ""

    def _extract_code(self, content: str, language: str) -> str:
        """Strip markdown code blocks if present."""
        import re
        # Remove ```python ... ``` or ``` ... ```
        pattern = rf"```{language}?\s*(.*?)```"
        match   = re.search(pattern, content, re.DOTALL)
        if match:
            return match.group(1).strip()
        # If no code block, return as-is
        return content.strip()

    def _create_workspace(self, agent_name: str, project_name: str = "") -> Path:
        """Create isolated workspace per agent+project+session."""
        import hashlib
        session_id = str(int(time.time()))
        slug = project_name.lower().replace(" ", "_")[:20] if project_name else ""
        dir_name   = f"{slug}_{session_id}" if slug else session_id
        work_dir   = WORKSPACE_ROOT / agent_name / dir_name
        work_dir.mkdir(parents=True, exist_ok=True)
        return work_dir

    def _language_extension(self, language: str) -> str:
        return {
            "python":     ".py",
            "javascript": ".js",
            "typescript": ".ts",
            "bash":       ".sh",
            "rust":       ".rs",
            "go":         ".go",
        }.get(language, ".py")

    def _default_command(self, language: str, filepath: str) -> str:
        return {
            "python":     f"python3 {filepath}",
            "javascript": f"node {filepath}",
            "typescript": f"npx ts-node {filepath}",
            "bash":       f"bash {filepath}",
        }.get(language, f"python3 {filepath}")

    def _default_command_from_file(self, filename: str, filepath: str) -> str:
        ext = Path(filename).suffix
        return {
            ".py":  f"python3 {filepath}",
            ".js":  f"node {filepath}",
            ".sh":  f"bash {filepath}",
            ".ts":  f"npx ts-node {filepath}",
        }.get(ext, f"python3 {filepath}")


code_execution_engine = CodeExecutionEngine()
