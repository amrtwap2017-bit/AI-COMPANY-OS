from domain.models.agent import AgentCreate, AgentUpdate
from infrastructure.repositories.agent import AgentRepository

class AgentService:
    def __init__(self, repository: AgentRepository):
        self.repository = repository

    def get_agent(self, agent_id: int) -> Agent:
        return self.repository.get_agent(agent_id)

    def create_agent(self, agent: AgentCreate) -> Agent:
        return self.repository.create_agent(agent)

    def update_agent(self, agent_id: int, agent: AgentUpdate) -> Agent:
        return self.repository.update_agent(agent_id, agent)

    def delete_agent(self, agent_id: int):
        self.repository.delete_agent(agent_id)