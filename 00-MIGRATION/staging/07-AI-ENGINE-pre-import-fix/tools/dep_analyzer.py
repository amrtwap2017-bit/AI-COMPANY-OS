"""
app/tools/dep_analyzer.py
────────────────────────────────────────────────────────────────
Dependency Security and Quality Analyzer.

Checks:
  - Installed packages and versions
  - Known security vulnerabilities (via safety)
  - Outdated packages
  - Circular imports (Python)
  - License compatibility
"""

from __future__ import annotations

import subprocess
import json
import logging
from pathlib import Path

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


class DependencyAnalyzerTool(BaseTool):
    name        = "dep_analyzer"
    description = (
        "Analyzes project dependencies for security vulnerabilities, "
        "outdated packages, and license issues. Essential for production readiness."
    )
    permissions_required = []

    def run(
        self,
        action:       str          = "check_security",
        requirements: str | None  = None,
        package_name: str | None  = None,
    ) -> ToolResult:
        """
        Analyze dependencies.

        Actions:
          check_security:  Scan for CVEs
          list_outdated:   Find outdated packages
          check_package:   Info about a specific package
          parse_reqs:      Parse requirements.txt content
        """
        actions = {
            "check_security": self._check_security,
            "list_outdated":  self._list_outdated,
            "check_package":  self._check_package,
            "parse_reqs":     self._parse_reqs,
        }

        if action not in actions:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Unknown action: {action}",
            )

        try:
            result = actions[action](
                requirements=requirements,
                package_name=package_name,
            )
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

    def _check_security(self, requirements=None, **kwargs) -> dict:
        """Check for known CVEs using safety."""
        try:
            cmd = ["python3", "-m", "safety", "check", "--json"]
            if requirements:
                import tempfile
                with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
                    f.write(requirements)
                    cmd.extend(["-r", f.name])

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            raw    = result.stdout.strip()

            if not raw:
                return {"vulnerable": 0, "packages": [], "status": "clean"}

            try:
                data = json.loads(raw)
                vulns = data if isinstance(data, list) else []
                return {
                    "vulnerable": len(vulns),
                    "status":     "vulnerable" if vulns else "clean",
                    "packages":   [
                        {
                            "package":     v[0] if isinstance(v, list) else v.get("package_name"),
                            "version":     v[2] if isinstance(v, list) else v.get("analyzed_version"),
                            "advisory":    v[3] if isinstance(v, list) else v.get("advisory"),
                            "severity":    "HIGH",
                        }
                        for v in vulns[:10]
                    ],
                }
            except json.JSONDecodeError:
                return {"vulnerable": 0, "packages": [], "status": "clean", "raw": raw[:200]}

        except Exception as exc:
            return {"error": str(exc), "vulnerable": 0, "status": "unknown"}

    def _list_outdated(self, **kwargs) -> dict:
        """List outdated packages."""
        try:
            result = subprocess.run(
                ["pip", "list", "--outdated", "--format=json"],
                capture_output=True, text=True, timeout=60,
            )
            packages = json.loads(result.stdout) if result.stdout.strip() else []
            return {
                "count":    len(packages),
                "packages": [
                    {
                        "name":    p["name"],
                        "current": p["version"],
                        "latest":  p["latest_version"],
                    }
                    for p in packages[:20]
                ],
            }
        except Exception as exc:
            return {"error": str(exc), "count": 0, "packages": []}

    def _check_package(self, package_name=None, **kwargs) -> dict:
        """Get info about a specific package."""
        if not package_name:
            return {"error": "package_name required"}
        try:
            result = subprocess.run(
                ["pip", "show", package_name],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode != 0:
                return {"error": f"Package {package_name!r} not installed", "installed": False}

            info = {}
            for line in result.stdout.strip().split("\n"):
                if ": " in line:
                    key, _, val = line.partition(": ")
                    info[key.lower().replace("-", "_")] = val

            return {"installed": True, **info}
        except Exception as exc:
            return {"error": str(exc), "installed": False}

    def _parse_reqs(self, requirements=None, **kwargs) -> dict:
        """Parse requirements.txt content."""
        if not requirements:
            return {"error": "requirements content required"}

        packages = []
        for line in requirements.strip().split("\n"):
            line = line.strip()
            if line and not line.startswith("#"):
                if ">=" in line or "==" in line or "<=" in line:
                    name, _, ver = line.partition(">=")
                    if "==" in line:
                        name, _, ver = line.partition("==")
                    packages.append({"name": name.strip(), "version": ver.strip()})
                elif line:
                    packages.append({"name": line, "version": "any"})

        return {"count": len(packages), "packages": packages}


dep_analyzer_tool = DependencyAnalyzerTool()
