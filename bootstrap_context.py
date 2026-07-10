import os
import httpx
import asyncio
from pathlib import Path

async def ingest_files():
    base_path = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
    api_url = "http://localhost:8000/api/v1/knowledge/ingest"
    # Use a dummy workspace ID or your actual Triangle Black UUID if you have it
    # For now, I'll use a placeholder; the OS usually handles workspace routing
    workspace_id = "0d22ba37-30b0-46d9-844f-312ec5f9abc8" 

    print(f"🚀 Starting context ingestion from {base_path}...")
    
    count = 0
    async with httpx.AsyncClient(timeout=30.0) as client:
        for file_path in base_path.rglob("*"):
            if file_path.is_file() and file_path.suffix in [".md", ".py", ".txt", ".json"]:
                try:
                    content = file_path.read_text(errors="ignore")
                    relative_path = file_path.relative_to(base_path)
                    
                    await client.get(
                        api_url, 
                        params={
                            "workspace_id": workspace_id,
                            "content": content,
                            "title": str(relative_path),
                            "doc_type": "project_context"
                        }
                    )
                    count += 1
                    print(f"✓ Ingested: {relative_path}")
                except Exception as e:
                    print(f"✗ Failed {file_path}: {e}")

    print(f"\n✅ Finished! Ingested {count} files into AI Company OS context.")

if __name__ == "__main__":
    asyncio.run(ingest_files())
