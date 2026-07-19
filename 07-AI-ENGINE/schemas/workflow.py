from pydantic import BaseModel, Field
from typing import Any


class WorkflowTemplateRequest(BaseModel):
    template: str = Field(
        ...,
        description="Template name: research_report, code_review, feature_development, document_analysis, system_audit"
    )
    goal: str = Field(..., min_length=5)
    context: dict = Field(default_factory=dict)


class WorkflowAIRequest(BaseModel):
    goal: str = Field(..., min_length=5)


class TaskResult(BaseModel):
    task: str
    agent: str
    status: str
    result: str | None = None
    error: str | None = None
    duration: float = 0.0


class WorkflowRunResponse(BaseModel):
    workflow_id: int
    name: str
    goal: str
    status: str
    task_count: int
    completed_count: int
    failed_count: int
    duration_seconds: float
    summary: str
    success: bool


class WorkflowSummary(BaseModel):
    id: int
    name: str
    goal: str
    status: str
    task_count: int
    completed_count: int
    duration_seconds: float | None
    created_at: str
