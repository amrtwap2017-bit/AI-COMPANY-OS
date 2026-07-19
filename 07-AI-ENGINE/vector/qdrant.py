from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    QueryRequest,
)

from core.config import settings

_client = QdrantClient(
    host=settings.QDRANT_HOST,
    port=settings.QDRANT_PORT,
)


class VectorService:

    def __init__(self):
        self.client = _client

    def health(self) -> bool:
        try:
            self.client.get_collections()
            return True
        except Exception:
            return False

    def ensure_collection(self, name: str, size: int = 768) -> None:
        existing = [
            c.name for c in self.client.get_collections().collections
        ]
        if name not in existing:
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=size,
                    distance=Distance.COSINE,
                ),
            )

    def upsert(
        self,
        collection: str,
        id: int,
        vector: list[float],
        payload: dict,
    ) -> None:
        self.client.upsert(
            collection_name=collection,
            points=[PointStruct(id=id, vector=vector, payload=payload)],
        )

    def search(
        self,
        collection: str,
        vector: list[float],
        top_k: int = 5,
    ) -> list[dict]:
        results = self.client.query_points(
            collection_name=collection,
            query=vector,
            limit=top_k,
        ).points

        return [
            {"score": r.score, "payload": r.payload}
            for r in results
        ]

    def list_collections(self) -> list[str]:
        return [
            c.name for c in self.client.get_collections().collections
        ]


vector_service = VectorService()
