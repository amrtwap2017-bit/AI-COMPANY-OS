"""
app/tools/self_debugger.py
────────────────────────────────────────────────────────────────
Self-Debugging Tool — Intelligent error analysis.

Analyzes Python tracebacks and provides:
  - Root cause identification
  - Specific fix suggestions
  - Common pattern recognition
  - Error categorization
  - Code fix templates

Makes the code execution loop 3x faster by providing
actionable fix hints instead of raw error text.
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


@dataclass
class DebugAnalysis:
    error_type:    str
    error_message: str
    root_cause:    str
    fix_hints:     list[str]
    fix_template:  str | None
    category:      str
    severity:      str


# Common error patterns and their fixes
ERROR_PATTERNS = [
    {
        "pattern":   r"ModuleNotFoundError: No module named '(.+)'",
        "category":  "import",
        "root_cause": "Missing Python package",
        "fix_template": "pip install {match}",
        "hints": [
            "Install the missing package: pip install {match}",
            "Add to requirements.txt: {match}",
            "Check spelling of import name",
        ],
    },
    {
        "pattern":   r"AttributeError: '(\w+)' object has no attribute '(\w+)'",
        "category":  "attribute",
        "root_cause": "Accessing non-existent attribute",
        "hints": [
            "Check the object type with type({obj})",
            "Use dir({obj}) to see available attributes",
            "Attribute '{attr}' may have been renamed or removed",
            "Check if the object is None before accessing",
        ],
    },
    {
        "pattern":   r"TypeError: (.+) takes (\d+) positional argument",
        "category":  "type",
        "root_cause": "Wrong number of arguments",
        "hints": [
            "Check the function signature",
            "Verify number of arguments being passed",
            "Check for missing self parameter in class methods",
        ],
    },
    {
        "pattern":   r"KeyError: '?(.+)'?",
        "category":  "key",
        "root_cause": "Dictionary key not found",
        "hints": [
            "Use dict.get('{key}', default) instead of dict['{key}']",
            "Check if the key exists: if '{key}' in my_dict",
            "Print dict.keys() to see available keys",
        ],
    },
    {
        "pattern":   r"IndexError: list index out of range",
        "category":  "index",
        "root_cause": "List index beyond its length",
        "hints": [
            "Check len(list) before accessing by index",
            "Use list[-1] for last element",
            "Ensure the list is not empty before indexing",
        ],
    },
    {
        "pattern":   r"ValueError: (.+)",
        "category":  "value",
        "root_cause": "Invalid value for operation",
        "hints": [
            "Validate input before processing",
            "Add try/except ValueError block",
            "Check data types match expected",
        ],
    },
    {
        "pattern":   r"FileNotFoundError: \[Errno 2\] No such file or directory: '(.+)'",
        "category":  "file",
        "root_cause": "File or directory not found",
        "hints": [
            "Check the file path: {match}",
            "Use Path.exists() before opening",
            "Use absolute paths to avoid working directory issues",
            "Create parent directory: Path('{match}').parent.mkdir(parents=True)",
        ],
    },
    {
        "pattern":   r"NameError: name '(\w+)' is not defined",
        "category":  "name",
        "root_cause": "Variable or function not defined",
        "hints": [
            "Variable '{match}' must be defined before use",
            "Check for typos in variable name",
            "Import the function/class if from a module",
        ],
    },
    {
        "pattern":   r"IndentationError: (.+)",
        "category":  "syntax",
        "root_cause": "Python indentation error",
        "hints": [
            "Use consistent 4-space indentation",
            "Do not mix tabs and spaces",
            "Check alignment of if/else/elif/try/except blocks",
        ],
    },
    {
        "pattern":   r"SyntaxError: (.+)",
        "category":  "syntax",
        "root_cause": "Python syntax error",
        "hints": [
            "Check for missing colons after def/class/if/for",
            "Check for unmatched parentheses or brackets",
            "Verify string quotes are properly closed",
        ],
    },
    {
        "pattern":   r"ConnectionRefusedError",
        "category":  "network",
        "root_cause": "Cannot connect to service",
        "hints": [
            "Verify the service is running",
            "Check host and port configuration",
            "Ensure firewall allows the connection",
        ],
    },
    {
        "pattern":   r"PermissionError",
        "category":  "permission",
        "root_cause": "Insufficient file/system permissions",
        "hints": [
            "Check file permissions with ls -la",
            "Use sudo if appropriate",
            "Ensure the user has write access to the directory",
        ],
    },
]


class SelfDebuggerTool(BaseTool):
    name        = "self_debugger"
    description = (
        "Analyzes error tracebacks and provides actionable fix suggestions. "
        "Identifies root cause, suggests specific fixes, and provides code templates. "
        "Use after code_execution fails to get targeted fix guidance."
    )
    permissions_required = []

    def run(
        self,
        error:    str,
        code:     str | None = None,
        language: str        = "python",
    ) -> ToolResult:
        """
        Analyze an error and suggest fixes.

        Args:
            error:    The error message or full traceback
            code:     The code that caused the error (optional)
            language: Programming language

        Returns:
            ToolResult with analysis and fix suggestions
        """
        try:
            analysis = self._analyze(error, code, language)

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "error_type":    analysis.error_type,
                    "error_message": analysis.error_message,
                    "root_cause":    analysis.root_cause,
                    "category":      analysis.category,
                    "severity":      analysis.severity,
                    "fix_hints":     analysis.fix_hints,
                    "fix_template":  analysis.fix_template,
                    "action_required": self._action_summary(analysis),
                },
                metadata={"language": language},
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _analyze(
        self,
        error:    str,
        code:     str | None,
        language: str,
    ) -> DebugAnalysis:
        """Analyze the error and build fix suggestions."""
        # Extract error type and message
        error_type    = self._extract_error_type(error)
        error_message = self._extract_error_message(error)

        # Match against known patterns
        for pattern_def in ERROR_PATTERNS:
            match = re.search(pattern_def["pattern"], error)
            if match:
                groups   = match.groups()
                hints    = [
                    h.format(
                        match=groups[0] if groups else "",
                        obj=groups[0] if groups else "obj",
                        attr=groups[1] if len(groups) > 1 else "attr",
                        key=groups[0] if groups else "key",
                    )
                    for h in pattern_def["hints"]
                ]
                template = pattern_def.get("fix_template", "")
                if template and groups:
                    template = template.format(match=groups[0])

                return DebugAnalysis(
                    error_type=error_type,
                    error_message=error_message,
                    root_cause=pattern_def["root_cause"],
                    fix_hints=hints,
                    fix_template=template,
                    category=pattern_def["category"],
                    severity=self._severity(pattern_def["category"]),
                )

        # Generic analysis
        return DebugAnalysis(
            error_type=error_type,
            error_message=error_message,
            root_cause="Unknown error — requires manual investigation",
            fix_hints=[
                "Read the full traceback carefully",
                "Check the last frame in the traceback — that is where the error occurs",
                "Add print statements to trace variable values",
                "Use pdb debugger: import pdb; pdb.set_trace()",
            ],
            fix_template=None,
            category="unknown",
            severity="medium",
        )

    def _extract_error_type(self, error: str) -> str:
        match = re.search(r"(\w+Error|\w+Exception|SyntaxError|IndentationError)", error)
        return match.group(1) if match else "UnknownError"

    def _extract_error_message(self, error: str) -> str:
        lines = error.strip().split("\n")
        for line in reversed(lines):
            if line.strip() and not line.strip().startswith("File "):
                return line.strip()[:200]
        return error[:200]

    def _severity(self, category: str) -> str:
        return {
            "syntax":     "high",
            "import":     "medium",
            "network":    "high",
            "permission": "high",
            "security":   "critical",
        }.get(category, "medium")

    def _action_summary(self, analysis: DebugAnalysis) -> str:
        if analysis.fix_template:
            return f"Run: {analysis.fix_template}"
        if analysis.fix_hints:
            return analysis.fix_hints[0]
        return "Review the full traceback and fix manually"


self_debugger_tool = SelfDebuggerTool()
