"""
app/tools/code_validator.py
────────────────────────────────────────────────────────────────
Static Code Analysis Tool.

Runs multiple analyzers before execution to catch issues early:
  - pylint:  Style, errors, conventions
  - mypy:    Type checking
  - bandit:  Security vulnerabilities
  - radon:   Complexity metrics

Returns structured report with severity levels.
Reduces code execution iterations by catching obvious errors first.
"""

from __future__ import annotations

import subprocess
import tempfile
import logging
import json
from pathlib import Path

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


class CodeValidatorTool(BaseTool):
    name        = "code_validator"
    description = (
        "Static analysis before running code. Catches syntax errors, "
        "type mismatches, security vulnerabilities, and complexity issues. "
        "Use before code_execution to reduce failed attempts."
    )
    permissions_required = []

    def run(
        self,
        code:     str,
        language: str  = "python",
        checks:   list[str] | None = None,
    ) -> ToolResult:
        """
        Validate code with static analysis.

        Args:
            code:     Source code to validate
            language: python | javascript
            checks:   List of checks: pylint, mypy, bandit, radon
                      Default: all available

        Returns:
            ToolResult with validation report
        """
        if language != "python":
            return self._validate_js(code) if language in ("javascript", "typescript") \
                   else ToolResult(
                       tool=self.name, success=True,
                       output={"message": f"No static analysis for {language}"},
                   )

        checks = checks or ["pylint", "bandit", "radon"]

        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
            f.write(code)
            tmpfile = f.name

        try:
            results = {}

            if "pylint" in checks:
                results["pylint"] = self._run_pylint(tmpfile)

            if "mypy" in checks:
                results["mypy"] = self._run_mypy(tmpfile)

            if "bandit" in checks:
                results["bandit"] = self._run_bandit(tmpfile)

            if "radon" in checks:
                results["radon"] = self._run_radon(tmpfile)

            # Overall verdict
            errors   = sum(r.get("errors", 0) for r in results.values() if r)
            warnings = sum(r.get("warnings", 0) for r in results.values() if r)
            security = results.get("bandit", {}).get("high_severity", 0)

            verdict = "pass"
            if security > 0:
                verdict = "security_issues"
            elif errors > 0:
                verdict = "errors"
            elif warnings > 5:
                verdict = "warnings"

            return ToolResult(
                tool=self.name,
                success=(verdict in ("pass", "warnings")),
                output={
                    "verdict":   verdict,
                    "errors":    errors,
                    "warnings":  warnings,
                    "security":  security,
                    "results":   results,
                    "recommendation": self._recommend(verdict, errors, warnings, security),
                },
                metadata={"language": language, "checks": checks},
            )

        finally:
            Path(tmpfile).unlink(missing_ok=True)

    def _run_pylint(self, filepath: str) -> dict:
        try:
            result = subprocess.run(
                ["python3", "-m", "pylint", filepath,
                 "--output-format=json", "--score=no"],
                capture_output=True, text=True, timeout=30,
            )
            messages = json.loads(result.stdout) if result.stdout.strip() else []
            errors   = sum(1 for m in messages if m.get("type") in ("error", "fatal"))
            warnings = sum(1 for m in messages if m.get("type") == "warning")
            return {
                "errors":   errors,
                "warnings": warnings,
                "messages": [
                    f"[{m['type'].upper()}] {m['symbol']}: {m['message']}"
                    for m in messages[:10]
                ],
            }
        except Exception as exc:
            return {"error": str(exc), "errors": 0, "warnings": 0, "messages": []}

    def _run_mypy(self, filepath: str) -> dict:
        try:
            result = subprocess.run(
                ["python3", "-m", "mypy", filepath, "--ignore-missing-imports"],
                capture_output=True, text=True, timeout=30,
            )
            lines  = result.stdout.strip().split("\n") if result.stdout else []
            errors = sum(1 for l in lines if "error:" in l)
            return {
                "errors":   errors,
                "warnings": 0,
                "messages": [l for l in lines if "error:" in l][:5],
            }
        except Exception as exc:
            return {"error": str(exc), "errors": 0, "warnings": 0, "messages": []}

    def _run_bandit(self, filepath: str) -> dict:
        try:
            result = subprocess.run(
                ["python3", "-m", "bandit", "-f", "json", filepath],
                capture_output=True, text=True, timeout=30,
            )
            data   = json.loads(result.stdout) if result.stdout.strip() else {}
            issues = data.get("results", [])
            high   = sum(1 for i in issues if i.get("issue_severity") == "HIGH")
            medium = sum(1 for i in issues if i.get("issue_severity") == "MEDIUM")
            return {
                "errors":        0,
                "warnings":      high + medium,
                "high_severity": high,
                "med_severity":  medium,
                "messages": [
                    f"[{i['issue_severity']}] {i['issue_text']}"
                    for i in issues[:5]
                ],
            }
        except Exception as exc:
            return {"error": str(exc), "errors": 0, "warnings": 0, "high_severity": 0, "messages": []}

    def _run_radon(self, filepath: str) -> dict:
        try:
            result = subprocess.run(
                ["python3", "-m", "radon", "cc", filepath, "-s", "-j"],
                capture_output=True, text=True, timeout=30,
            )
            data  = json.loads(result.stdout) if result.stdout.strip() else {}
            funcs = []
            for file_data in data.values():
                for item in file_data:
                    if isinstance(item, dict):
                        funcs.append({
                            "name":       item.get("name"),
                            "complexity": item.get("complexity"),
                            "rank":       item.get("rank"),
                        })
            high_complexity = [f for f in funcs if (f.get("complexity") or 0) > 10]
            return {
                "errors":          0,
                "warnings":        len(high_complexity),
                "functions":       funcs[:10],
                "high_complexity": high_complexity,
                "messages": [
                    f"High complexity: {f['name']} (CC={f['complexity']})"
                    for f in high_complexity[:3]
                ],
            }
        except Exception as exc:
            return {"error": str(exc), "errors": 0, "warnings": 0, "messages": []}

    def _validate_js(self, code: str) -> ToolResult:
        """Basic JS validation."""
        issues = []
        if "eval(" in code:
            issues.append("[SECURITY] eval() usage detected")
        if "innerHTML" in code:
            issues.append("[SECURITY] innerHTML can cause XSS")
        if "var " in code:
            issues.append("[STYLE] Use const/let instead of var")

        return ToolResult(
            tool=self.name,
            success=len(issues) == 0,
            output={
                "verdict":  "warnings" if issues else "pass",
                "messages": issues,
                "warnings": len(issues),
                "errors":   0,
            },
        )

    def _recommend(
        self,
        verdict:  str,
        errors:   int,
        warnings: int,
        security: int,
    ) -> str:
        if security > 0:
            return f"STOP: Fix {security} security issue(s) before running"
        if errors > 0:
            return f"Fix {errors} error(s) before running"
        if warnings > 5:
            return f"Consider fixing {warnings} warning(s) for code quality"
        return "Code looks good — safe to run"


code_validator_tool = CodeValidatorTool()
