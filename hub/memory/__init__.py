from hub.core.loader import platform_layer
memory_mod = platform_layer("memory")

def get_memory_manager(workspace_id, workspace_slug):
    return memory_mod.memory_manager.MemoryManager(workspace_id, workspace_slug)