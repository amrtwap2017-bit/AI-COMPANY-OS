"""
app/api/v1/routes/real_time.py
────────────────────────────────────────────────────────────────
Real-Time Data API endpoints.

Search, scrape, and news ingestion capabilities.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


# ── Pydantic Schemas ──────────────────────────────────────────

class SearchRequest(BaseModel):
    query:       str
    max_results: int = 5
    region:      str = "wt-wt"


class ScrapeRequest(BaseModel):
    url:       str
    max_chars: int = 8000


class FeedIngestRequest(BaseModel):
    url:          str
    category:     str = "general"
    max_articles: int = 15


class CategoryIngestRequest(BaseModel):
    category:     str
    max_per_feed: int = 10


# ── Helper ────────────────────────────────────────────────────

def _feed_result_to_dict(r) -> dict:
    return {
        "feed_title":  r.feed_title,
        "feed_url":    r.feed_url,
        "category":    r.category,
        "total_items": r.total_items,
        "ingested":    r.ingested,
        "failed":      r.failed,
        "errors":      r.errors,
    }


# ── Search Endpoints ──────────────────────────────────────────

@router.post("/search/web")
def web_search(req: SearchRequest) -> dict:
    """
    Search the internet using DuckDuckGo.
    Returns titles, snippets, and URLs.
    No API key required.
    """
    from tools.web_search import web_search_tool

    result = web_search_tool.run(
        query=req.query,
        max_results=req.max_results,
        region=req.region,
    )

    if not result.success:
        raise HTTPException(status_code=502, detail=result.error)

    return {
        "query":   req.query,
        "count":   len(result.output),
        "results": result.output,
    }


@router.post("/search/scrape")
def scrape_url(req: ScrapeRequest) -> dict:
    """
    Extract main text content from a URL.
    Strips ads, navigation, and scripts.
    """
    from tools.web_scraper import web_scraper_tool

    result = web_scraper_tool.run(
        url=req.url,
        max_chars=req.max_chars,
    )

    if not result.success:
        raise HTTPException(status_code=502, detail=result.error)

    return result.output


@router.post("/search/research")
def research(req: SearchRequest) -> dict:
    """
    Combined: search + scrape top result.
    Returns search results plus full content of first URL.
    Perfect for agent research tasks.
    """
    from tools.web_search  import web_search_tool
    from tools.web_scraper import web_scraper_tool

    # Search
    search_result = web_search_tool.run(
        query=req.query,
        max_results=req.max_results,
    )

    if not search_result.success or not search_result.output:
        raise HTTPException(
            status_code=502,
            detail=search_result.error or "No results found",
        )

    results = search_result.output

    # Scrape first URL
    top_url    = results[0]["url"]
    scraped    = web_scraper_tool.run(url=top_url, max_chars=6000)
    full_text  = scraped.output.get("content", "") if scraped.success else ""

    return {
        "query":         req.query,
        "search_results": results,
        "top_url":        top_url,
        "full_content":   full_text,
        "scrape_success": scraped.success,
    }


# ── News Ingestion Endpoints ──────────────────────────────────

@router.post("/news/ingest/feed")
def ingest_feed(req: FeedIngestRequest) -> dict:
    """
    Fetch an RSS feed and ingest all articles into the Knowledge Engine.
    After ingestion, agents can retrieve this news via RAG.
    """
    from services.news_service import news_service

    result = news_service.ingest_feed(
        url=req.url,
        category=req.category,
        max_articles=req.max_articles,
    )

    return _feed_result_to_dict(result)


@router.post("/news/ingest/category")
def ingest_category(req: CategoryIngestRequest) -> dict:
    """
    Ingest all built-in RSS feeds for a category.
    Categories: technology | ai | science | business
    """
    from services.news_service import news_service

    results = news_service.ingest_category(
        category=req.category,
        max_per_feed=req.max_per_feed,
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"No built-in feeds for category: {req.category!r}",
        )

    total_ingested = sum(r.ingested for r in results)
    total_failed   = sum(r.failed   for r in results)

    return {
        "category":      req.category,
        "feeds":         len(results),
        "total_ingested": total_ingested,
        "total_failed":   total_failed,
        "details":       [_feed_result_to_dict(r) for r in results],
    }


@router.post("/news/ingest/all")
def ingest_all_news() -> dict:
    """
    Ingest all built-in RSS feeds across all categories.
    Technology, AI, Science, Business.
    """
    from services.news_service import news_service

    all_results = news_service.ingest_all(max_per_feed=10)
    summary: dict[str, dict] = {}

    for category, feed_results in all_results.items():
        summary[category] = {
            "feeds":    len(feed_results),
            "ingested": sum(r.ingested for r in feed_results),
            "failed":   sum(r.failed   for r in feed_results),
        }

    total = sum(v["ingested"] for v in summary.values())

    return {
        "total_ingested": total,
        "categories":     summary,
    }


@router.get("/news/feeds")
def list_feeds() -> dict:
    """List all built-in RSS feeds."""
    from services.news_service import news_service
    return {"feeds": news_service.list_builtin_feeds()}
