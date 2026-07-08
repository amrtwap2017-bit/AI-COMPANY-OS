"""
Reviewer Agent — Code Quality Scorer
======================================
Scores generated code against quality criteria.

Scoring dimensions:
  architecture_score    — DDD, Clean Architecture, SOLID
  security_score        — OWASP patterns, injection risks, secrets
  performance_score     — N+1 queries, missing indexes, large payloads
  test_coverage_score   — from TesterAgent results
  code_smells_score     — long methods, god classes, deep nesting
  doc_completeness_score — docstrings, type hints, comments
  hallucination_index   — undefined refs, impossible imports

Quality Gate: overall_score >= 65.0 to pass
"""

from __future__ import annotations

import ast
import re
from pathlib import Path
from typing import Any


class ReviewerAgent:
    """
    Evaluates generated code quality and enforces the quality gate.
    """

    agent_id = "reviewer"
    capabilities = ["code_review", "architecture_review", "quality_scoring"]
    QUALITY_GATE_THRESHOLD = 65.0

    async def score(
        self,
        code: str,
        language: str,
        test_result: dict[str, Any] | None = None,
        context_pack: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Score the generated code across all quality dimensions.
        Returns the full quality scorecard.
        """
        if language == "python":
            scores = self._score_python(code)
        else:
            scores = self._score_generic(code, language)

        # Apply test coverage score from TesterAgent
        if test_result:
            scores["test_coverage_score"] = min(
                test_result.get("coverage", 0.0), 100.0
            )
        else:
            scores["test_coverage_score"] = 0.0

        # Apply context-based score adjustments
        if context_pack:
            criteria = context_pack.get("task", {}).get("acceptance_criteria", {})
            min_arch = criteria.get("architecture_score_minimum", 0.0)
            if scores["architecture_score"] < min_arch:
                scores["architecture_score"] = max(
                    scores["architecture_score"],
                    min_arch * 0.7,  # partial credit
                )

        # Compute overall
        overall = (
            scores["architecture_score"] * 0.25 +
            scores["security_score"] * 0.20 +
            scores["performance_score"] * 0.15 +
            scores["test_coverage_score"] * 0.15 +
            scores["code_smells_score"] * 0.10 +
            scores["doc_completeness_score"] * 0.10 +
            (100.0 - scores["hallucination_index"]) * 0.05
        )

        scores["overall_score"] = round(min(overall, 100.0), 2)
        scores["passed_gate"] = scores["overall_score"] >= self.QUALITY_GATE_THRESHOLD
        scores["threshold"] = self.QUALITY_GATE_THRESHOLD

        return scores

    def _score_python(self, code: str) -> dict[str, float]:
        """Score Python code with static analysis."""
        scores = {
            "architecture_score": 50.0,
            "security_score": 60.0,
            "performance_score": 70.0,
            "test_coverage_score": 0.0,
            "code_smells_score": 60.0,
            "doc_completeness_score": 40.0,
            "hallucination_index": 5.0,
        }

        if not code or len(code.strip()) < 20:
            return scores

        # Architecture scoring
        arch = 50.0
        if "class " in code:
            arch += 10.0
        if "def " in code or "async def " in code:
            arch += 10.0
        if any(p in code for p in ["Repository", "Service", "Controller", "Router"]):
            arch += 10.0
        if "from " in code and "import " in code:
            arch += 5.0
        if "workspace_id" in code:
            arch += 5.0  # Multi-tenancy awareness
        if "__init__" in code:
            arch += 5.0
        if "Protocol" in code or "ABC" in code:
            arch += 5.0
        scores["architecture_score"] = min(arch, 100.0)

        # Security scoring
        sec = 60.0
        if "password" in code.lower() and (
            '= "' in code or "= '" in code
        ):
            sec -= 30.0  # Hardcoded password
        if "eval(" in code:
            sec -= 20.0
        if "exec(" in code:
            sec -= 15.0
        if "os.system(" in code:
            sec -= 10.0
        if "workspace_id" in code:
            sec += 10.0  # Workspace isolation
        if "HTTPException" in code or "raise " in code:
            sec += 10.0
        if "try:" in code and "except" in code:
            sec += 10.0
        scores["security_score"] = max(min(sec, 100.0), 0.0)

        # Performance scoring
        perf = 70.0
        lines = code.split("\n")
        for i, line in enumerate(lines):
            if "for " in line and "select" in code.lower():
                perf -= 5.0  # Possible N+1
        if "limit" in code.lower() or "LIMIT" in code:
            perf += 10.0
        if "index" in code.lower():
            perf += 5.0
        if "cache" in code.lower():
            perf += 5.0
        scores["performance_score"] = max(min(perf, 100.0), 0.0)

        # Code smells
        smells = 70.0
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    # Long methods
                    if hasattr(node, "end_lineno") and hasattr(node, "lineno"):
                        length = node.end_lineno - node.lineno
                        if length > 50:
                            smells -= 10.0
                        elif length > 30:
                            smells -= 5.0
                    # Too many args
                    if len(node.args.args) > 7:
                        smells -= 5.0
        except SyntaxError:
            smells -= 20.0  # Code has syntax errors
        scores["code_smells_score"] = max(min(smells, 100.0), 0.0)

        # Documentation
        docs = 40.0
        if '"""' in code or "'''" in code:
            docs += 25.0
        if "# " in code:
            docs += 10.0
        type_hints = len(re.findall(r"-> |: str|: int|: bool|: list|: dict|: UUID", code))
        docs += min(type_hints * 3, 25.0)
        scores["doc_completeness_score"] = min(docs, 100.0)

        # Hallucination detection
        hall = 5.0
        # Check for obviously wrong imports
        import_lines = [l for l in code.split("\n") if l.startswith("import ") or l.startswith("from ")]
        suspicious_modules = {"fastapi2", "pydantic3", "sqlmodel2", "nextjs"}
        for line in import_lines:
            for mod in suspicious_modules:
                if mod in line:
                    hall += 20.0
        scores["hallucination_index"] = min(hall, 50.0)

        return scores

    def _score_generic(self, code: str, language: str) -> dict[str, float]:
        """Score non-Python code with generic heuristics."""
        base = 60.0
        scores = {
            "architecture_score": base,
            "security_score": base,
            "performance_score": base,
            "test_coverage_score": 0.0,
            "code_smells_score": base,
            "doc_completeness_score": base,
            "hallucination_index": 5.0,
        }

        if language == "typescript":
            if "interface " in code or "type " in code:
                scores["architecture_score"] += 15.0
            if "@Injectable" in code:
                scores["architecture_score"] += 10.0
            if "@Controller" in code:
                scores["architecture_score"] += 5.0
            if "private readonly" in code:
                scores["architecture_score"] += 5.0
            if "///" in code or "/** " in code:
                scores["doc_completeness_score"] += 20.0

        return scores

    def generate_feedback(self, scores: dict[str, Any]) -> str:
        """Generate human-readable feedback from scores."""
        lines = []
        overall = scores.get("overall_score", 0)
        passed = scores.get("passed_gate", False)

        lines.append(f"Overall: {overall:.1f}/100 — {'PASSED' if passed else 'FAILED'}")
        lines.append(f"Architecture: {scores.get('architecture_score', 0):.1f}")
        lines.append(f"Security: {scores.get('security_score', 0):.1f}")
        lines.append(f"Performance: {scores.get('performance_score', 0):.1f}")
        lines.append(f"Test Coverage: {scores.get('test_coverage_score', 0):.1f}")
        lines.append(f"Code Smells: {scores.get('code_smells_score', 0):.1f}")
        lines.append(f"Documentation: {scores.get('doc_completeness_score', 0):.1f}")

        if not passed:
            lines.append("")
            lines.append("Improvements needed:")
            if scores.get("architecture_score", 0) < 65:
                lines.append("  - Add service/repository separation")
            if scores.get("security_score", 0) < 65:
                lines.append("  - Add workspace_id isolation to all queries")
            if scores.get("doc_completeness_score", 0) < 65:
                lines.append("  - Add docstrings and type hints")

        return "\n".join(lines)
