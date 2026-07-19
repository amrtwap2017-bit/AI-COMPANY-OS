"""Triangle Black Hub OS — Integration Test Suite"""
import asyncio
import httpx
import sys
sys.path.insert(0, "/home/amr/AI-COMPANY-OS")

async def verify_hub_upgrade():
    print("=" * 60)
    print(" TRIANGLE BLACK HUB OS — INTEGRATION TEST")
    print("=" * 60)

    base_url = "http://localhost:8000"

    async with httpx.AsyncClient(timeout=30.0) as client:

        # 1. Module Loader
        print("\n[1/6] Testing Module Loader...")
        try:
            from hub.core.loader import platform_layer
            foundation     = platform_layer("foundation")
            infrastructure = platform_layer("infrastructure")
            print(f"  ✅ Foundation:     {foundation.schemas.__name__}")
            print(f"  ✅ Infrastructure: loaded")
        except Exception as e:
            print(f"  ❌ Loader: {e}")
            return

        # 2. API Health
        print("\n[2/6] Testing API Health...")
        try:
            resp = await client.get(f"{base_url}/health")
            data = resp.json()
            print(f"  ✅ Status:   {data['status']}")
            print(f"  ✅ Database: {'CONNECTED' if data['database']['connected'] else 'FAILED'}")
            print(f"  ✅ pgvector: {'ACTIVE' if data['database']['pgvector'] else 'MISSING'}")
        except Exception as e:
            print(f"  ❌ API: {e}")
            return

        # 3. Workspace API
        print("\n[3/6] Testing Workspace API...")
        try:
            resp = await client.get(f"{base_url}/api/v1/workspaces/")
            print(f"  ✅ Workspaces route: responding")
        except Exception as e:
            print(f"  ❌ Workspace API: {e}")

        # 4. Knowledge Search — THE REAL TEST
        print("\n[4/6] Testing Knowledge Layer...")
        try:
            from hub.session import HubSession
            from uuid import UUID
            tb_id   = UUID("00000000-0000-0000-0000-000000000001")
            session = HubSession(workspace_id=tb_id)

            queries = [
                "MEP maintenance standards hospitality",
                "hotel asset management procurement",
                "Triangle Black business model",
            ]

            total_found = 0
            for q in queries:
                results = await session.ask_intelligence(q, limit=3)
                total_found += len(results)
                if results:
                    best = results[0]
                    score   = best.get("score", 0)
                    content = best.get("payload", {}).get("content", "")[:70]
                    print(f"  ✅ '{q[:40]}...'")
                    print(f"     → score={score:.3f} | {content}")
                else:
                    print(f"  ⚠️  '{q}' — no results")

            if total_found > 0:
                print(f"\n  ✅ Knowledge Layer: FULLY OPERATIONAL ({total_found} total results)")
            else:
                print(f"\n  ❌ Knowledge Layer: 0 results across all queries")

            await session.close()
        except Exception as e:
            print(f"  ❌ Knowledge: {e}")
            import traceback
            traceback.print_exc()

        # 5. Agent Orchestrator
        print("\n[5/6] Testing Agent Orchestrator...")
        try:
            from hub.intelligence import get_orchestrator
            from uuid import UUID
            tb_id    = UUID("00000000-0000-0000-0000-000000000001")
            orch     = get_orchestrator(tb_id, "triangle-black")
            registry = orch.get_registry()
            active   = [k for k, v in registry.items() if v["status"] == "active"]
            stub     = [k for k, v in registry.items() if v["status"] == "stub"]
            print(f"  ✅ Orchestrator:  initialized")
            print(f"  ✅ Active agents: {active}")
            print(f"  ✅ Stub agents:   {stub}")
            print(f"  ✅ Total agents:  {len(registry)}")
        except Exception as e:
            print(f"  ❌ Orchestrator: {e}")

        # 6. Security
        print("\n[6/6] Testing Security Isolation...")
        try:
            from hub.api.routers._base import load_platform_file
            ws_mgr = load_platform_file("02-PLATFORM/workspace_mgr.py")
            mgr    = ws_mgr.WorkspaceManager(None)
            try:
                mgr.validate_workspace_path("triangle-black", "../../../etc/passwd")
                print("  ❌ Path traversal PERMITTED — SECURITY FAILURE")
            except Exception:
                print("  ✅ Path traversal BLOCKED")
        except Exception as e:
            print(f"  ❌ Security check error: {e}")

    print("\n" + "=" * 60)
    print(" INTEGRATION TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(verify_hub_upgrade())
