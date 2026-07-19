"""
app/api/v1/routes/scheduler.py
Scheduled job management endpoints.
"""

from fastapi import APIRouter
from app.core.scheduler import scheduler

router = APIRouter()


@router.get("/scheduler/jobs")
def list_jobs() -> dict:
    """List all registered scheduled jobs."""
    return {"jobs": scheduler.list_jobs()}


@router.post("/scheduler/jobs/{job_name}/run")
def run_job_now(job_name: str) -> dict:
    """Trigger a scheduled job immediately."""
    job = next((j for j in scheduler._jobs if j.name == job_name), None)
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Job {job_name!r} not found")

    job._execute()
    return {"triggered": True, "job": job_name}
