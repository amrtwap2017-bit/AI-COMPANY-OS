"""
app/tasks/handlers.py
────────────────────────────────────────────────────────────────
Task handler functions for each task type.

Each handler:
  - Receives (task_id: int, params: dict)
  - Returns a result object with a *_id attribute
  - Never raises — errors are caught by TaskQueue._drain_one()
  - Can call task_queue.update_progress() to report progress

Registered task types:
  project_run       → run a full autonomous project
  dag_run           → execute a DAG workflow
  collaboration_run → run multi-agent collaboration
  workflow_run      → run a template/AI workflow
  learning_run      → run the learning engine
  news_ingest       → ingest an RSS feed
"""

from __future__ import annotations

import logging

log = logging.getLogger(__name__)


def run_project_task(task_id: int, params: dict):
    """
    Background handler for project execution.
    params: {name, goal, owner, template, use_ai_planner}
    """
    from tasks.queue import task_queue
    from projects.engine import project_engine

    task_queue.update_progress(task_id, 0.1, "Starting project...")

    result = project_engine.create_and_run(
        name=params.get("name", "Untitled Project"),
        goal=params.get("goal", ""),
        owner=params.get("owner", "system"),
        template=params.get("template"),
        use_ai_planner=params.get("use_ai_planner", False),
    )

    task_queue.update_progress(task_id, 1.0, f"Complete: {result.status}")
    return result


def run_dag_task(task_id: int, params: dict):
    """
    Background handler for DAG execution.
    params: {goal, pattern, agents, sequential, skip_on_failure,
             timeout_s, max_retries}
    """
    from tasks.queue import task_queue
    from dag.engine import DAGEngine
    from db.database import SessionLocal

    task_queue.update_progress(task_id, 0.1, "Building execution graph...")

    db = SessionLocal()
    try:
        engine = DAGEngine(db)
        result = engine.run(
            goal=params.get("goal", ""),
            pattern=params.get("pattern"),
            agents=params.get("agents"),
            sequential=params.get("sequential", False),
            skip_on_failure=params.get("skip_on_failure", False),
            timeout_s=params.get("timeout_s", 300),
            max_retries=params.get("max_retries", 1),
        )
        task_queue.update_progress(task_id, 1.0, f"Complete: {result.status.value}")
        return result
    finally:
        db.close()


def run_collaboration_task(task_id: int, params: dict):
    """
    Background handler for multi-agent collaboration.
    params: {goal, strategy, custom_agents}
    """
    from tasks.queue import task_queue
    from collaboration.engine import CollaborationEngine
    from db.database import SessionLocal

    task_queue.update_progress(task_id, 0.1, "Dispatching agents...")

    db = SessionLocal()
    try:
        engine = CollaborationEngine(db)
        result = engine.run(
            goal=params.get("goal", ""),
            strategy=params.get("strategy"),
            custom_agents=params.get("custom_agents"),
        )
        task_queue.update_progress(
            task_id, 1.0,
            f"Complete: {result.agents_succeeded} agents succeeded",
        )
        return result
    finally:
        db.close()


def run_workflow_task(task_id: int, params: dict):
    """
    Background handler for workflow execution.
    params: {template_name, goal, use_ai_planner}
    """
    from tasks.queue import task_queue
    from workflows.engine import workflow_engine

    task_queue.update_progress(task_id, 0.1, "Planning workflow...")

    if params.get("use_ai_planner"):
        result = workflow_engine.run_ai_planned(
            goal=params.get("goal", "")
        )
    else:
        result = workflow_engine.run_template(
            template_name=params.get("template_name", "research_report"),
            goal=params.get("goal", ""),
        )

    task_queue.update_progress(task_id, 1.0, f"Complete: {result.status}")
    return result


def run_learning_task(task_id: int, params: dict):
    """
    Background handler for learning engine run.
    params: {} (no params needed)
    """
    from tasks.queue import task_queue
    from learning.engine import LearningEngine
    from db.database import SessionLocal

    task_queue.update_progress(task_id, 0.1, "Analyzing reflections...")

    db = SessionLocal()
    try:

        class FakeResult:
            dag_id = None
            project_id = None
            collab_id = None

        engine = LearningEngine(db)
        report = engine.run()

        task_queue.update_progress(
            task_id, 1.0,
            f"Generated {len(report.insights)} insights",
        )
        return FakeResult()
    finally:
        db.close()


def run_news_ingest_task(task_id: int, params: dict):
    """
    Background handler for news RSS ingestion.
    params: {url, category, max_articles}
        or: {category_name, max_per_feed}
        or: {ingest_all: true}
    """
    from tasks.queue import task_queue
    from services.news_service import news_service

    task_queue.update_progress(task_id, 0.1, "Fetching RSS feed...")

    class FakeResult:
        dag_id = None
        project_id = None
        collab_id = None

    if params.get("ingest_all"):
        news_service.ingest_all(max_per_feed=params.get("max_per_feed", 10))
    elif params.get("category_name"):
        news_service.ingest_category(
            category=params["category_name"],
            max_per_feed=params.get("max_per_feed", 10),
        )
    else:
        news_service.ingest_feed(
            url=params.get("url", ""),
            category=params.get("category", "general"),
            max_articles=params.get("max_articles", 15),
        )

    task_queue.update_progress(task_id, 1.0, "Ingestion complete")
    return FakeResult()
