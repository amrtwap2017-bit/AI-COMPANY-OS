from hub.core.loader import platform_layer
vector_mod = platform_layer("vector")

def get_vector_store(workspace_id, workspace_slug):
    return vector_mod.qdrant_client.WorkspaceVectorStore(workspace_id, workspace_slug)