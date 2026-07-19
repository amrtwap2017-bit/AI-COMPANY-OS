"""
app/tools/decider.py
────────────────────────────────────────────────────────────────
Decides which tools an agent should call before generating a response.

Rule-based + keyword detection — no LLM call needed.
Fast, deterministic, zero-cost.

Decision logic:
  1. Agent must have permission for the tool
  2. Message must contain trigger signals for that tool
  3. Max 2 tools per message (prevent context bloat)

Tool trigger signals:
  web_search:  time-sensitive queries, "latest", "current", "today",
               "news", "2024", "2025", "2026", recent events
  web_scraper: explicit URL in message, "read this", "summarize"
  postgres:    "how many", "count", "statistics", "database"
  python:      "calculate", "compute", math expressions

Returns list of (tool_name, kwargs) to execute in order.
"""

from __future__ import annotations

import re
import logging

log = logging.getLogger(__name__)

# ── Trigger patterns per tool ─────────────────────────────────

WEB_SEARCH_TRIGGERS = [
    # Time signals — agent cannot know current info
    r"\btoday\b", r"\btonight\b", r"\byesterday\b",
    r"\bthis week\b", r"\bthis month\b", r"\bthis year\b",
    r"\bcurrent\b", r"\bcurrently\b", r"\blatest\b",
    r"\brecent\b", r"\brecently\b", r"\bnow\b",
    r"\bnews\b", r"\bbreaking\b", r"\bupdate\b",
    r"\b202[456789]\b",   # years the agent may not know
    # Info-seeking signals
    r"\bwhat happened\b", r"\bwhat is happening\b",
    r"\bwho won\b", r"\bwho is\b.*\bceo\b",
    r"\bprice of\b", r"\bstock price\b",
    r"\bweather\b", r"\bforecast\b",
    r"\brelease date\b", r"\blaunch date\b",
    r"\bsearch for\b", r"\blook up\b", r"\bfind out\b",
    r"\btell me about\b.*\b(new|latest|recent)\b",
]

WEB_SCRAPER_TRIGGERS = [
    r"https?://\S+",           # explicit URL in message
    r"\bread this\b",
    r"\bsummarize this\b",
    r"\bwhat does this (say|mean|contain)\b",
    r"\bextract from\b",
]

POSTGRES_TRIGGERS = [
    r"\bhow many\b",
    r"\bcount of\b",
    r"\btotal number\b",
    r"\bstatistics\b",
    r"\bdatabase query\b",
    r"\bSQL\b",
]

# Maximum tools per message
MAX_TOOLS = 2

# Maximum search results to return
DEFAULT_SEARCH_RESULTS = 5


class ToolDecision:
    """One tool call to make."""
    def __init__(
        self,
        tool_name: str,
        kwargs:    dict,
        reason:    str,
    ) -> None:
        self.tool_name = tool_name
        self.kwargs    = kwargs
        self.reason    = reason

    def __repr__(self) -> str:
        return f"ToolDecision(tool={self.tool_name!r}, reason={self.reason!r})"


class ToolDecider:

    def decide(
        self,
        message:    str,
        agent_name: str,
        agent_tools: list[str],
    ) -> list[ToolDecision]:
        """
        Return a list of tool calls the agent should make.
        Returns empty list if no tools needed.
        """
        decisions: list[ToolDecision] = []
        message_lower = message.lower()

        # ── Web Search ────────────────────────────────────────
        if "web_search" in agent_tools:
            if self._matches_any(message_lower, WEB_SEARCH_TRIGGERS):
                query = self._extract_search_query(message)
                decisions.append(ToolDecision(
                    tool_name="web_search",
                    kwargs={
                        "query":       query,
                        "max_results": DEFAULT_SEARCH_RESULTS,
                    },
                    reason="Message contains time-sensitive or current-info signals",
                ))

        # ── Web Scraper ───────────────────────────────────────
        if "web_scraper" in agent_tools and len(decisions) < MAX_TOOLS:
            urls = self._extract_urls(message)
            if urls:
                decisions.append(ToolDecision(
                    tool_name="web_scraper",
                    kwargs={"url": urls[0], "max_chars": 6000},
                    reason=f"User provided URL: {urls[0]}",
                ))

        # Cap at MAX_TOOLS
        decisions = decisions[:MAX_TOOLS]

        if decisions:
            log.debug(
                "ToolDecider: %d tools for agent %s: %s",
                len(decisions),
                agent_name,
                [d.tool_name for d in decisions],
            )

        return decisions

    def _matches_any(self, text: str, patterns: list[str]) -> bool:
        return any(re.search(p, text, re.IGNORECASE) for p in patterns)

    def _extract_search_query(self, message: str) -> str:
        """
        Build a search query from the user message.
        Removes common filler words that hurt search quality.
        """
        # Remove question words
        query = re.sub(
            r"^(what|who|when|where|how|can you|could you|please|tell me)\s+",
            "",
            message.strip(),
            flags=re.IGNORECASE,
        )
        # Keep it under 100 chars for search
        return query[:100].strip() or message[:100]

    def _extract_urls(self, message: str) -> list[str]:
        """Extract all HTTP/HTTPS URLs from a message."""
        urls = re.findall(r"https?://\S+", message)
        # Clean trailing punctuation
        return [u.rstrip(".,;:!?)\"'") for u in urls]


tool_decider = ToolDecider()
