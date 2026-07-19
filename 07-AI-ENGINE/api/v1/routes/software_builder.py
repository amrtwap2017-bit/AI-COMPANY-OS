from fastapi import APIRouter, Query
from datetime import datetime
from typing import Optional
from db.database import SessionLocal
from sqlalchemy import text

router = APIRouter(prefix="/builder", tags=["software-builder"])


@router.get("/runs")
async def get_builder_runs(
    limit: int = Query(default=50, ge=1, le=200),
    since_ts: Optional[datetime] = Query(default=None),
):
    db = SessionLocal()
    try:
        sql = """
            SELECT id, run_group, stage, attempt, is_ok,
                   duration_ms, output_preview, error_message, created_at
            FROM builder_runs
            {where}
            ORDER BY created_at DESC
            LIMIT :limit
        """
        where = ""
        params = {"limit": limit}
        if since_ts:
            where = "WHERE created_at >= :since"
            params["since"] = since_ts

        sql = sql.format(where=where)
        rows = db.execute(text(sql), params).mappings().all()
        results = [dict(r) for r in rows]

        total = db.execute(text("SELECT COUNT(*) FROM builder_runs")).scalar()
        return {"runs": results, "total": total}
    except Exception as e:
        return {"runs": [], "total": 0, "error": str(e)}
    finally:
        db.close()


@router.post("/runs")
async def create_builder_run(payload: dict):
    import uuid
    db = SessionLocal()
    try:
        run_id = str(uuid.uuid4())
        db.execute(text(
            "INSERT INTO builder_runs (id, run_group, stage, attempt, is_ok, created_at) "
            "VALUES (:id, :rg, :stage, :attempt, :is_ok, NOW())"
        ), {
            "id":      run_id,
            "rg":      payload.get("run_group", str(uuid.uuid4())),
            "stage":   payload.get("stage", "build"),
            "attempt": payload.get("attempt", 1),
            "is_ok":   payload.get("is_ok", True),
        })
        db.commit()
        return {"id": run_id, "status": "created"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


@router.get("/runs/{run_id}")
async def get_builder_run(run_id: str):
    db = SessionLocal()
    try:
        row = db.execute(
            text("SELECT * FROM builder_runs WHERE id = :id"),
            {"id": run_id}
        ).mappings().first()
        if not row:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
        return dict(row)
    finally:
        db.close()
