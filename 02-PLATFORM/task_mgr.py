"""
Task Manager — Wave 4 Production
Enforces DAG dependencies and workspace isolation.
"""
from __future__ import annotations
from uuid import UUID, uuid4
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from .task_models import TaskModel

class TaskManager:
    def __init__(self, db: AsyncSession):
        self._db = db

    async def list_tasks(self, workspace_id: UUID, project_id: UUID | None = None, status: str | None = None):
        sql = "SELECT id, title, task_type, status, assigned_agent, created_at, run_group FROM tasks WHERE workspace_id = :wid"
        params = {"wid": str(workspace_id)}
        if project_id:
            sql += " AND project_id = :pid"
            params["pid"] = str(project_id)
        if status:
            sql += " AND status = :status"
            params["status"] = status
        
        sql += " ORDER BY created_at DESC"
        result = await self._db.execute(text(sql), params)
        return [dict(r._mapping) for r in result.fetchall()]

    async def create_task(self, workspace_id: UUID, project_id: UUID, title: str, task_type: str = "story", **kwargs):
        tid = str(uuid4())
        # Default empty JSON for acceptance criteria if not provided
        ac = kwargs.get("acceptance_criteria", "{}")
        if isinstance(ac, dict):
            import json
            ac = json.dumps(ac)

        await self._db.execute(
            text("""INSERT INTO tasks (id, workspace_id, project_id, title, task_type, acceptance_criteria, status)
                 VALUES (:tid, :wid, :pid, :title, :tt, CAST(:ac AS jsonb), 'pending')"""),
            {"tid": tid, "wid": str(workspace_id), "pid": str(project_id), "title": title, "tt": task_type, "ac": ac}
        )
        await self._db.commit()
        return {"id": tid, "status": "pending"}
