from hub.tasks.service import create_task, update_task, get_task
from hub.planning.engine import decompose_task
from hub.model_router.router import route as model_route
from hub.memory.service import remember

AGENT_CAPABILITIES = {
    "architect":  ["architecture", "review"],
    "developer":  ["code", "architecture"],
    "tester":     ["test"],
    "reviewer":   ["review"],
    "devops":     ["deploy"],
    "researcher": ["research"],
    "planner":    ["planning"],
}

def orchestrate_task(
    task_id: str,
    workspace_id: str,
    project_id: str = "",
    ollama_base: str = "http://localhost:11434",
) -> dict:
    task = get_task(task_id)
    if not task:
        return {"ok": False, "error": "task_not_found"}

    if task["type"] not in ("epic", "feature", "story"):
        return {"ok": False, "error": f"task type '{task['type']}' does not need decomposition"}

    update_task(task_id, status="planning")

    plan = decompose_task(
        title=task["title"],
        description=task["description"],
        task_type=task["type"],
        acceptance_criteria=task["acceptance_criteria"],
        workspace_id=workspace_id,
        ollama_base=ollama_base,
    )

    update_task(task_id, plan=plan)

    created = []
    for sub in plan.get("subtasks", []):
        model = model_route(sub.get("model_hint", "general"), workspace_id=workspace_id, local_only=True)
        subtask = create_task(
            workspace_id=workspace_id,
            title=sub["title"],
            description=sub.get("description", ""),
            task_type=sub.get("type", "task"),
            project_id=project_id or None,
            parent_id=task_id,
            acceptance_criteria=sub.get("acceptance_criteria", []),
            model_hint=model["model_id"],
            priority=sub.get("priority", "medium"),
        )
        update_task(subtask["id"], status="pending")
        created.append({
            "id": subtask["id"],
            "title": sub["title"],
            "type": sub.get("type"),
            "assigned_agent": sub.get("assigned_agent"),
            "model": model["model_id"],
        })

    update_task(task_id, status="planned")

    remember(
        workspace_id=workspace_id,
        memory_type="execution",
        subject=f"plan:{task_id}",
        content=f"Task '{task['title']}' decomposed into {len(created)} subtasks. Model: {plan.get('model_used')}. Complexity: {plan.get('estimated_complexity')}.",
        project_id=project_id or "",
        run_group=task_id,
    )

    return {
        "ok": True,
        "task_id": task_id,
        "plan": plan,
        "subtasks_created": created,
        "count": len(created),
    }
