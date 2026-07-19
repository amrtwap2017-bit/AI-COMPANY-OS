"""
app/tools/web_scraper.py
────────────────────────────────────────────────────────────────
Web Content Extraction Tool.

Uses trafilatura to extract clean article text from any URL.
Strips navigation, ads, scripts — returns the main content only.

This is what makes agent-driven research possible:
  1. Agent calls web_search to find relevant URLs
  2. Agent calls web_scraper on the best URL
  3. Agent has clean text to summarize or analyze
"""

from __future__ import annotations

from app.tools.base import BaseTool, ToolResult

MAX_CONTENT_CHARS = 12_000   # safe limit for LLM context windows
TIMEOUT_SECONDS   = 15


class WebScraperTool(BaseTool):
    name        = "web_scraper"
    description = (
        "Fetch and extract the main text content from a URL. "
        "Removes ads, navigation, and scripts. "
        "Useful for reading articles, documentation, and web pages."
    )
    permissions_required = []

    def run(
        self,
        url:           str,
        max_chars:     int  = MAX_CONTENT_CHARS,
        include_links: bool = False,
    ) -> ToolResult:
        """
        Fetch a URL and extract its main content.

        Args:
            url:           The URL to scrape
            max_chars:     Maximum characters to return (default 12000)
            include_links: Whether to include hyperlinks in output

        Returns:
            ToolResult with output = {url, title, content, length}
        """
        if not url or not url.startswith(("http://", "https://")):
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Invalid URL: {url!r}. Must start with http:// or https://",
            )

        try:
            import trafilatura
            from trafilatura.settings import use_config

            config = use_config()
            config.set("DEFAULT", "DOWNLOAD_TIMEOUT", str(TIMEOUT_SECONDS))

            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return ToolResult(
                    tool=self.name,
                    success=False,
                    output=None,
                    error=f"Could not fetch URL: {url}",
                )

            content = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                include_links=include_links,
                no_fallback=False,
            )

            if not content:
                return ToolResult(
                    tool=self.name,
                    success=False,
                    output=None,
                    error=f"No extractable content at: {url}",
                )

            # Extract title from metadata if available
            meta = trafilatura.extract_metadata(downloaded)
            title = meta.title if meta and meta.title else url

            # Cap content for LLM safety
            max_chars = min(max_chars, MAX_CONTENT_CHARS)
            truncated = len(content) > max_chars
            content   = content[:max_chars]

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "url":       url,
                    "title":     title,
                    "content":   content,
                    "length":    len(content),
                    "truncated": truncated,
                },
                metadata={
                    "url":       url,
                    "max_chars": max_chars,
                    "truncated": truncated,
                },
            )

        except ImportError:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error="trafilatura not installed. Run: pip install trafilatura",
            )
        except Exception as exc:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"Scrape failed: {exc}",
            )


web_scraper_tool = WebScraperTool()
