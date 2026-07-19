"""
Workflow Engine
─────────────────────────────────────────────────────
Top-level interface for running workflows.
Coordinates: Planner → Executor → Database
"""

import time
from app.workflows.planner import workflow_planner
from app.workflows.executor import workflow_executor
from app.workflows.models import WorkflowResult
from app.db.database import SessionLocal
from app.models.db.workflow import WorkflowRun


class WorkflowEngine:

    def run_template(
        self,
        template_name: str,
        goal: str,
        context: dict | None = None,
    ) -> WorkflowResult:
        """Run a predefined workflow template."""
        db = SessionLocal()
        try:
            # Plan
            workflow = workflow_planner.plan_from_template(
                template_name=template_name,
                goal=goal,
                context=context or {},
            )

            # Save to DB
            run = self._create_db_run(db, workflow)

            # Execute
            result = workflow_executor.execute(
                workflow=workflow,
                db_id=run.id,
            )

            # Update DB
            self._update_db_run(db, run, result)

            return result

        finally:
            db.close()

    def run_ai_planned(self, goal: str) -> WorkflowResult:
        """Let the AI planner design and execute a workflow."""
        db = SessionLocal()
        try:
            # AI plans the workflow
            print(f"\n🧠 AI planning workflow for: {goal}")
            workflow = workflow_planner.plan_with_ai(goal)
            print(f"   Plan: {workflow.name} ({len(workflow.tasks)} tasks)")

            # Save to DB
            run = self._create_db_run(db, workflow)

            # Execute
            result = workflow_executor.execute(
                workflow=workflow,
                db_id=run.id,
            )

            # Update DB
            self._update_db_run(db, run, result)

            return result

        finally:
            db.close()

    def get_run(self, run_id: int) -> dict | None:
        db = SessionLocal()
        try:
            run = db.query(WorkflowRun).filter(
                WorkflowRun.id == run_id
            ).first()
            if not run:
                return None
            return self._run_to_dict(run)
        finally:
            db.close()

    def list_runs(self, limit: int = 20) -> list[dict]:
        db = SessionLocal()
        try:
            runs = (
                db.query(WorkflowRun)
                .order_by(WorkflowRun.created_at.desc())
                .limit(limit)
                .all()
            )
            return [self._run_to_dict(r) for r in runs]
        finally:
            db.close()

    def _create_db_run(self, db, workflow) -> WorkflowRun:
        run = WorkflowRun(
            name=workflow.name,
            goal=workflow.goal,
            status="running",
            task_count=len(workflow.tasks),
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        return run

    def _update_db_run(self, db, run: WorkflowRun, result: WorkflowResult):
        run.status = result.status.value
        run.completed_count = result.completed_count
        run.failed_count = result.failed_count
        run.duration_seconds = result.duration_seconds
        run.result_summary = result.summary[:2000] if result.summary else ""
        run.task_results = result.task_results
        db.commit()

    def _run_to_dict(self, run: WorkflowRun) -> dict:
        return {
            "id": run.id,
            "name": run.name,
            "goal": run.goal,
            "status": run.status,
            "task_count": run.task_count,
            "completed_count": run.completed_count,
            "failed_count": run.failed_count,
            "duration_seconds": run.duration_seconds,
            "result_summary": run.result_summary,
            "created_at": run.created_at.isoformat(),
        }


workflow_engine = WorkflowEngine()
