"""
Knowledge Search
─────────────────────────────────────────────────────
Semantic search over the knowledge base.
  1. Embed the query
  2. Search Qdrant for nearest vectors
  3. Return ranked results with metadata
"""

from dataclasses import dataclass

from knowledge.embedder import Embedder
from vector.qdrant import vector_service

KNOWLEDGE_COLLECTION = "knowledge"


@dataclass
class SearchResult:
    score: float
    text: str
    source: str
    title: str
    document_id: int
    chunk_index: int


class KnowledgeSearch:

    def __init__(self):
        self.embedder = Embedder()

    def search(
        self,
        query: str,
        top_k: int = 5,
        min_score: float = 0.3,
    ) -> list[SearchResult]:
        """
        Semantic search: embed query → find nearest chunks.
        """
        vector = self.embedder.embed(query)

        raw_results = vector_service.search(
            collection=KNOWLEDGE_COLLECTION,
            vector=vector,
            top_k=top_k,
        )

        results = []
        for r in raw_results:
            if r["score"] < min_score:
                continue
            payload = r["payload"]
            results.append(
                SearchResult(
                    score=r["score"],
                    text=payload.get("content", payload.get("text", "")),
                    source=payload.get("source", ""),
                    title=payload.get("title", ""),
                    document_id=payload.get("document_id", 0),
                    chunk_index=payload.get("chunk_index", 0),
                )
            )

        return results

    def search_as_context(
        self,
        query: str,
        top_k: int = 5,
    ) -> str:
        """
        Returns search results formatted as a context string
        ready to inject into an agent system prompt.
        """
        results = self.search(query, top_k=top_k)

        if not results:
            return ""

        lines = ["Relevant knowledge:"]
        for i, r in enumerate(results, 1):
            lines.append(
                f"\n[{i}] Source: {r.source} | Score: {r.score:.2f}\n{r.text}"
            )

        return "\n".join(lines)


knowledge_search = KnowledgeSearch()
