"""
Fix Loop — Self-Healing Engine
===============================
When tests fail, the Fix Loop:
1. Reads the test failure output
2. Extracts specific error messages
3. Builds a targeted fix prompt
4. Calls the Developer Agent with error context
5. Overwrites the code file with the fix
6. Re-runs tests
7. Repeats up to MAX_RETRIES times

This is what makes the system truly autonomous:
A task does not fail until the fix loop exhausts all retries.
Every failure is stored as a permanent failure memory.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import httpx


MAX_RETRIES = 5


class FixLoop:
    """
    Self-healing engine for failed code generation.
    Called by ExecutionEngine when tests fail.
    """

    def __init__(self) -> None:
        self._ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    async def attempt_fix(
        self,
        context_pack: dict[str, Any],
        current_code: str,
        code_file_path: str,
        test_result: dict[str, Any],
        attempt: int,
        language: str = "python",
    ) -> dict[str, Any]:
        """
        Attempt to fix code that failed tests.

        Args:
            context_pack:   Full context from context_packs.py
            current_code:   The code that failed
            code_file_path: Where to write the fixed code
            test_result:    Output from TesterAgent
            attempt:        Which retry this is (1-5)
            language:       python, typescript, etc.

        Returns:
            {
                "fixed_code": str,
                "fix_applied": bool,
                "fix_description": str,
                "attempt": int,
            }
        """
        task = context_pack["task"]
        failures = test_result.get("failures", [])
        test_output = test_result.get("output", "")

        # Build fix prompt
        prompt = self._build_fix_prompt(
            task=task,
            current_code=current_code,
            failures=failures,
            test_output=test_output,
            attempt=attempt,
            language=language,
        )

        # Call model for fix
        fixed_code = await self._call_model(prompt, language)

        if fixed_code and len(fixed_code) > 50:
            # Write the fix
            Path(code_file_path).write_text(fixed_code, encoding="utf-8")
            return {
                "fixed_code": fixed_code,
                "fix_applied": True,
                "fix_description": f"Fix attempt {attempt}: addressed {len(failures)} test failures",
                "attempt": attempt,
            }

        return {
            "fixed_code": current_code,
            "fix_applied": False,
            "fix_description": f"Fix attempt {attempt}: model did not produce valid code",
            "attempt": attempt,
        }

    def _build_fix_prompt(
        self,
        task: dict,
        current_code: str,
        failures: list,
        test_output: str,
        attempt: int,
        language: str,
    ) -> str:
        """Build a targeted fix prompt from test failures."""

        failure_text = ""
        if failures:
            failure_text = "\n".join([
                f"- Test: {f.get('test', 'unknown')}\n  Error: {f.get('error', 'unknown')}"
                for f in failures[:5]
            ])
        else:
            # Use raw output if no parsed failures
            failure_text = test_output[:800]

        return f"""You are debugging and fixing code that failed tests. This is fix attempt {attempt} of {MAX_RETRIES}.

## TASK
{task['title']}

## CURRENT CODE (has bugs)
{current_code[:3000]}

## TEST FAILURES
{failure_text}

## FULL TEST OUTPUT
{test_output[:600]}

## INSTRUCTIONS
- Fix ONLY the failing issues
- Keep working code unchanged
- Do not add new features
- Ensure all imports are correct
- Ensure error handling is proper

Return the COMPLETE fixed code with all fixes applied.
Return ONLY the code, no explanations:"""

    async def _call_model(self, prompt: str, language: str) -> str:
        """Call Ollama for a fix."""
        model_id = "llama3.2:3b"
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(
                    f"{self._ollama_url}/api/generate",
                    json={
                        "model": model_id,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.05, "num_predict": 2048},
                    },
                )
                if resp.status_code == 200:
                    raw = resp.json().get("response", "")
                    return self._extract_code(raw)
        except Exception:
            pass
        return ""

    def _extract_code(self, raw: str) -> str:
        import re
        patterns = [
            r"```(?:python|typescript|javascript)?\n(.*?)```",
            r"```\n(.*?)```",
        ]
        for pattern in patterns:
            match = re.search(pattern, raw, re.DOTALL)
            if match:
                return match.group(1).strip()
        return raw.strip()
