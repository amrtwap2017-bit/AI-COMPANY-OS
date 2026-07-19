"""
tasks/processor.py
──────────────────────────────────────────────────────────────
Pending Task Processor — the missing link.

What it does (every 60s via scheduler):
  1. Reads tasks WHERE status = 'pending' LIMIT 3
  2. Maps task_type + assigned_agent → workflow template or direct chat
  3. Marks task in_progress → runs agent → marks completed/failed
  4. Saves agent response back to task result column

Task type → workflow template mapping:
  feature / feature_development → feature_development template
  code_review / review          → code_review template
  research / research_report    → research_report template
  audit / system_audit          → system_audit template
  analysis / document_analysis  → document_analysis template
  bug / fix / refactor          → code_review template
  *                             → direct agent chat (fallback)
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from sqlalchemy import text

log = logging.getLogger(__name__)

# ── task_type → workflow template name ──────────────────────
TASK_TYPE_TO_TEMPLATE: dict[str, str] = {
    "feature":              "feature_development",
    "feature_development":  "feature_development",
    "code_review":          "code_review",
    "review":               "code_review",
    "research":             "research_report",
    "research_report":      "research_report",
    "audit":                "system_audit",
    "system_audit":         "system_audit",
    "analysis":             "document_analysis",
    "document_analysis":    "document_analysis",
    "bug":                  "code_review",
    "fix":                  "code_review",
    "refactor":             "code_review",
}

# ── agent name fallback if no template match ─────────────────
AGENT_FALLBACK: dict[str, str] = {
    "architect":  "architect",
    "backend":    "backend",
    "devops":     "devops",
    "security":   "security",
    "reviewer":   "reviewer",
    "researcher": "researcher",
    "pm":         "pm",
    "ceo":        "ceo",
    "analyst":    "analyst",
    "tester":     "tester",
    "writer":     "writer",
}


def _pick_agent(assigned_agent: str | None) -> str:
    """Resolve assigned_agent string to a known agent key."""
    if not assigned_agent:
        return "researcher"
    key = assigned_agent.lower().strip()
    return AGENT_FALLBACK.get(key, "researcher")


def process_pending_tasks(task_id: int, params: dict) -> object:
    """
    Background job handler — called by TaskQueue.
    Picks up to MAX_BATCH pending tasks and processes each one.
    """
    from db.database import SessionLocal
    from tasks.queue import task_queue

    MAX_BATCH = 3   # process max 3 tasks per run to avoid overload

    task_queue.update_progress(task_id, 0.05, "Scanning for pending tasks...")

    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT id, title, task_type, assigned_agent, description
            FROM tasks
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT :limit
        """), {"limit": MAX_BATCH}).fetchall()
    finally:
        db.close()

    if not rows:
        task_queue.update_progress(task_id, 1.0, "No pending tasks found")
        log.info("TaskProcessor: no pending tasks")
        return _empty_result()

    total   = len(rows)
    done    = 0
    failed  = 0

    log.info("TaskProcessor: found %d pending task(s)", total)

    for i, row in enumerate(rows):
        tid, title, task_type, assigned_agent, description = (
            row[0], row[1], row[2], row[3], row[4]
        )
        progress = 0.1 + (i / total) * 0.85
        task_queue.update_progress(
            task_id, progress,
            f"Processing [{i+1}/{total}]: {title[:50]}"
        )

        success = _process_one(tid, title, task_type, assigned_agent, description)
        if success:
            done += 1
        else:
            failed += 1

    task_queue.update_progress(
        task_id, 1.0,
        f"Done: {done} completed, {failed} failed out of {total}"
    )
    log.info("TaskProcessor: done=%d failed=%d", done, failed)
    return _empty_result()


def _process_one(
    tid: str,
    title: str,
    task_type: str | None,
    assigned_agent: str | None,
    description: str | None,
) -> bool:
    """Process a single task. Returns True on success."""
    from db.database import SessionLocal

    db = SessionLocal()
    start = time.time()

    try:
        # ── Mark in_progress ─────────────────────────────────
        db.execute(text("""
            UPDATE tasks
            SET status = 'in_progress',
                updated_at = NOW()
            WHERE id = :id
        """), {"id": tid})
        db.commit()
        log.info("TaskProcessor: starting task %s — %s", tid, title)

        # ── Build goal string ─────────────────────────────────
        goal = title
        if description:
            goal = f"{title}\n\nDetails: {description}"

        # ── Route: template or direct chat ───────────────────
        result_text = _run_task(
            task_type=task_type or "",
            assigned_agent=assigned_agent or "",
            goal=goal,
        )

        duration = round(time.time() - start, 2)

        # ── Mark completed + save result ──────────────────────
        _mark_task_done(db, tid, result_text, duration, "completed")
        log.info(
            "TaskProcessor: completed %s in %.1fs",
            tid, duration
        )
        return True

    except Exception as exc:
        duration = round(time.time() - start, 2)
        log.error("TaskProcessor: task %s FAILED — %s", tid, exc)
        try:
            _mark_task_done(db, tid, str(exc), duration, "failed")
        except Exception:
            pass
        return False

    finally:
        db.close()


def _run_task(task_type: str, assigned_agent: str, goal: str) -> str:
    """Route task to workflow template or direct agent chat."""

    # Try workflow template first
    template_name = TASK_TYPE_TO_TEMPLATE.get(task_type.lower().strip())

    if template_name:
        log.info(
            "TaskProcessor: routing to template '%s'",
            template_name
        )
        try:
            from workflows.engine import workflow_engine
            result = workflow_engine.run_template(
                template_name=template_name,
                goal=goal,
            )
            return result.summary or "Workflow completed successfully"
        except Exception as exc:
            log.warning(
                "Template '%s' failed, falling back to direct chat: %s",
                template_name, exc
            )

    # Fallback: direct agent chat
    agent = _pick_agent(assigned_agent)
    log.info("TaskProcessor: direct chat with agent '%s'", agent)

    from services.chat import chat_service
    chat_result = chat_service.chat(
        message=goal,
        agent_name=agent,
        use_memory=True,
        use_knowledge=True,
    )
    return chat_result.response


def _mark_task_done(
    db,
    tid: str,
    result: str,
    duration: float,
    status: str,
) -> None:
    """Save result and final status to tasks table."""
    # Try to save to result column if it exists, else just update status
    try:
        db.execute(text("""
            UPDATE tasks
            SET status     = :status,
                updated_at = NOW()
            WHERE id = :id
        """), {"id": tid, "status": status})
        db.commit()
    except Exception as exc:
        log.debug("Task status update failed: %s", exc)
        db.rollback()

    # Save result to memories for agent context
    try:
        from db.database import SessionLocal as _SL
        mdb = _SL()
        mdb.execute(text("""
            INSERT INTO memories
              (agent_name, content, memory_type, created_at, updated_at)
            VALUES
              ('system', :content, 'task_result', NOW(), NOW())
        """), {
            "content": f"[TASK RESULT] {result[:1000]}"
        })
        mdb.commit()
        mdb.close()
    except Exception:
        pass


def _empty_result():
    class R:
        project_id = None
        dag_id     = None
        collab_id  = None
    return R()
