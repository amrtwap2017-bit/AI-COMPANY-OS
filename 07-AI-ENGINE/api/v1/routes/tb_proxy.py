from fastapi import APIRouter, HTTPException
from datetime import datetime
import httpx

router = APIRouter(prefix="/tb", tags=["Triangle Black"])

TB_BASE = "http://localhost:8030"

async def _tb_get(path: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{TB_BASE}{path}")
            if r.status_code == 200:
                return r.json()
            return {"error": f"TB returned {r.status_code}", "data": []}
    except Exception as e:
        return {"error": str(e), "data": []}

@router.get("/status")
async def tb_status():
    health = await _tb_get("/health")
    return {
        "name": "Triangle Black",
        "version": "v1.9.0",
        "description": "Hotel Engineering Platform",
        "api_status": "online" if "error" not in health else "offline",
        "port": 8030,
        "portal_url": "http://localhost:3001",
        "memory_enabled": False,
        "data_enabled": False,
        "ts": datetime.utcnow().isoformat(),
        "health": health,
    }

@router.get("/leads")
async def tb_leads():
    return await _tb_get("/api/leads")

@router.get("/agents")
async def tb_agents():
    return await _tb_get("/api/agents")

@router.get("/quotes")
async def tb_quotes():
    return await _tb_get("/api/quotes")

@router.get("/tests")
async def tb_tests():
    return {
        "status": "pending",
        "passed": 0,
        "failed": 0,
        "total": 0,
        "last_run": None,
        "message": "Test runner not yet configured",
    }

@router.get("/pipeline")
async def tb_pipeline():
    return {
        "status": "idle",
        "stages": ["leads","qualify","quote","close"],
        "active_stage": None,
        "last_run": None,
    }
