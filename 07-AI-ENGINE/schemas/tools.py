from pydantic import BaseModel, Field
from typing import Any


class ToolExecuteRequest(BaseModel):
    tool: str = Field(..., description="Tool name")
    agent: str = Field(..., description="Agent making the request")
    action: str | None = Field(None, description="Action within the tool")
    params: dict = Field(default_factory=dict, description="Tool parameters")


class ToolExecuteResponse(BaseModel):
    tool: str
    success: bool
    output: Any
    error: str | None = None
    metadata: dict = {}


class ToolInfo(BaseModel):
    name: str
    description: str
    permissions_required: list[str]
