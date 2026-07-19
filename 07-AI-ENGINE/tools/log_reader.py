"""
app/tools/log_reader.py
────────────────────────────────────────────────────────────────
Log Reader Tool — Read and analyze log files.

Capabilities:
  - Tail any log file
  - Filter by level (ERROR, WARNING, INFO)
  - Search for patterns
  - Parse structured logs (JSON)
  - Detect error spikes
  - Monitor application logs in real-time (single snapshot)
"""

from __future__ import annotations

import re
import logging
import subprocess
from pathlib import Path

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

COMMON_LOG_PATHS = {
    "nginx":   "/var/log/nginx/error.log",
    "postgres": "/var/log/postgresql/postgresql.log",
    "syslog":  "/var/log/syslog",
    "app":     "logs/app.log",
}


class LogReaderTool(BaseTool):
    name        = "log_reader"
    description = (
        "Read and analyze log files. Tail logs, filter by level, "
        "search patterns, detect errors. Essential for debugging running services."
    )
    permissions_required = []

    def run(self, action: str = "tail", **kwargs) -> ToolResult:
        """
        Read logs.

        Actions:
          tail:    Get last N lines
          search:  Find pattern in log
          errors:  Extract all errors
          parse:   Parse JSON structured logs
          monitor: Named service logs
          analyze: Statistical analysis of log
        """
        actions = {
            "tail":    self._tail,
            "search":  self._search,
            "errors":  self._errors,
            "parse":   self._parse,
            "monitor": self._monitor,
            "analyze": self._analyze,
        }

        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )

        try:
            result = actions[action](**kwargs)
            return ToolResult(
                tool=self.name,
                success=True,
                output=result,
                metadata={"action": action},
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _tail(self, filepath: str, lines: int = 50, **kwargs) -> dict:
        """Get last N lines from a log file."""
        path = Path(filepath)
        if not path.exists():
            return {"error": f"File not found: {filepath}", "lines": []}

        result = subprocess.run(
            ["tail", f"-{lines}", str(path)],
            capture_output=True, text=True, timeout=10,
        )

        log_lines = result.stdout.strip().split("\n") if result.stdout else []
        return {
            "file":   filepath,
            "count":  len(log_lines),
            "lines":  log_lines,
        }

    def _search(
        self,
        filepath: str,
        pattern:  str,
        case_sensitive: bool = False,
        max_results: int = 50,
        **kwargs,
    ) -> dict:
        """Search for a pattern in log file."""
        path = Path(filepath)
        if not path.exists():
            return {"error": f"File not found: {filepath}", "matches": []}

        flags = [] if case_sensitive else ["-i"]
        result = subprocess.run(
            ["grep", *flags, "-n", pattern, str(path)],
            capture_output=True, text=True, timeout=10,
        )

        matches = result.stdout.strip().split("\n") if result.stdout else []
        matches = [m for m in matches if m][:max_results]

        return {
            "file":     filepath,
            "pattern":  pattern,
            "count":    len(matches),
            "matches":  matches,
        }

    def _errors(self, filepath: str, lines: int = 200, **kwargs) -> dict:
        """Extract all error lines from a log file."""
        result = self._tail(filepath, lines)
        if "error" in result:
            return result

        error_patterns = re.compile(
            r"\b(ERROR|CRITICAL|FATAL|Exception|Traceback|Error:)\b",
            re.IGNORECASE,
        )

        all_lines    = result["lines"]
        error_lines  = [l for l in all_lines if error_patterns.search(l)]
        warning_lines = [
            l for l in all_lines
            if re.search(r"\b(WARNING|WARN)\b", l, re.I)
        ]

        return {
            "file":         filepath,
            "total_lines":  len(all_lines),
            "errors":       len(error_lines),
            "warnings":     len(warning_lines),
            "error_lines":  error_lines[:20],
            "warning_lines": warning_lines[:10],
            "health": "critical" if len(error_lines) > 10 else
                      "degraded" if error_lines else "ok",
        }

    def _parse(self, filepath: str, lines: int = 50, **kwargs) -> dict:
        """Parse JSON structured logs."""
        import json
        result = self._tail(filepath, lines)
        if "error" in result:
            return result

        parsed  = []
        invalid = 0

        for line in result["lines"]:
            if not line.strip():
                continue
            try:
                parsed.append(json.loads(line))
            except json.JSONDecodeError:
                invalid += 1

        level_counts: dict[str, int] = {}
        for entry in parsed:
            level = entry.get("level", entry.get("levelname", "UNKNOWN")).upper()
            level_counts[level] = level_counts.get(level, 0) + 1

        return {
            "file":          filepath,
            "parsed":        len(parsed),
            "invalid":       invalid,
            "level_counts":  level_counts,
            "recent":        parsed[-10:],
        }

    def _monitor(self, service: str, lines: int = 50, **kwargs) -> dict:
        """Get logs for a named service."""
        if service in COMMON_LOG_PATHS:
            return self._errors(COMMON_LOG_PATHS[service], lines)

        # Try journalctl for systemd services
        try:
            result = subprocess.run(
                ["journalctl", "-u", service, f"-n{lines}", "--no-pager"],
                capture_output=True, text=True, timeout=10,
            )
            lines_out = result.stdout.strip().split("\n") if result.stdout else []
            return {
                "service": service,
                "count":   len(lines_out),
                "lines":   lines_out,
            }
        except Exception:
            return {"error": f"Cannot read logs for service: {service}"}

    def _analyze(self, filepath: str, lines: int = 500, **kwargs) -> dict:
        """Statistical analysis of log file."""
        result = self._tail(filepath, lines)
        if "error" in result:
            return result

        all_lines  = result["lines"]
        error_re   = re.compile(r"\b(ERROR|CRITICAL|FATAL)\b", re.I)
        warning_re = re.compile(r"\bWARN\b", re.I)
        info_re    = re.compile(r"\bINFO\b", re.I)

        errors   = sum(1 for l in all_lines if error_re.search(l))
        warnings = sum(1 for l in all_lines if warning_re.search(l))
        infos    = sum(1 for l in all_lines if info_re.search(l))
        other    = len(all_lines) - errors - warnings - infos

        error_rate = errors / max(len(all_lines), 1)

        return {
            "file":       filepath,
            "total":      len(all_lines),
            "errors":     errors,
            "warnings":   warnings,
            "info":       infos,
            "other":      other,
            "error_rate": round(error_rate * 100, 2),
            "health":     "critical" if error_rate > 0.1 else
                          "degraded" if error_rate > 0.01 else "ok",
        }


log_reader_tool = LogReaderTool()
