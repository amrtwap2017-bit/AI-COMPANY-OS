"""
app/tools/web_search.py
────────────────────────────────────────────────────────────────
DuckDuckGo Web Search Tool.

Anonymous search — no API keys required.
Returns titles, snippets, and URLs.

Agents call this via: tool_registry.execute("web_search", agent_name, query=...)
"""

from __future__ import annotations

from app.tools.base import BaseTool, ToolResult


class WebSearchTool(BaseTool):
    name        = "web_search"
    description = (
        "Search the internet for current information, news, and facts. "
        "Returns titles, snippets, and URLs from DuckDuckGo."
    )
    permissions_required = []

    def run(
        self,
        query:       str,
        max_results: int = 5,
        region:      str = "wt-wt",
        safe_search: str = "moderate",
    ) -> ToolResult:
        """
        Execute a web search.

        Args:
            query:       Search query string
            max_results: Number of results to return (1-20)
            region:      DDG region code (wt-wt = worldwide)
            safe_search: off | moderate | strict

        Returns:
            ToolResult with output = list of {title, snippet, url}
        """
        try:
            from ddgs import DDGS

            max_results = min(max(1, max_results), 20)

            with DDGS() as ddgs:
                raw = list(ddgs.text(
                    query,
                    max_results=max_results,
                    region=region,
                    safesearch=safe_search,
                ))

            results = [
                {
                    "title":   r.get("title",  "").strip(),
                    "snippet": r.get("body",   "").strip(),
                    "url":     r.get("href",   "").strip(),
                }
                for r in raw
                if r.get("href")
            ]

            if not results:
                return ToolResult(
                    tool=self.name,
                    success=False,
                    output=[],
                    error="No results returned for this query",
                )

            return ToolResult(
                tool=self.name,
                success=True,
                output=results,
                metadata={
                    "query":       query,
                    "result_count": len(results),
                    "max_results": max_results,
                },
            )

        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=[],
                error=f"Search failed: {exc}",
            )


web_search_tool = WebSearchTool()
