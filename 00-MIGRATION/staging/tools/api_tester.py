"""
app/tools/api_tester.py
────────────────────────────────────────────────────────────────
HTTP API Testing Tool.

Agents can now test HTTP endpoints directly:
  - Send GET/POST/PUT/DELETE/PATCH requests
  - Verify response status codes and schemas
  - Test authentication flows
  - Measure response times
  - Run sequences of API calls
  - Generate test reports
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 30


@dataclass
class APIResponse:
    url:          str
    method:       str
    status_code:  int
    response_time_ms: float
    headers:      dict
    body:         str
    success:      bool
    error:        str | None = None


class APITesterTool(BaseTool):
    name        = "api_tester"
    description = (
        "Test HTTP API endpoints. Send requests, verify responses, "
        "measure performance. Use to validate backend APIs after generation."
    )
    permissions_required = []

    def run(
        self,
        action:  str = "request",
        **kwargs,
    ) -> ToolResult:
        """
        Test HTTP APIs.

        Actions:
          request:   Single HTTP request
          sequence:  Multiple requests in order
          verify:    Request + assert on response
          health:    Quick health check
        """
        actions = {
            "request":  self._request,
            "sequence": self._sequence,
            "verify":   self._verify,
            "health":   self._health,
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
                success=result.get("success", True),
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

    def _request(
        self,
        url:     str,
        method:  str           = "GET",
        headers: dict | None   = None,
        body:    dict | None   = None,
        params:  dict | None   = None,
        timeout: int           = DEFAULT_TIMEOUT,
    ) -> dict:
        """Send a single HTTP request."""
        import httpx

        method = method.upper()
        start  = time.time()

        response = httpx.request(
            method=method,
            url=url,
            headers=headers or {},
            json=body,
            params=params,
            timeout=timeout,
            follow_redirects=True,
        )

        elapsed = round((time.time() - start) * 1000, 1)

        body_text = response.text[:2000]
        try:
            body_json = response.json()
        except Exception:
            body_json = None

        return {
            "url":             url,
            "method":          method,
            "status_code":     response.status_code,
            "response_time_ms": elapsed,
            "success":         200 <= response.status_code < 300,
            "headers":         dict(response.headers),
            "body":            body_text,
            "body_json":       body_json,
        }

    def _sequence(
        self,
        requests: list[dict],
        stop_on_failure: bool = True,
    ) -> dict:
        """Run multiple requests in sequence."""
        results  = []
        all_pass = True

        for i, req in enumerate(requests):
            try:
                result = self._request(**req)
                results.append({**result, "step": i + 1})
                if not result["success"] and stop_on_failure:
                    all_pass = False
                    break
                if not result["success"]:
                    all_pass = False
            except Exception as exc:
                results.append({"step": i + 1, "error": str(exc), "success": False})
                if stop_on_failure:
                    all_pass = False
                    break

        return {
            "success":  all_pass,
            "steps":    len(requests),
            "completed": len(results),
            "results":  results,
            "avg_response_ms": round(
                sum(r.get("response_time_ms", 0) for r in results) / max(len(results), 1),
                1,
            ),
        }

    def _verify(
        self,
        url:           str,
        method:        str         = "GET",
        headers:       dict | None = None,
        body:          dict | None = None,
        expected_status: int       = 200,
        expected_keys: list[str]   = None,
        expected_values: dict      = None,
    ) -> dict:
        """Send request and verify response."""
        result = self._request(url, method, headers, body)

        checks   = {}
        all_pass = True

        # Status check
        status_ok = result["status_code"] == expected_status
        checks["status_code"] = {
            "expected": expected_status,
            "actual":   result["status_code"],
            "passed":   status_ok,
        }
        if not status_ok:
            all_pass = False

        # Key presence checks
        if expected_keys and result.get("body_json"):
            body = result["body_json"]
            for key in expected_keys:
                present = key in body
                checks[f"has_key_{key}"] = {"passed": present}
                if not present:
                    all_pass = False

        # Value checks
        if expected_values and result.get("body_json"):
            body = result["body_json"]
            for key, val in expected_values.items():
                actual  = body.get(key)
                matches = actual == val
                checks[f"value_{key}"] = {
                    "expected": val,
                    "actual":   actual,
                    "passed":   matches,
                }
                if not matches:
                    all_pass = False

        return {
            "success":         all_pass,
            "url":             url,
            "status_code":     result["status_code"],
            "response_time_ms": result["response_time_ms"],
            "checks":          checks,
            "body_preview":    result["body"][:500],
        }

    def _health(self, url: str, timeout: int = 10) -> dict:
        """Quick health check."""
        try:
            result = self._request(url, timeout=timeout)
            return {
                "url":     url,
                "healthy": result["success"],
                "status":  result["status_code"],
                "latency_ms": result["response_time_ms"],
            }
        except Exception as exc:
            return {"url": url, "healthy": False, "error": str(exc)}


api_tester_tool = APITesterTool()
