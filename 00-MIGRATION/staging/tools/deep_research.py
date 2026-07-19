"""
app/tools/deep_research.py
────────────────────────────────────────────────────────────────
Deep Research Tool — Multi-source research aggregation.

Goes far beyond basic web_search:
  1. Search DDG for top URLs
  2. Scrape and extract full content from each URL
  3. Cross-reference facts across sources
  4. Detect contradictions
  5. Return structured research report with confidence scores

This is what separates surface-level from expert-level research.
"""

from __future__ import annotations

import logging
import time
import re
from dataclasses import dataclass, field

from app.tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)

MAX_SOURCES    = 7
MAX_CHARS_PER  = 4000
MIN_CONFIDENCE = 0.3


@dataclass
class ResearchSource:
    url:        str
    title:      str
    content:    str
    word_count: int
    scraped:    bool = False
    error:      str | None = None


@dataclass
class ResearchReport:
    query:           str
    sources:         list[ResearchSource]
    key_facts:       list[str]
    contradictions:  list[str]
    confidence:      float
    summary:         str
    total_words:     int


class DeepResearchTool(BaseTool):
    name        = "deep_research"
    description = (
        "Multi-source deep research. Searches the web, scrapes full articles, "
        "cross-references facts, detects contradictions, and returns a structured "
        "research report. Much more thorough than basic web search."
    )
    permissions_required = []

    def run(
        self,
        query:       str,
        max_sources: int   = 5,
        scrape:      bool  = True,
        min_words:   int   = 100,
    ) -> ToolResult:
        """
        Deep research pipeline.

        Args:
            query:       Research query
            max_sources: Max URLs to process (1-7)
            scrape:      Whether to scrape full article content
            min_words:   Minimum words per source to include

        Returns:
            ToolResult with output = ResearchReport dict
        """
        max_sources = min(max(1, max_sources), MAX_SOURCES)

        # Step 1: Search
        urls = self._search(query, max_sources * 2)
        if not urls:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=f"No search results for: {query}",
            )

        # Step 2: Scrape sources
        sources: list[ResearchSource] = []
        for url in urls[:max_sources]:
            source = self._scrape_source(url, scrape)
            if source.word_count >= min_words:
                sources.append(source)
            if len(sources) >= max_sources:
                break

        if not sources:
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error="Could not extract content from any source",
            )

        # Step 3: Analyze
        report = self._analyze(query, sources)

        return ToolResult(
            tool=self.name,
            success=True,
            output={
                "query":          report.query,
                "sources_count":  len(report.sources),
                "key_facts":      report.key_facts,
                "contradictions": report.contradictions,
                "confidence":     report.confidence,
                "summary":        report.summary,
                "total_words":    report.total_words,
                "sources": [
                    {
                        "url":        s.url,
                        "title":      s.title,
                        "word_count": s.word_count,
                        "scraped":    s.scraped,
                        "preview":    s.content[:300],
                    }
                    for s in report.sources
                ],
            },
            metadata={
                "query":   query,
                "sources": len(sources),
            },
        )

    def _search(self, query: str, count: int) -> list[str]:
        """Search DDG and return URLs."""
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=count))
            return [r.get("href", "") for r in results if r.get("href")]
        except Exception as exc:
            log.warning("Search failed: %s", exc)
            return []

    def _scrape_source(self, url: str, scrape: bool) -> ResearchSource:
        """Scrape a single URL."""
        if not scrape:
            return ResearchSource(
                url=url, title=url, content="",
                word_count=0, scraped=False,
            )

        try:
            import trafilatura
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return ResearchSource(
                    url=url, title=url, content="",
                    word_count=0, scraped=False,
                    error="Could not fetch",
                )

            content = trafilatura.extract(downloaded, include_tables=True) or ""
            meta    = trafilatura.extract_metadata(downloaded)
            title   = meta.title if meta and meta.title else url

            content = content[:MAX_CHARS_PER]
            return ResearchSource(
                url=url,
                title=title,
                content=content,
                word_count=len(content.split()),
                scraped=True,
            )

        except Exception as exc:
            return ResearchSource(
                url=url, title=url, content="",
                word_count=0, scraped=False,
                error=str(exc),
            )

    def _analyze(
        self,
        query:   str,
        sources: list[ResearchSource],
    ) -> ResearchReport:
        """Analyze sources and produce structured report."""
        all_text  = "\n\n".join(s.content for s in sources if s.content)
        sentences = re.split(r"[.!?]+", all_text)

        # Extract key facts (sentences with numbers/dates/specific claims)
        key_facts = []
        fact_patterns = [
            r"\b\d{4}\b",           # years
            r"\b\d+%\b",            # percentages
            r"\$[\d,]+",            # dollar amounts
            r"\b(is|are|was|were|will be|has|have)\b",  # factual claims
        ]
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 30 and any(
                re.search(p, sentence) for p in fact_patterns
            ):
                key_facts.append(sentence)

        key_facts = list(dict.fromkeys(key_facts))[:10]  # deduplicate, limit

        # Detect contradictions (simplified — look for opposing statements)
        contradictions = self._find_contradictions(sentences)

        # Confidence based on source quality
        scraped_count = sum(1 for s in sources if s.scraped)
        confidence    = round(
            min(1.0, scraped_count / max(len(sources), 1) * 0.8
                + (len(key_facts) / 10) * 0.2),
            2,
        )

        # Summary
        total_words = sum(s.word_count for s in sources)
        summary = (
            f"Research on '{query}' aggregated {len(sources)} sources "
            f"({total_words:,} words). Found {len(key_facts)} key facts. "
        )
        if contradictions:
            summary += f"Detected {len(contradictions)} potential contradictions. "
        summary += f"Confidence: {confidence:.0%}."

        return ResearchReport(
            query=query,
            sources=sources,
            key_facts=key_facts,
            contradictions=contradictions,
            confidence=confidence,
            summary=summary,
            total_words=total_words,
        )

    def _find_contradictions(self, sentences: list[str]) -> list[str]:
        """Find sentences that contradict each other (simplified)."""
        contradictions = []
        negation_words = ["not", "never", "no", "false", "incorrect", "wrong"]
        positives = [s for s in sentences if len(s) > 20
                     and not any(w in s.lower() for w in negation_words)]
        negatives = [s for s in sentences if len(s) > 20
                     and any(w in s.lower() for w in negation_words)]

        for pos in positives[:20]:
            for neg in negatives[:20]:
                words_pos = set(pos.lower().split())
                words_neg = set(neg.lower().split())
                overlap   = words_pos & words_neg - {"the","a","an","is","are"}
                if len(overlap) >= 3:
                    contradictions.append(
                        f"'{pos[:80]}...' vs '{neg[:80]}...'"
                    )
                    break

        return contradictions[:5]


deep_research_tool = DeepResearchTool()
