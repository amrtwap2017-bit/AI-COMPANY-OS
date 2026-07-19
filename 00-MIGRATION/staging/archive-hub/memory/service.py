"""Memory service — matches real DB schema (project_id, extra_meta NOT NULL)."""
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from hub.db.engine import engine
from hub.memory.models import Memory

def remember(workspace_id: str, memory_type: str = "architecture",
             subject: str = "", content: str = "", run_group: str = "",
             project_id: str = "") -> dict:
    with Session(engine) as s:
        m = Memory(
            id=str(uuid.uuid4()),
            workspace_id=workspace_id or "",
            project_id=project_id or "",
            run_group=run_group or "",
            memory_type=memory_type or "architecture",
            subject=subject or "",
            content=content or "",
            extra_meta={},
            created_at=datetime.utcnow(),
        )
        s.add(m)
        s.commit()
        return {"id": m.id, "ok": True}

def recall(workspace_id: str = "", memory_type: str = None) -> list:
    with Session(engine) as s:
        q = s.query(Memory)
        if workspace_id:
            q = q.filter(Memory.workspace_id == workspace_id)
        if memory_type:
            q = q.filter(Memory.memory_type == memory_type)
        rows = q.order_by(Memory.created_at.desc()).limit(50).all()
        return [{"id": r.id, "workspace_id": r.workspace_id,
                 "type": r.memory_type, "subject": r.subject,
                 "content": r.content[:500], "created_at": str(r.created_at)}
                for r in rows]
