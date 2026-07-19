"""
app/knowledge/graph/extractor.py
────────────────────────────────────────────────────────────────
Extracts named entities from text using NLTK.

Entity types detected:
  TECHNOLOGY  → programming languages, frameworks, tools
  CONCEPT     → AI/ML concepts, business terms
  ORGANIZATION → company names (NNP patterns)
  PERSON      → person names (NNP NNP patterns)

Uses NLTK chunking — no heavy models needed.
Falls back to keyword matching for tech terms.
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field

log = logging.getLogger(__name__)

# ── Tech/Concept keyword lists ────────────────────────────────

TECHNOLOGY_KEYWORDS = {
    "python", "fastapi", "postgresql", "qdrant", "ollama", "docker",
    "kubernetes", "redis", "celery", "react", "nextjs", "typescript",
    "javascript", "rust", "golang", "java", "sql", "nosql", "mongodb",
    "elasticsearch", "kafka", "graphql", "rest", "grpc", "tensorflow",
    "pytorch", "scikit-learn", "langchain", "openai", "llm", "gpt",
    "bert", "transformer", "embedding", "vector", "rag",
    "git", "linux", "nginx", "gunicorn", "uvicorn", "alembic",
    "sqlalchemy", "pydantic", "jwt", "oauth",
}

CONCEPT_KEYWORDS = {
    "machine learning", "deep learning", "neural network", "artificial intelligence",
    "natural language processing", "computer vision", "reinforcement learning",
    "supervised learning", "unsupervised learning", "fine-tuning",
    "retrieval augmented generation", "knowledge graph", "semantic search",
    "vector database", "embedding", "tokenization", "attention mechanism",
    "transformer", "inference", "training", "model", "dataset",
    "api", "microservice", "monolith", "architecture", "design pattern",
    "authentication", "authorization", "encryption", "security",
    "devops", "ci/cd", "deployment", "containerization", "orchestration",
}


@dataclass
class ExtractedEntity:
    text:        str
    entity_type: str
    canonical:   str           # normalised lowercase version
    start:       int = 0
    end:         int = 0
    context:     str = ""      # surrounding text snippet


class EntityExtractor:

    def extract(self, text: str, source: str = "") -> list[ExtractedEntity]:
        """
        Extract named entities from text.
        Returns list of ExtractedEntity objects.
        """
        entities: list[ExtractedEntity] = []

        entities.extend(self._extract_technologies(text))
        entities.extend(self._extract_concepts(text))
        entities.extend(self._extract_nltk_entities(text))

        # Deduplicate by canonical name
        seen: set[str] = set()
        unique: list[ExtractedEntity] = []
        for e in entities:
            if e.canonical not in seen:
                seen.add(e.canonical)
                unique.append(e)

        return unique

    def _extract_technologies(self, text: str) -> list[ExtractedEntity]:
        """Match known technology keywords."""
        text_lower = text.lower()
        entities   = []

        for tech in TECHNOLOGY_KEYWORDS:
            # Match whole word
            pattern = r"\b" + re.escape(tech) + r"\b"
            for match in re.finditer(pattern, text_lower):
                start = match.start()
                context = text[max(0, start - 40): start + len(tech) + 40]
                entities.append(ExtractedEntity(
                    text=tech.title(),
                    entity_type="TECHNOLOGY",
                    canonical=tech,
                    start=start,
                    end=match.end(),
                    context=context.strip(),
                ))
                break  # one per document per tech term

        return entities

    def _extract_concepts(self, text: str) -> list[ExtractedEntity]:
        """Match known concept phrases."""
        text_lower = text.lower()
        entities   = []

        for concept in CONCEPT_KEYWORDS:
            if concept in text_lower:
                idx = text_lower.find(concept)
                context = text[max(0, idx - 40): idx + len(concept) + 40]
                entities.append(ExtractedEntity(
                    text=concept.title(),
                    entity_type="CONCEPT",
                    canonical=concept,
                    start=idx,
                    end=idx + len(concept),
                    context=context.strip(),
                ))

        return entities

    def _extract_nltk_entities(self, text: str) -> list[ExtractedEntity]:
        """Use NLTK to find person and org names."""
        entities: list[ExtractedEntity] = []
        try:
            import nltk
            # Ensure required data is downloaded
            for resource in ["punkt", "averaged_perceptron_tagger", "maxent_ne_chunker", "words"]:
                try:
                    nltk.data.find(f"tokenizers/{resource}")
                except LookupError:
                    try:
                        nltk.download(resource, quiet=True)
                    except Exception:
                        pass

            tokens = nltk.word_tokenize(text[:2000])   # limit for speed
            pos    = nltk.pos_tag(tokens)
            chunks = nltk.ne_chunk(pos, binary=False)

            for chunk in chunks:
                if hasattr(chunk, "label"):
                    name  = " ".join(c[0] for c in chunk)
                    label = chunk.label()
                    if label in ("PERSON", "ORGANIZATION", "GPE"):
                        etype = "PERSON" if label == "PERSON" else "ORGANIZATION"
                        entities.append(ExtractedEntity(
                            text=name,
                            entity_type=etype,
                            canonical=name.lower(),
                        ))

        except Exception as exc:
            log.debug("NLTK extraction failed (non-fatal): %s", exc)

        return entities


entity_extractor = EntityExtractor()
