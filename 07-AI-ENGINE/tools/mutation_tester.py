"""
app/tools/mutation_tester.py
────────────────────────────────────────────────────────────────
Mutation Testing Tool — Verify test suite quality.

Mutation testing answers: "Do your tests actually catch bugs?"

Process:
  1. Take working code + passing tests
  2. Introduce small "mutations" (bugs) into the code
  3. Run tests against mutated code
  4. If tests still pass → tests are WEAK (they missed the bug)
  5. If tests fail → tests are STRONG (they caught the mutation)

Mutation score = mutations_caught / total_mutations * 100
"""

from __future__ import annotations

import re
import logging
import tempfile
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

from tools.base import BaseTool, ToolResult
from tools.shell import shell_tool

log = logging.getLogger(__name__)

MAX_MUTATIONS = 20   # limit for performance


@dataclass
class Mutation:
    id:          str
    description: str
    original:    str
    mutated:     str
    line_number: int
    detected:    bool | None = None  # None = not tested yet


@dataclass
class MutationReport:
    total_mutations:  int
    detected:         int
    survived:         int
    mutation_score:   float    # 0-100
    grade:            str      # excellent/good/fair/poor
    mutations:        list[Mutation]
    weak_areas:       list[str]
    recommendations:  list[str]


# Mutation operators
MUTATION_OPERATORS = [
    # Arithmetic mutations
    {"pattern": r"\+", "replacement": "-", "description": "Replace + with -"},
    {"pattern": r"\-", "replacement": "+", "description": "Replace - with +"},
    {"pattern": r"\*", "replacement": "/", "description": "Replace * with /"},
    {"pattern": r"//", "replacement": "+", "description": "Replace // with +"},
    # Comparison mutations
    {"pattern": r"==", "replacement": "!=", "description": "Replace == with !="},
    {"pattern": r"!=", "replacement": "==", "description": "Replace != with =="},
    {"pattern": r">=", "replacement": ">",  "description": "Replace >= with >"},
    {"pattern": r"<=", "replacement": "<",  "description": "Replace <= with <"},
    {"pattern": r"\bTrue\b",  "replacement": "False", "description": "Replace True with False"},
    {"pattern": r"\bFalse\b", "replacement": "True",  "description": "Replace False with True"},
    # Return value mutations
    {"pattern": r"\breturn None\b", "replacement": "return 0",  "description": "Replace return None with return 0"},
    {"pattern": r"\breturn 0\b",    "replacement": "return 1",  "description": "Replace return 0 with return 1"},
    {"pattern": r"\breturn True\b", "replacement": "return False", "description": "Replace return True with False"},
    # Logic mutations
    {"pattern": r"\band\b", "replacement": "or",  "description": "Replace and with or"},
    {"pattern": r"\bor\b",  "replacement": "and", "description": "Replace or with and"},
    {"pattern": r"\bnot\b", "replacement": "",    "description": "Remove not operator"},
]


class MutationTesterTool(BaseTool):
    name        = "mutation_tester"
    description = (
        "Verifies test suite quality using mutation testing. "
        "Introduces small bugs into code and checks if tests catch them. "
        "High mutation score = strong tests. Low score = weak tests need improvement."
    )
    permissions_required = []

    def run(
        self,
        code:      str,
        tests:     str,
        max_mutations: int = MAX_MUTATIONS,
        timeout_s: int = 30,
    ) -> ToolResult:
        """
        Run mutation testing.

        Args:
            code:          Source code to mutate
            tests:         Test file content
            max_mutations: Max mutations to test
            timeout_s:     Timeout per test run

        Returns:
            ToolResult with MutationReport
        """
        try:
            report = self._run_mutations(code, tests, max_mutations, timeout_s)

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "total_mutations": report.total_mutations,
                    "detected":        report.detected,
                    "survived":        report.survived,
                    "mutation_score":  report.mutation_score,
                    "grade":           report.grade,
                    "weak_areas":      report.weak_areas,
                    "recommendations": report.recommendations,
                    "mutations": [
                        {
                            "id":          m.id,
                            "description": m.description,
                            "line":        m.line_number,
                            "detected":    m.detected,
                        }
                        for m in report.mutations
                    ],
                    "summary": (
                        f"Mutation score: {report.mutation_score:.0f}% ({report.grade}). "
                        f"{report.detected}/{report.total_mutations} mutations caught."
                    ),
                },
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _run_mutations(
        self,
        code:      str,
        tests:     str,
        max_muts:  int,
        timeout_s: int,
    ) -> MutationReport:
        mutations = self._generate_mutations(code, max_muts)

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)

            # Write test file
            test_file = tmp / "test_solution.py"
            test_file.write_text(tests, encoding="utf-8")

            detected   = 0
            tested_mutations: list[Mutation] = []

            for mutation in mutations:
                # Write mutated code
                code_file = tmp / "solution.py"
                code_file.write_text(mutation.mutated, encoding="utf-8")

                # Run tests
                result = shell_tool.run(
                    command="python3 -m pytest test_solution.py -x -q --tb=no 2>&1",
                    timeout=timeout_s,
                    working_dir=str(tmp),
                )

                # If tests FAIL → mutation was DETECTED (good!)
                mutation.detected = not result.success
                if mutation.detected:
                    detected += 1

                tested_mutations.append(mutation)

        survived    = len(tested_mutations) - detected
        score       = (detected / max(len(tested_mutations), 1)) * 100
        grade       = (
            "excellent" if score >= 90 else
            "good"      if score >= 75 else
            "fair"      if score >= 60 else
            "poor"
        )

        # Find weak areas (survived mutations)
        survived_muts = [m for m in tested_mutations if not m.detected]
        weak_areas = list({m.description.split(" ")[2] for m in survived_muts})[:5]

        recommendations = []
        if score < 75:
            recommendations.append("Add assertions that check exact return values")
        if any("==" in m.description for m in survived_muts):
            recommendations.append("Add tests for equality boundaries")
        if any("True" in m.description or "False" in m.description for m in survived_muts):
            recommendations.append("Add tests for boolean edge cases")
        if any("return" in m.description for m in survived_muts):
            recommendations.append("Assert on return values explicitly")

        return MutationReport(
            total_mutations=len(tested_mutations),
            detected=detected,
            survived=survived,
            mutation_score=round(score, 1),
            grade=grade,
            mutations=tested_mutations,
            weak_areas=weak_areas,
            recommendations=recommendations or ["Test suite looks strong!"],
        )

    def _generate_mutations(self, code: str, max_muts: int) -> list[Mutation]:
        mutations: list[Mutation] = []
        lines = code.split("\n")
        mut_id = 0

        for op in MUTATION_OPERATORS:
            if len(mutations) >= max_muts:
                break

            for line_num, line in enumerate(lines):
                if len(mutations) >= max_muts:
                    break

                # Skip comments and strings
                stripped = line.strip()
                if stripped.startswith("#") or stripped.startswith('"""'):
                    continue

                match = re.search(op["pattern"], line)
                if match:
                    mutated_line = re.sub(
                        op["pattern"],
                        op["replacement"],
                        line,
                        count=1,
                    )
                    if mutated_line != line:
                        mutated_lines = lines.copy()
                        mutated_lines[line_num] = mutated_line
                        mut_id += 1
                        mutations.append(Mutation(
                            id=f"M{mut_id:03d}",
                            description=op["description"],
                            original=line,
                            mutated=mutated_line,
                            line_number=line_num + 1,
                        ))

        return mutations


mutation_tester_tool = MutationTesterTool()
