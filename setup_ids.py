import httpx
import asyncio

async def setup():
    base_url = "http://localhost:8000"
    ws_slug = "triangle-black"
    proj_slug = "triangle-black-commercial"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{base_url}/api/v1/workspaces")
            workspaces = resp.json()
            ws_id = next((w["id"] for w in workspaces if w["slug"] == ws_slug), None)
            if not ws_id:
                resp = await client.post(f"{base_url}/api/v1/workspaces", json={"name": "Triangle Black", "slug": ws_slug, "description": "Main Workspace"})
                ws_id = resp.json().get("id")
            print(f"WORKSPACE_ID={ws_id}")
            resp = await client.get(f"{base_url}/api/v1/workspaces/{ws_id}/projects")
            projects = resp.json()
            proj_id = next((p["id"] for p in projects if p["slug"] == proj_slug), None)
            if not proj_id:
                resp = await client.post(f"{base_url}/api/v1/workspaces/{ws_id}/projects", json={"name": "Triangle Black Commercial", "slug": proj_slug, "roadmap_goals": "MVR by Sprint 4"})
                proj_id = resp.json().get("id")
            print(f"PROJECT_ID={proj_id}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(setup())
