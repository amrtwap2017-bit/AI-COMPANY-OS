"""
app/tools/knowledge_synthesizer.py
────────────────────────────────────────────────────────────────
Knowledge Synthesizer — Cross-document insight generation.

Goes beyond search to find:
  - Connections between different documents
  - Contradictions across sources
  - Concept hierarchies
  - Summary of "everything we know about X"
  - Knowledge gaps (what we DON'T know)
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from tools.base import BaseTool, ToolResult

log = logging.getLogger(__name__)


@dataclass
class KnowledgeSynthesis:
    query:         str
    total_chunks:  int
    connections:   list[str]
    contradictions: list[str]
    knowledge_gaps: list[str]
    hierarchy:     dict[str, list[str]]
    summary:       str
    confidence:    float


class KnowledgeSynthesizerTool(BaseTool):
    name        = "knowledge_synthesizer"
    description = (
        "Synthesizes knowledge across all ingested documents. "
        "Finds connections, contradictions, gaps, and builds concept hierarchies. "
        "Use this when you need deep understanding beyond simple search."
    )
    permissions_required = []

    def run(
        self,
        query:      str,
        top_k:      int   = 20,
        min_score:  float = 0.25,
    ) -> ToolResult:
        """
        Synthesize knowledge about a topic.

        Args:
            query:     Topic to synthesize
            top_k:     Max knowledge chunks to analyze
            min_score: Minimum relevance score

        Returns:
            ToolResult with synthesis report
        """
        try:
            chunks = self._retrieve_chunks(query, top_k, min_score)

            if not chunks:
                return ToolResult(
                    tool=self.name,
                    success=False,
                    output=None,
                    error=f"No knowledge found for: {query}",
                )

            synthesis = self._synthesize(query, chunks)

            return ToolResult(
                tool=self.name,
                success=True,
                output={
                    "query":          synthesis.query,
                    "chunks_analyzed": synthesis.total_chunks,
                    "connections":    synthesis.connections,
                    "contradictions": synthesis.contradictions,
                    "knowledge_gaps": synthesis.knowledge_gaps,
                    "hierarchy":      synthesis.hierarchy,
                    "summary":        synthesis.summary,
                    "confidence":     synthesis.confidence,
                },
                metadata={"query": query, "chunks": len(chunks)},
            )

        except Exception as exc:
            log.error("Synthesis failed: %s", exc)
            return ToolResult(
                tool=self.name,
                success=False,
                output=None,
                error=str(exc),
            )

    def _retrieve_chunks(
        self,
        query: str,
        top_k: int,
        min_score: float,
    ) -> list[dict]:
        """Retrieve relevant chunks from knowledge base."""
        try:
            from knowledge.hybrid_search import hybrid_search
            results = hybrid_search.search(
                query=query,
                top_k=top_k,
                vector_weight=0.7,
                min_score=min_score,
            )
            return [
                {
                    "text":   r.text,
                    "source": r.source,
                    "score":  r.score,
                }
                for r in results
            ]
        except Exception as exc:
            log.warning("Hybrid search failed, trying basic: %s", exc)
            try:
                from knowledge.search import knowledge_search
                results = knowledge_search.search(query, top_k=top_k)
                return [
                    {"text": r.text, "source": r.source, "score": r.score}
                    for r in results
                ]
            except Exception as exc2:
                log.error("All search methods failed: %s", exc2)
                return []

    def _synthesize(
        self,
        query:  str,
        chunks: list[dict],
    ) -> KnowledgeSynthesis:
        """Build synthesis from chunks."""
        all_text = "\n\n".join(c["text"] for c in chunks)
        sentences = [s.strip() for s in re.split(r"[.!?]+", all_text) if len(s.strip()) > 20]

        # Find connections (sentences that share topic keywords)
        connections = self._find_connections(sentences, query)

        # Find contradictions
        contradictions = self._find_contradictions(sentences)

        # Identify knowledge gaps (questions implied but not answered)
        knowledge_gaps = self._find_gaps(query, sentences)

        # Build concept hierarchy
        hierarchy = self._build_hierarchy(sentences, query)

        # Confidence
        avg_score  = sum(c["score"] for c in chunks) / max(len(chunks), 1)
        confidence = round(min(1.0, avg_score * 1.2), 2)

        # Summary
        sources = list({c["source"] for c in chunks})
        summary = (
            f"Synthesized {len(chunks)} knowledge chunks from "
            f"{len(sources)} source(s) about '{query}'. "
            f"Found {len(connections)} conceptual connections, "
            f"{len(contradictions)} contradictions, "
            f"{len(knowledge_gaps)} knowledge gaps. "
            f"Knowledge confidence: {confidence:.0%}."
        )

        return KnowledgeSynthesis(
            query=query,
            total_chunks=len(chunks),
            connections=connections[:8],
            contradictions=contradictions[:5],
            knowledge_gaps=knowledge_gaps[:5],
            hierarchy=hierarchy,
            summary=summary,
            confidence=confidence,
        )

    def _find_connections(
        self,
        sentences: list[str],
        query:     str,
    ) -> list[str]:
        """Find sentences that connect to the main topic."""
        query_words = set(query.lower().split()) - {"the", "a", "an", "of", "in"}
        connections = []

        for sentence in sentences:
            words = set(sentence.lower().split())
            overlap = query_words & words
            if len(overlap) >= 2 and len(sentence) > 40:
                connections.append(sentence[:150])

        return list(dict.fromkeys(connections))

    def _find_contradictions(self, sentences: list[str]) -> list[str]:
        """Find potentially contradictory statements."""
        contradictions = []
        negations = {"not", "never", "no", "false", "incorrect", "wrong", "unlike"}

        positives = [s for s in sentences if not any(w in s.lower().split() for w in negations)]
        negatives = [s for s in sentences if any(w in s.lower().split() for w in negations)]

        for pos in positives[:15]:
            pos_words = set(pos.lower().split()) - {"the","a","is","are","was"}
            for neg in negatives[:15]:
                neg_words = set(neg.lower().split()) - {"the","a","is","are","was"}
                overlap   = pos_words & neg_words
                if len(overlap) >= 4:
                    contradictions.append(f"'{pos[:80]}' vs '{neg[:80]}'")
                    break

        return contradictions

    def _find_gaps(self, query: str, sentences: list[str]) -> list[str]:
        """Identify what is NOT covered in the knowledge base."""
        all_text  = " ".join(sentences).lower()
        gap_indicators = [
            (f"how {query.lower()} works", "mechanism/how it works"),
            (f"when to use {query.lower()}", "when/use cases"),
            (f"{query.lower()} limitations", "limitations/drawbacks"),
            (f"{query.lower()} alternatives", "alternatives/comparisons"),
            (f"{query.lower()} cost", "pricing/cost information"),
        ]

        gaps = []
        for indicator, description in gap_indicators:
            words = indicator.split()
            if not any(w in all_text for w in words[1:3]):
                gaps.append(f"Gap: {description} not well documented")

        return gaps

    def _build_hierarchy(
        self,
        sentences: list[str],
        query:     str,
    ) -> dict[str, list[str]]:
        """Build a simple concept hierarchy."""
        hierarchy: dict[str, list[str]] = {
            "core_concepts":  [],
            "related_topics": [],
            "examples":       [],
            "key_terms":      [],
        }

        example_patterns = re.compile(r"\b(example|such as|like|e\.g\.|for instance)\b", re.I)
        concept_patterns = re.compile(r"\b(is|are|means|refers to|defined as)\b", re.I)

        for sentence in sentences[:30]:
            if example_patterns.search(sentence):
                hierarchy["examples"].append(sentence[:100])
            elif concept_patterns.search(sentence) and len(sentence) < 150:
                hierarchy["core_concepts"].append(sentence[:100])

        # Extract key terms (capitalized words that appear multiple times)
        all_text = " ".join(sentences)
        words    = re.findall(r"\b[A-Z][a-z]{3,}\b", all_text)
        from collections import Counter
        common = [word for word, count in Counter(words).most_common(10) if count >= 2]
        hierarchy["key_terms"] = common

        return {k: list(dict.fromkeys(v))[:5] for k, v in hierarchy.items()}


knowledge_synthesizer_tool = KnowledgeSynthesizerTool()
