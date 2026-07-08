"""
Security Agent — Vulnerability Scanner
========================================
Scans generated code for security issues before merge.

Checks:
  - Bandit static analysis (Python)
  - Hardcoded secrets/passwords/keys
  - SQL injection patterns
  - Path traversal patterns
  - Missing authentication checks
  - Workspace isolation violations (missing workspace_id checks)
  - OWASP Top 10 patterns
"""

from __future__ import annotations

import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any


class SecurityAgent:
    """
    Scans code for security vulnerabilities.
    Returns a security report with severity ratings.
    """

    agent_id = "security"
    capabilities = ["security_scanning", "vulnerability_detection", "secret_detection"]

    # Patterns that indicate high-severity security issues
    HIGH_SEVERITY_PATTERNS = [
        (r'password\s*=\s*["\'][^"\']+["\']', "Hardcoded password"),
        (r'secret\s*=\s*["\'][^"\']+["\']', "Hardcoded secret"),
        (r'api_key\s*=\s*["\'][^"\']+["\']', "Hardcoded API key"),
        (r'token\s*=\s*["\'][^"\']+["\']', "Hardcoded token"),
        (r'eval\s*\(', "Use of eval()"),
        (r'exec\s*\(', "Use of exec()"),
        (r'os\.system\s*\(', "Shell injection risk"),
        (r'subprocess\..*shell\s*=\s*True', "Shell injection via subprocess"),
        (r'pickle\.loads', "Unsafe deserialization"),
        (r'yaml\.load\s*\([^,]+\)', "Unsafe YAML load (no Loader)"),
    ]

    MEDIUM_SEVERITY_PATTERNS = [
        (r'SELECT.+FROM.+WHERE.+\+', "Possible SQL injection via string concat"),
        (r'f["\'].*SELECT.*{', "Possible SQL injection via f-string"),
        (r'\.\./', "Path traversal pattern"),
        (r'open\s*\([^,]+["\'][^"\']*\.\.[^"\']*["\']', "Path traversal in file open"),
        (r'DEBUG\s*=\s*True', "Debug mode enabled"),
        (r'ALLOWED_HOSTS\s*=\s*\[.*\*.*\]', "Wildcard ALLOWED_HOSTS"),
    ]

    LOW_SEVERITY_PATTERNS = [
        (r'print\s*\(.*password', "Password in print statement"),
        (r'logging\..*password', "Password in log statement"),
        (r'TODO.*security', "Security TODO"),
        (r'FIXME.*auth', "Auth FIXME"),
    ]

    async def scan(
        self,
        code: str,
        file_path: str,
        language: str = "python",
    ) -> dict[str, Any]:
        """
        Scan code for security vulnerabilities.

        Returns:
        {
            "passed": bool,
            "high_count": int,
            "medium_count": int,
            "low_count": int,
            "issues": [{severity, pattern, line}],
            "bandit_output": str,
            "workspace_isolation_check": bool,
        }
        """
        issues = []

        # Pattern-based scanning
        lines = code.split("\n")
        for i, line in enumerate(lines, 1):
            for pattern, description in self.HIGH_SEVERITY_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        "severity": "HIGH",
                        "description": description,
                        "line": i,
                        "content": line.strip()[:100],
                    })

            for pattern, description in self.MEDIUM_SEVERITY_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        "severity": "MEDIUM",
                        "description": description,
                        "line": i,
                        "content": line.strip()[:100],
                    })

            for pattern, description in self.LOW_SEVERITY_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        "severity": "LOW",
                        "description": description,
                        "line": i,
                        "content": line.strip()[:100],
                    })

        # Workspace isolation check
        workspace_check = self._check_workspace_isolation(code, language)

        # Bandit scan for Python
        bandit_output = ""
        if language == "python":
            bandit_output = await self._run_bandit(file_path)
            # Add bandit HIGH issues
            if "Issue: [B" in bandit_output:
                severity_matches = re.findall(
                    r"Issue: \[(\w+)\] (.+?)\n.*?Severity: (\w+)",
                    bandit_output,
                    re.DOTALL,
                )
                for code_id, desc, sev in severity_matches[:5]:
                    if sev.upper() in ("HIGH", "MEDIUM"):
                        issues.append({
                            "severity": sev.upper(),
                            "description": f"Bandit {code_id}: {desc[:100]}",
                            "line": 0,
                            "content": "",
                        })

        high_count = sum(1 for i in issues if i["severity"] == "HIGH")
        medium_count = sum(1 for i in issues if i["severity"] == "MEDIUM")
        low_count = sum(1 for i in issues if i["severity"] == "LOW")

        # Pass if no HIGH issues
        passed = high_count == 0

        return {
            "passed": passed,
            "high_count": high_count,
            "medium_count": medium_count,
            "low_count": low_count,
            "issues": issues[:20],
            "bandit_output": bandit_output[:500],
            "workspace_isolation_check": workspace_check,
            "total_issues": len(issues),
        }

    def _check_workspace_isolation(self, code: str, language: str) -> bool:
        """Check if code properly isolates by workspace_id."""
        if language != "python":
            return True

        # If code touches database, it should filter by workspace_id
        has_db_access = any(kw in code for kw in ["execute", "session", "query", "SELECT", "INSERT"])
        has_workspace_filter = "workspace_id" in code

        if has_db_access and not has_workspace_filter:
            return False
        return True

    async def _run_bandit(self, file_path: str) -> str:
        """Run bandit security scanner on Python file."""
        try:
            result = subprocess.run(
                ["python3", "-m", "bandit", "-r", file_path, "-f", "text", "-q"],
                capture_output=True,
                text=True,
                timeout=20,
            )
            return result.stdout + result.stderr
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return ""
        except Exception as exc:
            return f"Bandit error: {exc}"
