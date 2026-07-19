"""
Analytics Tracker
────────────────────────────────────────────────────────────────
Public API for recording platform events.

Rules:
  1. Never raises. Failures are silently swallowed.
  2. Never blocks. Events go to the background queue.
  3. extra_data used throughout — 'metadata' is reserved by SQLAlchemy.
"""

from __future__ import annotations

import logging
from typing import Any

log = logging.getLogger(__name__)


def track(
    event_type: str,
    *,
    agent_name: str | None = None,
    model_used: str | None = None,
    status: str = "success",
    duration_seconds: float | None = None,
    input_text: str | None = None,
    output_text: str | None = None,
    extra_data: dict[str, Any] | None = None,
) -> None:
    """
    Core tracking function. All other track_* functions delegate here.
    Non-blocking. Never raises.
    """
    try:
        from analytics.background import enqueue
        enqueue({
            "event_type": event_type,
            "agent_name": agent_name,
            "model_used": model_used,
            "status": status,
            "duration_seconds": duration_seconds,
            "input_chars": len(input_text) if input_text else None,
            "output_chars": len(output_text) if output_text else None,
            "extra_data": extra_data or {},
        })
    except Exception as exc:
        log.debug("track() silently failed: %s", exc)


def track_agent_call(
    *,
    agent_name: str,
    model_used: str,
    user_input: str,
    output: str,
    duration: float,
    success: bool,
) -> None:
    track(
        "agent_call",
        agent_name=agent_name,
        model_used=model_used,
        status="success" if success else "failed",
        duration_seconds=duration,
        input_text=user_input,
        output_text=output,
    )


def track_workflow(
    *,
    workflow_name: str,
    task_count: int,
    completed: int,
    duration: float,
    success: bool,
) -> None:
    track(
        "workflow_run",
        status="success" if success else "failed",
        duration_seconds=duration,
        extra_data={
            "workflow_name": workflow_name,
            "task_count": task_count,
            "completed_count": completed,
        },
    )


def track_chat(
    *,
    agent_name: str,
    model_used: str,
    message: str,
    response: str,
    duration: float,
) -> None:
    track(
        "chat_message",
        agent_name=agent_name,
        model_used=model_used,
        status="success",
        duration_seconds=duration,
        input_text=message,
        output_text=response,
    )


def track_tool(
    *,
    tool_name: str,
    agent_name: str,
    success: bool,
    duration: float,
) -> None:
    track(
        "tool_execution",
        agent_name=agent_name,
        status="success" if success else "failed",
        duration_seconds=duration,
        extra_data={"tool_name": tool_name},
    )


def track_knowledge_search(
    *,
    query: str,
    results_count: int,
    duration: float,
) -> None:
    track(
        "knowledge_search",
        status="success",
        duration_seconds=duration,
        input_text=query,
        extra_data={"results_count": results_count},
    )


def track_project(
    *,
    project_id: str,
    project_name: str,
    agent_name: str,
    success: bool,
    duration: float,
    eval_score: float | None = None,
) -> None:
    track(
        "project_run",
        agent_name=agent_name,
        status="success" if success else "failed",
        duration_seconds=duration,
        extra_data={
            "project_id": project_id,
            "project_name": project_name,
            "eval_score": eval_score,
        },
    )
