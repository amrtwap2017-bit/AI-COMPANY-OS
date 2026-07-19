"""
Embedder
─────────────────────────────────────────────────────
Converts text into vector embeddings using Ollama.
Default model: bge-m3 (1024 dimensions, multilingual)
"""

from app.services.ollama import ollama_service

EMBED_MODEL = "bge-m3"
EMBED_DIMENSIONS = 1024


class Embedder:

    def __init__(self, model: str = EMBED_MODEL):
        self.model = model
        self.dimensions = EMBED_DIMENSIONS

    def embed(self, text: str) -> list[float]:
        """
        Embed a single string.
        Returns a list of floats (the vector).
        """
        return ollama_service.embed(self.model, text)

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Embed multiple strings.
        Returns a list of vectors.
        """
        vectors = []
        for text in texts:
            vector = self.embed(text)
            vectors.append(vector)
        return vectors

    def health(self) -> bool:
        try:
            result = self.embed("health check")
            return len(result) > 0
        except Exception:
            return False


embedder = Embedder()
