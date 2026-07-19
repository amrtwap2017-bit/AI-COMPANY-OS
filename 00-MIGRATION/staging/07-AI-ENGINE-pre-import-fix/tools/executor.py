"""
app/tools/executor.py
────────────────────────────────────────────────────────────────
Executes tool decisions and formats results for LLM injection.

Rules:
  - Never raises — tool failures are silently logged
  - Each tool call is tracked in analytics
  - Results are formatted as clean text for prompt injection
  - Tool execution timeout: 30 seconds per tool
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from app.tools.decider import ToolDecision
from app.tools.registry import tool_registry

log = logging.getLogger(__name__)

TOOL_TIMEOUT_SECONDS = 30


@dataclass
class ToolExecutionResult:
    """Result of executing one tool."""
    tool_name:     str
    success:       bool
    formatted:     str          # ready to inject into system prompt
    raw_output:    object       # original ToolResult.output
    duration_s:    float
    error:         str | None   = None


class ToolExecutor:

    def execute_all(
        self,
        decisions:  list[ToolDecision],
        agent_name: str,
    ) -> list[ToolExecutionResult]:
        """
        Execute all tool decisions.
        Returns results in the same order as decisions.
        """
        results: list[ToolExecutionResult] = []

        for decision in decisions:
            result = self._execute_one(decision, agent_name)
            results.append(result)

            # Track analytics (non-blocking)
            try:
                from app.analytics.tracker import track_tool
                track_tool(
                    tool_name=decision.tool_name,
                    agent_name=agent_name,
                    success=result.success,
                    duration=result.duration_s,
                )
            except Exception:
                pass

        return results

    def build_context_block(
        self,
        results: list[ToolExecutionResult],
    ) -> str:
        """
        Format all tool results into a single context block
        ready to inject into the agent's system prompt.
        """
        if not results:
            return ""

        successful = [r for r in results if r.success and r.formatted]
        if not successful:
            return ""

        sections = ["## Real-Time Information (retrieved just now)"]
        for r in successful:
            sections.append(f"\n### {r.tool_name.replace('_', ' ').title()}")
            sections.append(r.formatted)

        sections.append(
            "\n*Use the above information to answer accurately. "
            "Prefer this over your training data for current facts.*"
        )

        return "\n".join(sections)

    def _execute_one(
        self,
        decision:   ToolDecision,
        agent_name: str,
    ) -> ToolExecutionResult:
        """Execute one tool decision. Never raises."""
        start = time.time()

        try:
            tool_result = tool_registry.execute(
                tool_name=decision.tool_name,
                agent_name=agent_name,
                **decision.kwargs,
            )

            duration = time.time() - start

            if not tool_result.success:
                return ToolExecutionResult(
                    tool_name=decision.tool_name,
                    success=False,
                    formatted="",
                    raw_output=None,
                    duration_s=round(duration, 2),
                    error=tool_result.error,
                )

            formatted = self._format_result(
                decision.tool_name,
                tool_result.output,
            )

            log.info(
                "Tool %s executed in %.1fs for agent %s",
                decision.tool_name, duration, agent_name,
            )

            return ToolExecutionResult(
                tool_name=decision.tool_name,
                success=True,
                formatted=formatted,
                raw_output=tool_result.output,
                duration_s=round(duration, 2),
            )

        except Exception as exc:
            duration = time.time() - start
            log.warning(
                "Tool %s failed for agent %s: %s",
                decision.tool_name, agent_name, exc,
            )
            return ToolExecutionResult(
                tool_name=decision.tool_name,
                success=False,
                formatted="",
                raw_output=None,
                duration_s=round(duration, 2),
                error=str(exc),
            )

    def _format_result(
        self,
        tool_name: str,
        output:    object,
    ) -> str:
        """Format tool output for LLM injection."""

        if tool_name == "web_search":
            return self._format_search(output)

        if tool_name == "web_scraper":
            return self._format_scraper(output)

        # Generic fallback
        return str(output)[:3000]

    def _format_search(self, results: list) -> str:
        if not results:
            return "No results found."

        lines = []
        for i, r in enumerate(results[:5], 1):
            title   = r.get("title",   "").strip()
            snippet = r.get("snippet", "").strip()
            url     = r.get("url",     "").strip()

            lines.append(f"{i}. **{title}**")
            if snippet:
                lines.append(f"   {snippet}")
            if url:
                lines.append(f"   Source: {url}")
            lines.append("")

        return "\n".join(lines).strip()

    def _format_scraper(self, data: dict) -> str:
        if not data:
            return "Could not extract content."

        title   = data.get("title",   "")
        content = data.get("content", "")
        url     = data.get("url",     "")

        parts = []
        if title:
            parts.append(f"**{title}**")
        if url:
            parts.append(f"Source: {url}")
        if content:
            parts.append(f"\n{content[:4000]}")

        return "\n".join(parts)


tool_executor = ToolExecutor()
