from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str        # user | assistant | system
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    agent: str = Field(default="researcher")
    conversation_id: int | None = None
    use_memory: bool = True
    use_knowledge: bool = True
    stream: bool = False


class ChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    agent: str
    model_used: str
    response: str
    sources: list[str] = []
    context_chunks: int = 0
    tools_used: list[str] = []


class ConversationSummary(BaseModel):
    id: int
    title: str | None
    agent_name: str
    status: str
    message_count: int
    created_at: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    agent_name: str | None
    model_used: str | None
    created_at: str
