"""
app/tools/quality_scorer.py
────────────────────────────────────────────────────────────────
Real-Time Quality Scorer — Instant output quality assessment.

Scores any output instantly without LLM calls:
  - Code quality (structure, completeness, patterns)
  - Documentation quality (clarity, completeness)
  - API design quality (RESTful, consistent)
  - Architecture quality (separation, patterns)

Returns 0-100 score with specific improvement suggestions.
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


@dataclass
class QualityReport:
    score:       float     # 0-100
    grade:       str       # A/B/C/D/F
    strengths:   list[str]
    weaknesses:  list[str]
    suggestions: list[str]
    breakdown:   dict[str, float]


class QualityScorerTool(BaseTool):
    name        = "quality_scorer"
    description = (
        "Instantly scores output quality 0-100 without LLM calls. "
        "Checks code structure, completeness, patterns, and best practices. "
        "Use after any agent output to get immediate quality feedback."
    )
    permissions_required = []

    def run(
        self,
        content:  str,
        content_type: str = "code",
        language: str     = "python",
    ) -> ToolResult:
        """
        Score output quality.

        Args:
            content:      The content to score
            content_type: code | documentation | api | architecture | general
            language:     python | javascript | any

        Returns:
            ToolResult with QualityReport
        """
        scorers = {
            "code":          self._score_code,
            "documentation": self._score_docs,
            "api":           self._score_api,
            "architecture":  self._score_architecture,
            "general":       self._score_general,
        }

        scorer = scorers.get(content_type, self._score_general)

        try:
            report = scorer(content, language)

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "score":       report.score,
                    "grade":       report.grade,
                    "strengths":   report.strengths,
                    "weaknesses":  report.weaknesses,
                    "suggestions": report.suggestions,
                    "breakdown":   report.breakdown,
                    "summary":     f"Score: {report.score}/100 ({report.grade}) — {report.suggestions[0] if report.suggestions else 'Good quality'}",
                },
                metadata={"content_type": content_type},
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _score_code(self, code: str, language: str) -> QualityReport:
        breakdown = {}
        strengths = []
        weaknesses = []
        suggestions = []

        # 1. Structure (25pts)
        has_functions = bool(re.search(r"\bdef \w+|function \w+|const \w+ =", code))
        has_classes   = bool(re.search(r"\bclass \w+", code))
        structure_score = 10
        if has_functions:   structure_score += 10; strengths.append("Has function definitions")
        if has_classes:     structure_score += 5;  strengths.append("Uses OOP structure")
        breakdown["structure"] = structure_score

        # 2. Error handling (20pts)
        has_try_except = bool(re.search(r"\btry\b|\bcatch\b|\bexcept\b", code))
        has_validation = bool(re.search(r"\bif\b.+\bnot\b|\bif\b.+\bNone\b|\bif\b.+\bis None\b", code))
        error_score = 5
        if has_try_except:  error_score += 10; strengths.append("Has error handling")
        if has_validation:  error_score += 5;  strengths.append("Has input validation")
        else: weaknesses.append("Missing input validation"); suggestions.append("Add input validation")
        breakdown["error_handling"] = error_score

        # 3. Documentation (15pts)
        has_docstrings = bool(re.search(r'""".*?"""', code, re.DOTALL))
        has_comments   = bool(re.search(r"#.+|//", code))
        doc_score = 0
        if has_docstrings: doc_score += 10; strengths.append("Has docstrings")
        if has_comments:   doc_score += 5;  strengths.append("Has inline comments")
        else: weaknesses.append("Missing documentation"); suggestions.append("Add docstrings to functions")
        breakdown["documentation"] = doc_score

        # 4. Type hints (15pts)
        has_types = bool(re.search(r":\s*(?:str|int|float|bool|list|dict|tuple|Optional|Union)\b", code))
        type_score = 0
        if has_types: type_score = 15; strengths.append("Uses type hints")
        else: weaknesses.append("Missing type hints"); suggestions.append("Add type annotations")
        breakdown["type_hints"] = type_score

        # 5. Code completeness (25pts)
        lines = [l for l in code.strip().split("\n") if l.strip()]
        completeness = min(25, len(lines) * 2)
        if len(lines) < 5:  weaknesses.append("Code seems incomplete"); suggestions.append("Ensure full implementation")
        breakdown["completeness"] = completeness

        total = sum(breakdown.values())
        return self._build_report(total, breakdown, strengths, weaknesses, suggestions)

    def _score_docs(self, content: str, language: str) -> QualityReport:
        breakdown = {}
        strengths = []
        weaknesses = []
        suggestions = []

        words = len(content.split())
        has_headers   = bool(re.search(r"^#{1,3}\s", content, re.MULTILINE))
        has_examples  = bool(re.search(r"```|example|Example|e\.g\.", content))
        has_steps     = bool(re.search(r"^\d+\.|^-\s|^\*\s", content, re.MULTILINE))
        has_intro     = words > 50
        has_conclusion = bool(re.search(r"conclusion|summary|note:|warning:", content, re.I))

        if has_headers:    breakdown["structure"] = 20; strengths.append("Well-structured with headers")
        else:              breakdown["structure"] = 5;  weaknesses.append("No headers"); suggestions.append("Add headers for sections")
        if has_examples:   breakdown["examples"]  = 20; strengths.append("Includes examples")
        else:              breakdown["examples"]  = 0;  weaknesses.append("No examples"); suggestions.append("Add code examples")
        if has_steps:      breakdown["clarity"]   = 20; strengths.append("Uses lists/steps")
        else:              breakdown["clarity"]   = 10
        if has_intro:      breakdown["length"]    = 20; strengths.append("Adequate length")
        else:              breakdown["length"]    = 5;  weaknesses.append("Too brief")
        if has_conclusion: breakdown["complete"]  = 20; strengths.append("Has conclusion/notes")
        else:              breakdown["complete"]  = 10

        total = sum(breakdown.values())
        return self._build_report(total, breakdown, strengths, weaknesses, suggestions)

    def _score_api(self, content: str, language: str) -> QualityReport:
        breakdown = {}
        strengths = []
        weaknesses = []
        suggestions = []

        has_endpoints   = bool(re.search(r"GET|POST|PUT|DELETE|PATCH", content))
        has_status      = bool(re.search(r"200|201|400|404|422|500", content))
        has_auth        = bool(re.search(r"auth|token|bearer|api.?key", content, re.I))
        has_versioning  = bool(re.search(r"/v\d|api/v\d", content))
        has_validation  = bool(re.search(r"validate|schema|required|optional", content, re.I))
        has_error_resp  = bool(re.search(r"error|message|detail", content, re.I))

        if has_endpoints:  breakdown["endpoints"]  = 20; strengths.append("RESTful endpoints defined")
        else:              breakdown["endpoints"]  = 5;  weaknesses.append("No clear endpoints")
        if has_status:     breakdown["status"]     = 15; strengths.append("Uses HTTP status codes")
        else:              breakdown["status"]     = 0;  suggestions.append("Add HTTP status codes")
        if has_auth:       breakdown["security"]   = 20; strengths.append("Authentication present")
        else:              breakdown["security"]   = 5;  weaknesses.append("No auth"); suggestions.append("Add authentication")
        if has_versioning: breakdown["versioning"] = 15; strengths.append("API versioning")
        else:              breakdown["versioning"] = 5;  suggestions.append("Add API versioning /v1/")
        if has_validation: breakdown["validation"] = 15; strengths.append("Input validation")
        else:              breakdown["validation"] = 5;  suggestions.append("Add request validation")
        if has_error_resp: breakdown["errors"]     = 15; strengths.append("Error responses defined")
        else:              breakdown["errors"]     = 0;  suggestions.append("Define error response format")

        total = sum(breakdown.values())
        return self._build_report(total, breakdown, strengths, weaknesses, suggestions)

    def _score_architecture(self, content: str, language: str) -> QualityReport:
        breakdown = {}
        strengths = []
        weaknesses = []
        suggestions = []

        has_layers    = bool(re.search(r"layer|tier|service|repository|controller", content, re.I))
        has_db        = bool(re.search(r"database|postgres|mysql|mongodb|redis", content, re.I))
        has_security  = bool(re.search(r"auth|security|encrypt|jwt|ssl|tls", content, re.I))
        has_scale     = bool(re.search(r"scale|load|performance|cache|queue", content, re.I))
        has_monitoring= bool(re.search(r"monitor|log|metric|alert|health", content, re.I))

        if has_layers:    breakdown["structure"]   = 25; strengths.append("Clear architectural layers")
        else:             breakdown["structure"]   = 10; weaknesses.append("No clear layers")
        if has_db:        breakdown["persistence"] = 20; strengths.append("Data persistence considered")
        else:             breakdown["persistence"] = 5;  weaknesses.append("No database design")
        if has_security:  breakdown["security"]    = 20; strengths.append("Security addressed")
        else:             breakdown["security"]    = 5;  weaknesses.append("Security not addressed"); suggestions.append("Add security architecture")
        if has_scale:     breakdown["scalability"] = 20; strengths.append("Scalability considered")
        else:             breakdown["scalability"] = 5;  suggestions.append("Address scalability")
        if has_monitoring:breakdown["observability"]= 15; strengths.append("Monitoring included")
        else:             breakdown["observability"]= 0;  suggestions.append("Add monitoring strategy")

        total = sum(breakdown.values())
        return self._build_report(total, breakdown, strengths, weaknesses, suggestions)

    def _score_general(self, content: str, language: str) -> QualityReport:
        words     = len(content.split())
        has_struct= bool(re.search(r"^#{1,3}|\*\*|^\d+\.", content, re.MULTILINE))
        has_detail= words > 100
        has_conc  = bool(re.search(r"conclusion|summary|therefore|in summary", content, re.I))

        breakdown = {
            "length":    min(40, words // 3),
            "structure": 30 if has_struct else 10,
            "detail":    20 if has_detail else 5,
            "conclusion": 10 if has_conc else 0,
        }
        strengths   = []
        weaknesses  = []
        suggestions = []
        if has_struct:  strengths.append("Well structured")
        else:           weaknesses.append("Needs structure"); suggestions.append("Add headers and sections")
        if has_detail:  strengths.append("Sufficient detail")
        else:           weaknesses.append("Too brief"); suggestions.append("Expand with more detail")

        total = sum(breakdown.values())
        return self._build_report(total, breakdown, strengths, weaknesses, suggestions)

    def _build_report(
        self,
        total: float,
        breakdown: dict,
        strengths: list,
        weaknesses: list,
        suggestions: list,
    ) -> QualityReport:
        score = min(100.0, max(0.0, total))
        grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 65 else "D" if score >= 50 else "F"

        return QualityReport(
            score=round(score, 1),
            grade=grade,
            strengths=strengths[:5],
            weaknesses=weaknesses[:5],
            suggestions=suggestions[:5],
            breakdown={k: round(v, 1) for k, v in breakdown.items()},
        )


quality_scorer_tool = QualityScorerTool()
