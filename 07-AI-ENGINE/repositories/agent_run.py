import time
from sqlalchemy.orm import Session

from repositories.base import BaseRepository
from models.db.agent_run import AgentRun


class AgentRunRepository(BaseRepository[AgentRun]):

    def __init__(self, db: Session):
        super().__init__(AgentRun, db)

    def start(
        self,
        agent_name: str,
        model_used: str,
        user_input: str,
        conversation_id: int | None = None,
    ) -> AgentRun:
        run = AgentRun(
            agent_name=agent_name,
            model_used=model_used,
            user_input=user_input,
            status="running",
            conversation_id=conversation_id,
        )
        return self.create(run)

    def complete(
        self,
        run_id: int,
        output: str,
        duration_seconds: float,
    ) -> AgentRun:
        run = self.get(run_id)
        run.status = "success"
        run.output = output
        run.duration_seconds = duration_seconds
        return self.update(run)

    def fail(
        self,
        run_id: int,
        error: str,
        duration_seconds: float,
    ) -> AgentRun:
        run = self.get(run_id)
        run.status = "failed"
        run.error = error
        run.duration_seconds = duration_seconds
        return self.update(run)

    def get_by_agent(self, agent_name: str) -> list[AgentRun]:
        return (
            self.db.query(AgentRun)
            .filter(AgentRun.agent_name == agent_name)
            .order_by(AgentRun.created_at.desc())
            .all()
        )

    def get_recent(self, limit: int = 20) -> list[AgentRun]:
        return (
            self.db.query(AgentRun)
            .order_by(AgentRun.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_failed(self) -> list[AgentRun]:
        return (
            self.db.query(AgentRun)
            .filter(AgentRun.status == "failed")
            .order_by(AgentRun.created_at.desc())
            .all()
        )
