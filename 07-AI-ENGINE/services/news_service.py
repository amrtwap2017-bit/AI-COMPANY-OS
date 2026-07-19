"""
app/services/news_service.py
────────────────────────────────────────────────────────────────
Real-Time News Ingestion Service.

Fetches RSS feeds and ingests articles into the Knowledge Engine.
After ingestion, agents can retrieve current news via RAG.

Usage:
    result = news_service.ingest_feed(
        url="https://feeds.bbci.co.uk/news/technology/rss.xml",
        category="technology",
    )
    print(f"Ingested {result['ingested']} articles")

Built-in feeds for quick start:
    news_service.ingest_tech_news()
    news_service.ingest_ai_news()
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import feedparser

from knowledge.ingest import knowledge_ingest, IngestResult

log = logging.getLogger(__name__)

# Curated list of high-quality tech/AI RSS feeds
BUILTIN_FEEDS: dict[str, list[str]] = {
    "technology": [
        "https://feeds.bbci.co.uk/news/technology/rss.xml",
        "https://rss.cnn.com/rss/edition_technology.rss",
    ],
    "ai": [
        "https://blogs.nvidia.com/feed/",
        "https://openai.com/news/rss.xml",
    ],
    "science": [
        "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    ],
    "business": [
        "https://feeds.bbci.co.uk/news/business/rss.xml",
    ],
}


@dataclass
class FeedResult:
    feed_title:  str
    feed_url:    str
    category:    str
    total_items: int
    ingested:    int
    failed:      int
    errors:      list[str]


class NewsService:

    def ingest_feed(
        self,
        url:         str,
        category:    str = "general",
        max_articles: int = 20,
    ) -> FeedResult:
        """
        Fetch an RSS feed and ingest all articles into Knowledge Engine.

        Args:
            url:          RSS feed URL
            category:     Topic category label (stored in source field)
            max_articles: Maximum articles to ingest per feed

        Returns:
            FeedResult with ingestion stats
        """
        log.info("Ingesting RSS feed: %s (category=%s)", url, category)

        try:
            feed = feedparser.parse(url)
        except Exception as exc:
            return FeedResult(
                feed_title=url,
                feed_url=url,
                category=category,
                total_items=0,
                ingested=0,
                failed=1,
                errors=[f"Failed to parse feed: {exc}"],
            )

        feed_title = feed.feed.get("title", url)
        entries    = feed.entries[:max_articles]
        ingested   = 0
        failed     = 0
        errors:    list[str] = []

        for entry in entries:
            title = entry.get("title", "Untitled")
            url_  = entry.get("link", url)

            # Build content from available fields
            content_parts = []
            if summary := entry.get("summary", "").strip():
                content_parts.append(summary)
            if description := entry.get("description", "").strip():
                if description != summary:
                    content_parts.append(description)
            if content := entry.get("content", []):
                for c in content:
                    if value := c.get("value", "").strip():
                        content_parts.append(value)

            full_content = "\n\n".join(content_parts).strip()

            if not full_content:
                log.debug("Skipping empty article: %s", title)
                continue

            source = f"rss:{category}:{url_}"

            try:
                result = knowledge_ingest.ingest_text(
                    title=title,
                    content=full_content,
                    source=source,
                    doc_type="news_article",
                )
                if result.success:
                    ingested += 1
                    log.debug("Ingested: %s (%d chunks)", title, result.chunk_count)
                else:
                    failed += 1
                    errors.append(f"{title}: {result.error}")

            except Exception as exc:
                failed += 1
                errors.append(f"{title}: {exc}")
                log.error("Failed to ingest article %r: %s", title, exc)

        log.info(
            "Feed %r done: %d ingested, %d failed",
            feed_title, ingested, failed,
        )

        return FeedResult(
            feed_title=feed_title,
            feed_url=url,
            category=category,
            total_items=len(entries),
            ingested=ingested,
            failed=failed,
            errors=errors[:10],  # cap error list
        )

    def ingest_category(
        self,
        category: str,
        max_per_feed: int = 10,
    ) -> list[FeedResult]:
        """
        Ingest all built-in feeds for a category.
        Returns one FeedResult per feed.
        """
        feeds = BUILTIN_FEEDS.get(category, [])
        if not feeds:
            log.warning("No built-in feeds for category: %s", category)
            return []

        results = []
        for url in feeds:
            result = self.ingest_feed(url, category, max_per_feed)
            results.append(result)

        return results

    def ingest_tech_news(self) -> list[FeedResult]:
        """Convenience: ingest all technology feeds."""
        return self.ingest_category("technology")

    def ingest_ai_news(self) -> list[FeedResult]:
        """Convenience: ingest all AI feeds."""
        return self.ingest_category("ai")

    def ingest_all(self, max_per_feed: int = 10) -> dict[str, list[FeedResult]]:
        """Ingest all built-in feeds across all categories."""
        results: dict[str, list[FeedResult]] = {}
        for category in BUILTIN_FEEDS:
            results[category] = self.ingest_category(category, max_per_feed)
        return results

    def list_builtin_feeds(self) -> dict[str, list[str]]:
        """Return all built-in feed URLs by category."""
        return BUILTIN_FEEDS.copy()


news_service = NewsService()
