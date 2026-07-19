from fastapi import APIRouter

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

WORKSPACES = [
    {
        "id": "triangle-black",
        "name": "Triangle Black",
        "slug": "triangle-black",
        "description": "Triangle Black client workspace",
        "status": "active",
        "portal_url": "http://localhost:3001",
        "agents": ["ceo","cto","architect","backend","frontend","devops"],
        "memory_enabled": False,
        "data_enabled": False,
    }
]

@router.get("")
async def list_workspaces():
    return {"workspaces": WORKSPACES}

@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str):
    for w in WORKSPACES:
        if w["id"] == workspace_id:
            return w
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Workspace {workspace_id} not found")
