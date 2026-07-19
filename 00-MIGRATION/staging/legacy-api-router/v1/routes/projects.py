from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.project import (
    ProjectCreate,
    ProjectSummary,
    ProjectDetail,
    ProjectRunResponse,
    ProjectReport,
)
from app.projects.engine import project_engine
from app.projects.reporter import project_reporter
from app.db.database import SessionLocal
from app.models.db.project import Project

router = APIRouter()


@router.post("/projects", response_model=ProjectRunResponse)
def create_and_run_project(req: ProjectCreate):
    """
    Create and run a project autonomously.
    This is the core of Autonomous Company Mode.
    Executes the full pipeline:
    Plan → Execute → Evaluate → Critique → Report
    """
    result = project_engine.create_and_run(
        name=req.name,
        goal=req.goal,
        owner=req.owner,
        template=req.template,
        use_ai_planner=req.use_ai_planner,
    )

    return ProjectRunResponse(
        project_id=result.project_id,
        name=result.name,
        goal=result.goal,
        status=result.status,
        eval_score=result.eval_score,
        eval_passed=result.eval_passed,
        final_report=result.final_report[:2000] if result.final_report else "",
        duration_seconds=result.duration_seconds,
        success=result.success,
        error=result.error,
    )


@router.get("/projects")
def list_projects(limit: int = 20):
    """List all projects."""
    projects = project_engine.list(limit=limit)
    return {
        "projects": projects,
        "total": len(projects),
    }


@router.get("/projects/{project_id}")
def get_project(project_id: int):
    """Get project details."""
    project = project_engine.get(project_id)
    if not project:
        raise HTTPException(
            status_code=404,
            detail=f"Project {project_id} not found",
        )
    return project


@router.get("/projects/{project_id}/report")
def get_report(project_id: int):
    """Get the full project report."""
    report = project_reporter.get_full_report(project_id)
    if not report:
        raise HTTPException(
            status_code=404,
            detail=f"Project {project_id} not found",
        )
    return report


@router.get("/projects/{project_id}/summary")
def get_summary(project_id: int):
    """Get project summary."""
    summary = project_reporter.get_summary(project_id)
    if not summary:
        raise HTTPException(
            status_code=404,
            detail=f"Project {project_id} not found",
        )
    return summary


@router.delete("/projects/{project_id}")
def delete_project(project_id: int):
    """Delete a project."""
    db = SessionLocal()
    try:
        project = db.query(Project).filter(
            Project.id == project_id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        db.delete(project)
        db.commit()
        return {"message": f"Project {project_id} deleted"}
    finally:
        db.close()
