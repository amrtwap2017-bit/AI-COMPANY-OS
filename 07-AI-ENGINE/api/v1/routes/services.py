from fastapi import APIRouter
import httpx
from datetime import datetime

router = APIRouter(prefix="/services", tags=["Services"])

SERVICES = {
    "n8n":        {"url": "http://localhost:5678", "name": "n8n Automation", "port": 5678},
    "openwebui":  {"url": "http://localhost:3400", "name": "Open WebUI",     "port": 3400},
    "qdrant":     {"url": "http://localhost:6333", "name": "Qdrant Vector",  "port": 6333},
    "postgres":   {"url": None,                    "name": "PostgreSQL",     "port": 5432},
    "redis":      {"url": None,                    "name": "Redis",          "port": 6379},
}

async def ping(url: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as c:
            r = await c.get(url)
            return r.status_code < 500
    except Exception:
        return False

@router.get("")
async def list_services():
    results = []
    for key, svc in SERVICES.items():
        online = False
        if svc["url"]:
            online = await ping(svc["url"])
        else:
            import socket
            try:
                s = socket.create_connection(("localhost", svc["port"]), timeout=2)
                s.close(); online = True
            except Exception:
                pass
        results.append({
            "id": key,
            "name": svc["name"],
            "port": svc["port"],
            "url": svc["url"],
            "status": "online" if online else "offline",
            "ts": datetime.utcnow().isoformat(),
        })
    return {"services": results, "total": len(results)}

@router.get("/{service_id}")
async def get_service(service_id: str):
    svc = SERVICES.get(service_id)
    if not svc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Service {service_id} not found")
    online = await ping(svc["url"]) if svc["url"] else False
    return {
        "id": service_id,
        "name": svc["name"],
        "port": svc["port"],
        "url": svc["url"],
        "status": "online" if online else "offline",
        "ts": datetime.utcnow().isoformat(),
    }
