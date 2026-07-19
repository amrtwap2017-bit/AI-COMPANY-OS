import os
from uuid import UUID
from hub.core.loader import platform_layer
from hub.vectors import get_vector_store

knowledge_mod = platform_layer("knowledge")

class BrainIndexer:
    """Indexes Triangle Black domain knowledge into the vector store."""
    
    def __init__(self, workspace_id: UUID, workspace_slug: str):
        self.workspace_id = str(workspace_id)
        self.workspace_slug = workspace_slug
        self.store = get_vector_store(workspace_id, workspace_slug)
        self.ingester = knowledge_mod.ingester.KnowledgeIngester(
            self.workspace_id, self.workspace_slug, self.store
        )

    async def index_brains(self):
        """Crawls the brains/triangle-black directory and indexes everything."""
        brain_path = os.path.join(os.getcwd(), "brains", "triangle-black")
        print(f"Indexing Triangle Black Brains from: {brain_path}")
        
        await self.store.ensure_collections()
        results = await self.ingester.ingest_directory(brain_path)
        
        print(f"Indexing Complete: {results['ingested']} files, {results['total_chunks']} chunks.")
        return results