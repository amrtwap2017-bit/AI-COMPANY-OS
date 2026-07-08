from sqlalchemy.orm import Session
from domain.models.agent import AgentCreate, AgentUpdate, Agent
from infrastructure.db.models.agent import Agent as DBAgent

class AgentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_agent(self, agent_id: int) -> Agent:
        return self.db.query(DBAgent).filter(DBAgent.id == agent_id).first()

    def create_agent(self, agent: AgentCreate) -> Agent:
        db_agent = DBAgent(**agent.dict())
        self.db.add(db_agent)
        self.db.commit()
        self.db.refresh(db_agent)
        return db_agent

    def update_agent(self, agent_id: int, agent: AgentUpdate) -> Agent:
        db_agent = self.get_agent(agent_id)
        for field, value in agent.dict(exclude_unset=True).items():
            setattr(db_agent, field, value)
        self.db.commit()
        self.db.refresh(db_agent)
        return db_agent

    def delete_agent(self, agent_id: int):
        db_agent = self.get_agent(agent_id)
        self.db.delete(db_agent)
        self.db.commit()