from typing import Dict, Callable, Any
from hub.core import kernel

class CommandPalette:
    """Registry for Lead Architect internal commands."""
    
    def __init__(self):
        self.commands: Dict[str, Callable] = {
            "health": self._check_health,
            "index": self._index_workspace,
            "execute": self._run_task,
            "audit": self._run_audit
        }

    async def run(self, cmd: str, *args) -> Any:
        if cmd not in self.commands:
            return {"error": f"Unknown command: {cmd}"}
        return await self.commands[cmd](*args)

    async def _check_health(self):
        return await kernel.initialize() # Simplification for demo

    async def _index_workspace(self, workspace_id, slug):
        from hub.intelligence.indexer import BrainIndexer
        indexer = BrainIndexer(workspace_id, slug)
        return await indexer.index_brains()

    async def _run_task(self, task_id, workspace_id, project_id):
        engine = kernel.execution.ExecutionEngine()
        import uuid
        return await engine.run_pipeline(task_id, workspace_id, project_id, uuid.uuid4())

    async def _run_audit(self, workspace_id):
        return await kernel.workspaces.get_workspace_status(workspace_id)

palette = CommandPalette()