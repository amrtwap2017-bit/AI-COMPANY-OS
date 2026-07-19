"""
app/collaboration/engine.py
────────────────────────────────────────────────────────────────
Top-level entry point for multi-agent collaboration.

Pipeline:
  1. Dispatch: analyze goal, build execution plan
  2. Execute: run agents in parallel groups
  3. Assemble: combine outputs into final response
  4. Persist: save to DB
  5. Track: analytics + reflections per agent
"""

from __future__ import annotations

import logging
import time

from sqlalchemy.orm import Session

from app.collaboration.models import (
    CollaborationPlan,
    CollaborationResult,
    CollabStatus,
)
from app.collaboration.dispatcher import CollaborationDispatcher
from app.collaboration.executor import CollaborationExecutor
from app.collaboration.assembler import CollaborationAssembler
from app.models.db.collaboration import CollaborationRun

log = logging.getLogger(__name__)


class CollaborationEngine:

    def __init__(
        self,
        db: Session,
        dispatcher: CollaborationDispatcher | None = None,
        executor: CollaborationExecutor | None = None,
        assembler: CollaborationAssembler | None = None,
    ) -> None:
        self._db         = db
        self._dispatcher = dispatcher or CollaborationDispatcher()
        self._executor   = executor   or CollaborationExecutor()
        self._assembler  = assembler  or CollaborationAssembler()

    def run(
        self,
        goal: str,
        strategy: str | None = None,
        custom_agents: list[str] | None = None,
    ) -> CollaborationResult:
        """
        Run a full multi-agent collaboration.
        Returns CollaborationResult when all agents complete.
        """
        start = time.time()

        # 1. Create DB record
        run = self._create_run(goal)

        try:
            # 2. Dispatch — build execution plan
            plan = self._dispatcher.dispatch(
                goal=goal,
                strategy=strategy,
                custom_agents=custom_agents,
            )
            log.info(
                "Collaboration %d: %d agents in %d groups",
                run.id,
                len(plan.agents),
                len(plan.groups),
            )

            # 3. Execute — run all agent groups
            outputs = self._executor.execute(plan)

            # 4. Assemble — build final response
            final_response = self._assembler.assemble(goal, outputs)

            # 5. Compute stats
            succeeded = sum(1 for o in outputs if o.success)
            failed    = sum(1 for o in outputs if not o.success)
            total_dur = round(time.time() - start, 2)

            status = (
                CollabStatus.COMPLETE if failed == 0
                else CollabStatus.PARTIAL if succeeded > 0
                else CollabStatus.FAILED
            )

            # 6. Update DB record
            self._complete_run(
                run=run,
                plan=plan,
                outputs=outputs,
                final_response=final_response,
                status=status,
                succeeded=succeeded,
                failed=failed,
                duration=total_dur,
            )

            # 7. Track analytics + reflections (non-blocking)
            self._track_all(outputs, total_dur)

            result = CollaborationResult(
                collab_id=run.id,
                goal=goal,
                status=status,
                outputs=outputs,
                final_response=final_response,
                total_duration=total_dur,
                agents_succeeded=succeeded,
                agents_failed=failed,
            )

            log.info(
                "Collaboration %d complete: %s in %.1fs",
                run.id, status.value, total_dur,
            )
            return result

        except Exception as exc:
            total_dur = round(time.time() - start, 2)
            log.error("Collaboration %d failed: %s", run.id, exc)
            self._fail_run(run, str(exc), total_dur)

            return CollaborationResult(
                collab_id=run.id,
                goal=goal,
                status=CollabStatus.FAILED,
                outputs=[],
                final_response=f"Collaboration failed: {exc}",
                total_duration=total_dur,
                agents_succeeded=0,
                agents_failed=1,
            )

    def get_run(self, collab_id: int) -> CollaborationRun | None:
        return self._db.query(CollaborationRun).filter(
            CollaborationRun.id == collab_id
        ).first()

    def list_runs(self, limit: int = 20) -> list[CollaborationRun]:
        return (
            self._db.query(CollaborationRun)
            .order_by(CollaborationRun.created_at.desc())
            .limit(limit)
            .all()
        )

    # ── Private helpers ───────────────────────────────────────

    def _create_run(self, goal: str) -> CollaborationRun:
        run = CollaborationRun(
            goal=goal,
            status=CollabStatus.RUNNING.value,
        )
        self._db.add(run)
        self._db.commit()
        self._db.refresh(run)
        return run

    def _complete_run(
        self,
        run: CollaborationRun,
        plan: CollaborationPlan,
        outputs,
        final_response: str,
        status: CollabStatus,
        succeeded: int,
        failed: int,
        duration: float,
    ) -> None:
        run.status               = status.value
        run.agents_used          = [t.agent_name for t in plan.agents]
        run.agent_outputs        = {
            o.agent_name: {
                "output":           o.output[:500],
                "success":          o.success,
                "duration_seconds": o.duration_seconds,
                "error":            o.error,
            }
            for o in outputs
        }
        run.final_response            = final_response
        run.total_duration_seconds    = duration
        run.agents_succeeded          = succeeded
        run.agents_failed             = failed
        self._db.commit()

    def _fail_run(
        self,
        run: CollaborationRun,
        error: str,
        duration: float,
    ) -> None:
        run.status                    = CollabStatus.FAILED.value
        run.final_response            = f"Error: {error}"
        run.total_duration_seconds    = duration
        self._db.commit()

    def _track_all(self, outputs, total_duration: float) -> None:
        """Track analytics and reflections for all agent outputs."""
        for output in outputs:
            # Analytics
            try:
                from app.analytics.tracker import track_agent_call
                track_agent_call(
                    agent_name=output.agent_name,
                    model_used=output.model_used,
                    user_input=output.task,
                    output=output.output,
                    duration=output.duration_seconds,
                    success=output.success,
                )
            except Exception as exc:
                log.debug("Analytics track failed: %s", exc)

            # Reflection
            try:
                from app.reflection.engine import ReflectionEngine
                from app.reflection.models import ExecutionRecord
                ReflectionEngine(self._db).reflect(ExecutionRecord(
                    agent_name=output.agent_name,
                    model_used=output.model_used,
                    task=output.task,
                    output=output.output,
                    status="success" if output.success else "failed",
                    duration_seconds=output.duration_seconds,
                    error=output.error,
                ))
            except Exception as exc:
                log.debug("Reflection failed: %s", exc)
