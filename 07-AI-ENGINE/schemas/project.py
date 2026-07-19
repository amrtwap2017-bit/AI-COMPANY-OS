from pydantic import BaseModel, Field
from typing import Any


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=500)
    goal: str = Field(..., min_length=10)
    description: str | None = None
    template: str | None = None
    use_ai_planner: bool = False
    owner: str = "admin"


class ProjectSummary(BaseModel):
    id: int
    name: str
    goal: str
    status: str
    owner: str
    eval_score: float | None
    duration_seconds: float | None
    has_report: bool
    created_at: str


class ProjectDetail(BaseModel):
    id: int
    name: str
    goal: str
    status: str
    owner: str
    workflow_run_id: int | None
    eval_score: float | None
    eval_feedback: str | None
    critic_feedback: str | None
    duration_seconds: float | None
    has_report: bool
    created_at: str


class ProjectRunResponse(BaseModel):
    project_id: int
    name: str
    goal: str
    status: str
    eval_score: float
    eval_passed: bool
    final_report: str
    duration_seconds: float
    success: bool
    error: str | None = None


class ProjectReport(BaseModel):
    id: int
    name: str
    goal: str
    status: str
    eval_score: float | None
    final_report: str | None
    critic_feedback: str | None
    duration_seconds: float | None
    created_at: str
