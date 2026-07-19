"""
app/knowledge/hybrid_search.py
────────────────────────────────────────────────────────────────
Hybrid search: vector similarity + keyword matching combined.

Pure vector search misses exact keyword matches.
Pure keyword search misses semantic similarity.
Hybrid combines both with configurable weights.

Algorithm: Reciprocal Rank Fusion (RRF)
  - Run vector search → ranked list A
  - Run keyword search → ranked list B
  - Combine via RRF: score = 1/(k + rank_A) + 1/(k + rank_B)
  - Re-rank by combined score

Result: finds documents that are semantically similar
        AND contain the exact keywords when both matter.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from app.knowledge.search import KnowledgeSearch, SearchResult
from app.knowledge.embedder import Embedder
from app.vector.qdrant import vector_service
from app.db.database import SessionLocal
from app.models.db.knowledge_entry import KnowledgeEntry

log = logging.getLogger(__name__)

KNOWLEDGE_COLLECTION = "knowledge"
RRF_K = 60   # RRF constant — higher = smoother ranking


@dataclass
class HybridSearchResult:
    """Extended search result with both scores."""
    score:        float   # combined RRF score
    vector_score: float   # from Qdrant similarity
    keyword_score: float  # from PostgreSQL ILIKE rank
    text:         str
    source:       str
    title:        str
    document_id:  int
    chunk_index:  int


class HybridKnowledgeSearch:

    def __init__(self) -> None:
        self._embedder = Embedder()
        self._vector   = KnowledgeSearch()

    def search(
        self,
        query:        str,
        top_k:        int   = 5,
        vector_weight: float = 0.7,   # 70% vector, 30% keyword
        min_score:    float = 0.0,
    ) -> list[HybridSearchResult]:
        """
        Hybrid search combining vector + keyword results.

        Args:
            query:         Search query
            top_k:         Number of results to return
            vector_weight: Weight for vector results (0.0–1.0)
                           keyword_weight = 1 - vector_weight
            min_score:     Minimum combined score threshold

        Returns:
            list of HybridSearchResult sorted by combined score
        """
        keyword_weight = 1.0 - vector_weight
        fetch_k = top_k * 3   # fetch extra to merge

        # Run both searches
        vector_results  = self._vector_search(query, fetch_k)
        keyword_results = self._keyword_search(query, fetch_k)

        # Build combined ranking
        combined = self._rrf_combine(
            vector_results,
            keyword_results,
            vector_weight,
            keyword_weight,
        )

        # Filter and return top_k
        filtered = [r for r in combined if r.score >= min_score]
        return filtered[:top_k]

    def search_as_context(
        self,
        query:  str,
        top_k:  int = 5,
    ) -> str:
        """Format hybrid results as context string."""
        results = self.search(query, top_k=top_k)

        if not results:
            return ""

        lines = ["Relevant knowledge (hybrid search):"]
        for i, r in enumerate(results, 1):
            lines.append(
                f"\n[{i}] Score: {r.score:.3f} | Source: {r.source}\n{r.text}"
            )

        return "\n".join(lines)

    def _vector_search(
        self,
        query: str,
        top_k: int,
    ) -> list[tuple[str, float]]:
        """
        Returns list of (content, score) from Qdrant.
        """
        try:
            vector  = self._embedder.embed(query)
            raw     = vector_service.search(
                collection=KNOWLEDGE_COLLECTION,
                vector=vector,
                top_k=top_k,
            )
            return [
                (r["payload"].get("text", ""), r["score"])
                for r in raw
                if r["payload"].get("text")
            ]
        except Exception as exc:
            log.warning("Vector search failed: %s", exc)
            return []

    def _keyword_search(
        self,
        query: str,
        top_k: int,
    ) -> list[tuple[str, float]]:
        """
        Returns list of (content, score) from PostgreSQL ILIKE.
        Score is inverse of rank position (1.0, 0.9, 0.8, ...).
        """
        db = SessionLocal()
        try:
            words   = [w for w in query.split() if len(w) > 3]
            if not words:
                return []

            # Search for any word
            q = db.query(KnowledgeEntry)
            from sqlalchemy import or_
            conditions = [
                KnowledgeEntry.content.ilike(f"%{word}%")
                for word in words[:5]
            ]
            q = q.filter(or_(*conditions))
            entries = q.limit(top_k).all()

            # Score by how many words match
            results = []
            for entry in entries:
                content_lower = entry.content.lower()
                matches = sum(
                    1 for w in words if w.lower() in content_lower
                )
                score = matches / len(words)
                results.append((entry.content, score))

            return sorted(results, key=lambda x: x[1], reverse=True)

        except Exception as exc:
            log.warning("Keyword search failed: %s", exc)
            return []
        finally:
            db.close()

    def _rrf_combine(
        self,
        vector_results:  list[tuple[str, float]],
        keyword_results: list[tuple[str, float]],
        vector_weight:   float,
        keyword_weight:  float,
    ) -> list[HybridSearchResult]:
        """
        Reciprocal Rank Fusion combining two ranked lists.
        """
        # Build rank lookups
        vector_rank:  dict[str, int]   = {}
        vector_score: dict[str, float] = {}
        for rank, (text, score) in enumerate(vector_results):
            vector_rank[text]  = rank
            vector_score[text] = score

        keyword_rank:  dict[str, int]   = {}
        keyword_score: dict[str, float] = {}
        for rank, (text, score) in enumerate(keyword_results):
            keyword_rank[text]  = rank
            keyword_score[text] = score

        # All unique texts
        all_texts = set(vector_rank.keys()) | set(keyword_rank.keys())

        results: list[HybridSearchResult] = []
        for text in all_texts:
            v_rank  = vector_rank.get(text,  len(vector_results)  + RRF_K)
            k_rank  = keyword_rank.get(text, len(keyword_results) + RRF_K)

            v_rrf   = vector_weight  / (RRF_K + v_rank)
            k_rrf   = keyword_weight / (RRF_K + k_rank)
            combined_score = v_rrf + k_rrf

            results.append(HybridSearchResult(
                score=round(combined_score, 4),
                vector_score=round(vector_score.get(text, 0.0), 4),
                keyword_score=round(keyword_score.get(text, 0.0), 4),
                text=text[:2000],
                source="knowledge",
                title="",
                document_id=0,
                chunk_index=0,
            ))

        return sorted(results, key=lambda r: r.score, reverse=True)


hybrid_search = HybridKnowledgeSearch()
