"""
Triangle Black — Hub OS Upgrade Mission
========================================
Uses the Hub Planning Engine to decompose the full platform
upgrade into an executable task graph.

Issues found by audit:
- 127 total issues
- 3 table conflicts (invoices, purchase_orders, rfqs)
- 1 missing config module
- 21 routers missing hotel_id isolation
- 102 duplicate imports across 60+ modules
- Multi-tenancy using DEFAULT_HOTEL hardcode (CRITICAL business risk)
"""
from __future__ import annotations
import asyncio
import sys
sys.path.insert(0, "/home/amr/AI-COMPANY-OS")

from uuid import UUID
from hub.intelligence import get_orchestrator


TB_WORKSPACE_ID = UUID("2c8e07d2-b1f9-441d-a4bb-a13a2fba991a")
TB_PROJECT_ID   = UUID("45b210c8-8c4f-4c1c-92ab-93b49eb040ca")
import uuid as _uuid; TB_TASK_ID = _uuid.uuid4()


UPGRADE_EPIC = {
    "title": "Triangle Black Platform Upgrade — Fix All 127 Audit Issues",
    "description": """
    The Hub OS audit identified 127 issues across the Triangle Black platform.
    
    CRITICAL BUSINESS RISK:
    Multi-tenancy is broken. All hotel data uses DEFAULT_HOTEL hardcode.
    This means all hotels share the same data. This is a production blocker.
    
    HIGH PRIORITY:
    1. Table conflicts: invoices, purchase_orders, rfqs defined in multiple files
    2. Missing src.core.config module (email_service broken)
    3. vendor_portal uses models already defined in rfqs/purchase_orders
    
    MEDIUM PRIORITY:
    4. 21 routers missing hotel_id isolation checks
    5. vendor_portal missing require_vendor auth
    
    LOW PRIORITY:
    6. 102 duplicate import statements across 60+ files
    7. system_notifications table name conflict with notifications
    
    SUCCESS CRITERIA:
    - Platform starts with zero WARN messages
    - All hotel queries filtered by real hotel_id
    - No duplicate table definitions
    - All routers have tenant isolation
    - Test suite passes
    """,
    "acceptance_criteria": {
        "must_have_endpoints": [
            "GET /api/v1/leads",
            "GET /api/v1/hotels",
            "GET /api/v1/assets",
            "GET /health",
        ],
        "must_have_coverage": 70.0,
        "architecture_score_minimum": 75.0,
        "must_not_have_security_issues": True,
    }
}


async def create_upgrade_plan():
    print("=" * 70)
    print(" HUB OS — TRIANGLE BLACK UPGRADE MISSION")
    print("=" * 70)

    orchestrator = get_orchestrator(TB_WORKSPACE_ID, "triangle-black")

    print("\n[1] Dispatching to Planner Agent...")
    print("    Task: Decompose 127 issues into executable upgrade plan")
    print("    Agent: PlannerAgent (qwen2.5-coder:7b)")
    print()

    result = await orchestrator.dispatch_task(
        task_id          = TB_TASK_ID,
        project_id       = TB_PROJECT_ID,
        task_title       = UPGRADE_EPIC["title"],
        task_description = UPGRADE_EPIC["description"],
        task_type        = "epic",
        assigned_agent   = "planner",
        acceptance_criteria = UPGRADE_EPIC["acceptance_criteria"],
    )

    print(f"[2] Planner Result:")
    print(f"    Status:           {result.get('status')}")
    print(f"    Subtasks created: {result.get('subtasks_created', 0)}")
    print(f"    Run group:        {result.get('run_group', 'N/A')}")

    plan = result.get("plan", {})
    nodes = plan.get("nodes", [])

    if nodes:
        print(f"\n[3] Execution Plan — {len(nodes)} tasks:")
        print(f"    {'─' * 60}")
        for i, node in enumerate(nodes):
            agent     = node.get("agent_role", "developer")
            title     = node.get("title", "Unknown")
            complexity = node.get("estimated_complexity", "medium")
            deps      = node.get("depends_on", [])
            dep_str   = f" (needs: {deps})" if deps else ""
            print(f"    [{i}] [{agent:12}] [{complexity:6}] {title}{dep_str}")

        critical_path = plan.get("critical_path", [])
        print(f"\n    Critical Path: {critical_path}")
        print(f"    Total Complexity: {plan.get('estimated_total_complexity', 'high')}")
    else:
        print("\n[3] No plan nodes generated — Ollama may not be responding")
        print("    Falling back to manual plan...")
        _print_manual_plan()

    print(f"\n{'─' * 70}")
    print(" RECOMMENDED EXECUTION ORDER")
    print(f"{'─' * 70}")
    _print_execution_roadmap()

    return result


def _print_manual_plan():
    """Fallback plan based on audit results."""
    tasks = [
        ("architect",  "low",    "Create src/core/config.py with email/app settings"),
        ("developer",  "medium", "Fix table conflict: merge vendor_portal models into rfqs/purchase_orders"),
        ("developer",  "low",    "Fix table conflict: rename domain/models/invoice.py table"),
        ("developer",  "medium", "Implement real hotel_id isolation in get_hotel_id()"),
        ("developer",  "high",   "Add hotel_id filter to all 21 routers missing tenant isolation"),
        ("developer",  "low",    "Add require_vendor to src/core/auth.py"),
        ("developer",  "low",    "Fix inventory_alerts Boolean import"),
        ("developer",  "low",    "Fix pdf_service empty router"),
        ("developer",  "medium", "Deduplicate 102 duplicate imports across all modules"),
        ("tester",     "medium", "Write integration tests for hotel_id isolation"),
        ("reviewer",   "low",    "Architecture review of vendor_portal module"),
    ]
    for i, (agent, complexity, title) in enumerate(tasks):
        print(f"    [{i}] [{agent:12}] [{complexity:6}] {title}")


def _print_execution_roadmap():
    roadmap = [
        ("PROGRAM 1", "FOUNDATION FIXES",      "1-2 hours",  [
            "Create src/core/config.py",
            "Add require_vendor to auth.py",
            "Fix Boolean import in inventory_alerts",
            "Fix empty pdf_service router",
        ]),
        ("PROGRAM 2", "TABLE CONFLICT FIXES",  "2-3 hours",  [
            "Merge vendor_portal RFQ model into src/commercial/rfqs/",
            "Merge vendor_portal PO model into src/commercial/purchase_orders/",
            "Rename domain/models/invoice.py table to domain_invoices",
            "Update all cross-references",
        ]),
        ("PROGRAM 3", "MULTI-TENANCY FIX",     "4-6 hours",  [
            "Replace DEFAULT_HOTEL hardcode with real hotel_id",
            "Add hotel_id extraction from JWT token",
            "Add hotel_id filter to all 21 routers",
            "Add hotel_id to all DB queries",
        ]),
        ("PROGRAM 4", "CODE QUALITY",          "1-2 hours",  [
            "Remove 102 duplicate import statements",
            "Standardize datetime imports across all modules",
        ]),
        ("PROGRAM 5", "VALIDATION",            "2-3 hours",  [
            "Start platform with zero WARN messages",
            "Verify all endpoints respond",
            "Run full integration test",
        ]),
    ]

    for prog, name, effort, tasks in roadmap:
        print(f"\n  {prog}: {name} [{effort}]")
        for t in tasks:
            print(f"    → {t}")

    print(f"\n{'─' * 70}")
    print(f"  TOTAL ESTIMATED EFFORT: 10-16 hours")
    print(f"  BUSINESS IMPACT: HIGH")
    print(f"  RISK IF NOT FIXED: Multi-tenancy broken = data leak between hotels")
    print(f"{'─' * 70}")


if __name__ == "__main__":
    asyncio.run(create_upgrade_plan())
