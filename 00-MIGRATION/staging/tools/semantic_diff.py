"""
app/tools/semantic_diff.py
────────────────────────────────────────────────────────────────
Semantic Diff Tool — Intelligent comparison of code and text.

Goes beyond line-by-line diff to show MEANING of changes:
  - What functions were added/removed/changed
  - What the changes mean semantically
  - Risk assessment of changes
  - Breaking change detection
"""

from __future__ import annotations

import re
import difflib
import logging
from dataclasses import dataclass, field

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


@dataclass
class DiffResult:
    added_lines:    int
    removed_lines:  int
    changed_lines:  int
    similarity:     float
    functions_added:   list[str]
    functions_removed: list[str]
    functions_changed: list[str]
    breaking_changes:  list[str]
    summary:        str


class SemanticDiffTool(BaseTool):
    name        = "semantic_diff"
    description = (
        "Compare two versions of code or text. Shows what changed semantically, "
        "not just line differences. Detects breaking changes and function changes."
    )
    permissions_required = []

    def run(
        self,
        original: str,
        updated:  str,
        language: str = "python",
        context:  int = 3,
    ) -> ToolResult:
        """
        Compare two code/text versions.

        Args:
            original: Original version
            updated:  Updated version
            language: python | text | json
            context:  Lines of context around changes

        Returns:
            ToolResult with semantic diff analysis
        """
        try:
            result = self._diff(original, updated, language, context)

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "added_lines":       result.added_lines,
                    "removed_lines":     result.removed_lines,
                    "changed_lines":     result.changed_lines,
                    "similarity_pct":    round(result.similarity * 100, 1),
                    "functions_added":   result.functions_added,
                    "functions_removed": result.functions_removed,
                    "functions_changed": result.functions_changed,
                    "breaking_changes":  result.breaking_changes,
                    "summary":           result.summary,
                    "unified_diff":      self._unified_diff(original, updated, context),
                },
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _diff(
        self,
        original: str,
        updated:  str,
        language: str,
        context:  int,
    ) -> DiffResult:
        orig_lines = original.splitlines()
        upd_lines  = updated.splitlines()

        matcher    = difflib.SequenceMatcher(None, orig_lines, upd_lines)
        similarity = matcher.ratio()

        added = removed = changed = 0
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "insert":
                added += j2 - j1
            elif tag == "delete":
                removed += i2 - i1
            elif tag == "replace":
                changed += max(i2 - i1, j2 - j1)

        # Function-level analysis for Python
        funcs_added   = []
        funcs_removed = []
        funcs_changed = []
        breaking      = []

        if language == "python":
            orig_funcs = self._extract_functions(original)
            upd_funcs  = self._extract_functions(updated)

            funcs_added   = [f for f in upd_funcs  if f not in orig_funcs]
            funcs_removed = [f for f in orig_funcs  if f not in upd_funcs]
            funcs_changed = [
                f for f in orig_funcs
                if f in upd_funcs and
                self._get_function_body(original, f) !=
                self._get_function_body(updated, f)
            ]

            # Breaking changes = removed public functions/classes
            breaking = [
                f"Removed: {f} (breaking if used externally)"
                for f in funcs_removed
                if not f.startswith("_")
            ]

        summary = (
            f"Changed: +{added} -{removed} lines "
            f"({round((1-similarity)*100, 1)}% different). "
        )
        if funcs_added:
            summary += f"Added {len(funcs_added)} function(s). "
        if funcs_removed:
            summary += f"Removed {len(funcs_removed)} function(s). "
        if breaking:
            summary += f"⚠️ {len(breaking)} breaking change(s)."

        return DiffResult(
            added_lines=added,
            removed_lines=removed,
            changed_lines=changed,
            similarity=similarity,
            functions_added=funcs_added,
            functions_removed=funcs_removed,
            functions_changed=funcs_changed,
            breaking_changes=breaking,
            summary=summary,
        )

    def _extract_functions(self, code: str) -> list[str]:
        pattern = re.compile(r"^\s*(?:def|class|async def)\s+(\w+)", re.MULTILINE)
        return pattern.findall(code)

    def _get_function_body(self, code: str, func_name: str) -> str:
        lines = code.splitlines()
        start = None
        body  = []

        for i, line in enumerate(lines):
            if re.match(rf"\s*(?:def|class|async def)\s+{func_name}\b", line):
                start = i
            elif start is not None:
                if line and not line[0].isspace() and i > start:
                    break
                body.append(line)

        return "\n".join(body)

    def _unified_diff(self, original: str, updated: str, context: int) -> str:
        diff = difflib.unified_diff(
            original.splitlines(keepends=True),
            updated.splitlines(keepends=True),
            fromfile="original",
            tofile="updated",
            n=context,
        )
        return "".join(list(diff)[:100])   # limit output


semantic_diff_tool = SemanticDiffTool()
