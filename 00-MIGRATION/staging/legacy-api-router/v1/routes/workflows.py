from fastapi import APIRouter, HTTPException

from app.schemas.workflow import (
    WorkflowTemplateRequest,
    WorkflowAIRequest,
    WorkflowRunResponse,
    WorkflowSummary,
)
from app.workflows.engine import workflow_engine
from app.workflows.templates import TEMPLATES, list_templates

router = APIRouter()


@router.get("/workflows/templates")
def get_templates():
    """List all available workflow templates."""
    return {
        "templates": list(TEMPLATES.keys()),
        "count": len(TEMPLATES),
    }


@router.post("/workflows/run/template", response_model=WorkflowRunResponse)
def run_template(req: WorkflowTemplateRequest):
    """
    Run a predefined workflow template.
    Fast and reliable for known workflows.
    """
    if req.template not in TEMPLATES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown template: {req.template}. Available: {list(TEMPLATES.keys())}",
        )

    result = workflow_engine.run_template(
        template_name=req.template,
        goal=req.goal,
        context=req.context,
    )

    return WorkflowRunResponse(
        workflow_id=result.workflow_id,
        name=result.name,
        goal=result.goal,
        status=result.status.value,
        task_count=result.task_count,
        completed_count=result.completed_count,
        failed_count=result.failed_count,
        duration_seconds=result.duration_seconds,
        summary=result.summary[:1000] if result.summary else "",
        success=result.success,
    )


@router.post("/workflows/run/ai", response_model=WorkflowRunResponse)
def run_ai_planned(req: WorkflowAIRequest):
    """
    Let the AI planner design and execute a workflow.
    More flexible — works for any goal.
    """
    result = workflow_engine.run_ai_planned(goal=req.goal)

    return WorkflowRunResponse(
        workflow_id=result.workflow_id,
        name=result.name,
        goal=result.goal,
        status=result.status.value,
        task_count=result.task_count,
        completed_count=result.completed_count,
        failed_count=result.failed_count,
        duration_seconds=result.duration_seconds,
        summary=result.summary[:1000] if result.summary else "",
        success=result.success,
    )


@router.get("/workflows/runs")
def list_runs(limit: int = 20):
    """List all workflow runs."""
    runs = workflow_engine.list_runs(limit=limit)
    return {"runs": runs, "total": len(runs)}


@router.get("/workflows/runs/{run_id}")
def get_run(run_id: int):
    """Get details of a specific workflow run."""
    run = workflow_engine.get_run(run_id)
    if not run:
        raise HTTPException(
            status_code=404,
            detail=f"Workflow run {run_id} not found",
        )
    return run
