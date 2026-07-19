from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AgentConfig:
    name: str
    role: str
    department: str
    model: str
    fallback: str
    temperature: float
    prompt: str
    tools: list[str]
    description: str


@dataclass
class AgentContext:
    agent_name: str
    user_input: str
    memory: list[dict] = field(default_factory=list)
    knowledge: list[dict] = field(default_factory=list)
    history: list[dict] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)


@dataclass
class AgentResponse:
    agent_name: str
    model_used: str
    content: str
    success: bool
    error: Optional[str] = None
    metadata: dict = field(default_factory=dict)
