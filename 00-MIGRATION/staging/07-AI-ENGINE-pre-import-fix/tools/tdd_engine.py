"""
app/tools/tdd_engine.py
────────────────────────────────────────────────────────────────
Test-Driven Development Engine.

Pipeline:
  1. Tester agent writes pytest tests for the requirement
  2. Save tests to file
  3. Run pytest → ALL tests fail (expected — no implementation)
  4. Backend agent writes implementation to make tests pass
  5. Run pytest → check results
  6. If tests fail: backend fixes implementation
  7. Repeat until all tests pass or max_iterations reached

This enforces TDD: tests define correctness, code must satisfy them.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from pathlib import Path
import re

from app.tools.shell import shell_tool
from app.tools.code_execution import CodeExecutionEngine, WORKSPACE_ROOT

log = logging.getLogger(__name__)

MAX_IMPL_ITERATIONS = 5


@dataclass
class TestRun:
    """Result of one pytest execution."""
    iteration:   int
    passed:      int
    failed:      int
    errors:      int
    total:       int
    output:      str
    success:     bool
    duration_s:  float


@dataclass
class TDDResult:
    """Full TDD cycle result."""
    success:         bool
    tests_written:   str           # the test file content
    implementation:  str           # final implementation
    test_runs:       list[TestRun]
    working_dir:     str
    total_duration:  float
    error:           str | None = None


class TDDEngine:

    def __init__(self) -> None:
        self._exec = CodeExecutionEngine()

    def run(
        self,
        requirement:    str,
        module_name:    str           = "solution",
        language:       str           = "python",
        test_agent:     str           = "tester",
        impl_agent:     str           = "backend",
        max_iterations: int           = MAX_IMPL_ITERATIONS,
    ) -> TDDResult:
        """
        Run a full TDD cycle.

        Args:
            requirement:  What the code should do
            module_name:  Name of the module to create
            language:     Programming language (python only fully supported)
            test_agent:   Agent that writes tests
            impl_agent:   Agent that writes implementation
            max_iterations: Max fix attempts for implementation
        """
        start_time  = time.time()
        work_dir    = self._exec._create_workspace(f"tdd_{module_name}")
        test_file   = work_dir / f"test_{module_name}.py"
        impl_file   = work_dir / f"{module_name}.py"
        test_runs:  list[TestRun] = []

        log.info("TDD cycle starting: %s", requirement[:60])

        # ── Step 1: Write tests ───────────────────────────────────
        log.info("Step 1: Tester agent writing tests...")
        tests_content = self._write_tests(
            test_agent=test_agent,
            requirement=requirement,
            module_name=module_name,
        )

        if not tests_content:
            return TDDResult(
                success=False,
                tests_written="",
                implementation="",
                test_runs=[],
                working_dir=str(work_dir),
                total_duration=time.time() - start_time,
                error="Test generation failed",
            )

        test_file.write_text(tests_content, encoding="utf-8")

        # ── Step 2: Verify tests fail (no implementation yet) ─────
        run0 = self._run_tests(work_dir, 0)
        test_runs.append(run0)
        log.info(
            "Initial run (expected fail): passed=%d failed=%d",
            run0.passed, run0.failed,
        )

        # ── Step 3: Implementation loop ───────────────────────────
        impl_content = None

        for iteration in range(1, max_iterations + 1):
            log.info("Iteration %d: writing implementation...", iteration)

            impl_content = self._write_implementation(
                impl_agent=impl_agent,
                requirement=requirement,
                module_name=module_name,
                tests_content=tests_content,
                previous_impl=impl_content,
                last_run=test_runs[-1],
                iteration=iteration,
            )

            if not impl_content:
                continue

            impl_file.write_text(impl_content, encoding="utf-8")

            run = self._run_tests(work_dir, iteration)
            test_runs.append(run)

            log.info(
                "Iteration %d: passed=%d failed=%d total=%d",
                iteration, run.passed, run.failed, run.total,
            )

            if run.success:
                log.info("All tests passed on iteration %d!", iteration)
                break

        final_run  = test_runs[-1]
        total_time = round(time.time() - start_time, 2)

        return TDDResult(
            success=final_run.success,
            tests_written=tests_content,
            implementation=impl_content or "",
            test_runs=test_runs,
            working_dir=str(work_dir),
            total_duration=total_time,
            error=None if final_run.success else f"Tests still failing after {max_iterations} attempts",
        )

    def _write_tests(
        self,
        test_agent:  str,
        requirement: str,
        module_name: str,
    ) -> str:
        try:
            from app.orchestrator.manager import orchestrator

            prompt = (
                f"Write pytest tests for this requirement:\n\n"
                f"{requirement}\n\n"
                f"The implementation will be in a module called '{module_name}.py'.\n"
                f"Import it as: from {module_name} import ...\n\n"
                f"Rules:\n"
                f"1. Write at least 3 test functions starting with test_\n"
                f"2. Cover: happy path, edge cases, error cases\n"
                f"3. Use pytest assertions (assert, pytest.raises)\n"
                f"4. Return ONLY Python test code, no explanation\n"
                f"5. Do NOT include the implementation"
            )

            result = orchestrator.run(
                agent_name=test_agent,
                user_input=prompt,
                use_memory=False,
                use_knowledge=False,
            )

            if result.success:
                return self._extract_code_block(result.content)
            return ""

        except Exception as exc:
            log.error("Test generation failed: %s", exc)
            return ""

    def _write_implementation(
        self,
        impl_agent:    str,
        requirement:   str,
        module_name:   str,
        tests_content: str,
        previous_impl: str | None,
        last_run:      TestRun,
        iteration:     int,
    ) -> str:
        try:
            from app.orchestrator.manager import orchestrator

            if iteration == 1:
                prompt = (
                    f"Implement Python code in module '{module_name}.py' to satisfy these tests:\n\n"
                    f"REQUIREMENT: {requirement}\n\n"
                    f"TESTS TO PASS:\n{tests_content}\n\n"
                    f"Rules:\n"
                    f"1. Return ONLY the implementation code\n"
                    f"2. Do NOT include the test code\n"
                    f"3. Make all tests pass"
                )
            else:
                prompt = (
                    f"Fix the implementation to make all tests pass.\n\n"
                    f"REQUIREMENT: {requirement}\n\n"
                    f"TESTS:\n{tests_content}\n\n"
                    f"CURRENT IMPLEMENTATION:\n{previous_impl}\n\n"
                    f"TEST OUTPUT (showing failures):\n{last_run.output[-2000:]}\n\n"
                    f"Fix the implementation. Return ONLY the corrected code."
                )

            result = orchestrator.run(
                agent_name=impl_agent,
                user_input=prompt,
                use_memory=False,
                use_knowledge=False,
            )

            if result.success:
                return self._extract_code_block(result.content)
            return previous_impl or ""

        except Exception as exc:
            log.error("Implementation generation failed: %s", exc)
            return previous_impl or ""

    def _run_tests(self, work_dir: Path, iteration: int) -> TestRun:
        """Run pytest in the working directory."""
        start  = time.time()
        result = shell_tool.run(
            command="python3 -m pytest -v --tb=short --no-header 2>&1",
            timeout=60,
            working_dir=str(work_dir),
        )
        duration = time.time() - start

        output   = result.output or result.error or ""
        passed   = self._parse_count(output, r"(\d+) passed")
        failed   = self._parse_count(output, r"(\d+) failed")
        errors   = self._parse_count(output, r"(\d+) error")
        total    = passed + failed + errors

        return TestRun(
            iteration=iteration,
            passed=passed,
            failed=failed,
            errors=errors,
            total=total,
            output=output,
            success=(failed == 0 and errors == 0 and total > 0),
            duration_s=round(duration, 2),
        )

    def _parse_count(self, output: str, pattern: str) -> int:
        match = re.search(pattern, output)
        return int(match.group(1)) if match else 0

    def _extract_code_block(self, content: str) -> str:
        match = re.search(r"```(?:python)?\s*(.*?)```", content, re.DOTALL)
        if match:
            return match.group(1).strip()
        return content.strip()


tdd_engine = TDDEngine()
