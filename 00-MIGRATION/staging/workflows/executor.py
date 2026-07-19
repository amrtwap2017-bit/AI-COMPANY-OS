"""
Workflow Executor
─────────────────────────────────────────────────────
Executes a WorkflowDefinition by running each task
through its assigned agent in dependency order.

Execution strategy:
  1. Find all tasks with no unmet dependencies
  2. Execute them (sequentially for now)
  3. Mark as complete
  4. Find next ready tasks
  5. Repeat until all tasks are done
"""
import time
import signal
from contextlib import contextmanager
from app.workflows.models import (
    WorkflowDefinition,
    WorkflowResult,
    WorkflowStatus,
    TaskStatus,
)
from app.services.ollama import ollama_service
from app.agents.registry import get_agent
from app.models.router import model_router
from app.knowledge.search import knowledge_search

# Max seconds per task before giving up
TASK_TIMEOUT_SECONDS = 300  # 5 minutes per task


@contextmanager
def task_timeout(seconds: int):
    """Context manager that raises TimeoutError after seconds."""
    def _handler(signum, frame):
        raise TimeoutError(f"Task exceeded {seconds}s timeout")

    old = signal.signal(signal.SIGALRM, _handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old)


class WorkflowExecutor:

    def execute(
        self,
        workflow: WorkflowDefinition,
        db_id: int = 0,
        use_knowledge: bool = True,
    ) -> WorkflowResult:

        start_time = time.time()
        completed: set[str] = set()
        task_results: dict = {}
        failed_count = 0

        print(f"\n🚀 Starting workflow: {workflow.name}")
        print(f"   Goal: {workflow.goal}")
        print(f"   Tasks: {len(workflow.tasks)}")

        max_iterations = len(workflow.tasks) * 2
        iteration = 0

        while len(completed) + failed_count < len(workflow.tasks):
            iteration += 1
            if iteration > max_iterations:
                break

            ready = workflow.get_ready_tasks(completed)

            if not ready:
                for task in workflow.tasks:
                    if task.status == TaskStatus.PENDING:
                        all_deps_done = all(
                            workflow.get_task(dep).status in [
                                TaskStatus.SUCCESS, TaskStatus.FAILED
                            ]
                            for dep in task.depends_on
                        )
                        if all_deps_done:
                            task.status = TaskStatus.SKIPPED
                            completed.add(task.id)
                break

            for task in ready:
                task.status = TaskStatus.RUNNING
                task_start = time.time()

                print(f"\n   ▶ [{task.id}] {task.name} → {task.agent}")
                print(f"     Timeout: {TASK_TIMEOUT_SECONDS}s")

                try:
                    context = self._build_context(
                        task, task_results, workflow
                    )

                    try:
                        agent = get_agent(task.agent)
                    except ValueError:
                        agent = get_agent("researcher")

                    model = model_router.route_with_fallback(
                        task.instruction, agent["model"]
                    )
                    print(f"     Model: {model}")

                    knowledge_context = ""
                    if use_knowledge:
                        try:
                            results = knowledge_search.search(
                                task.instruction, top_k=3
                            )
                            if results:
                                lines = [r.text for r in results]
                                knowledge_context = (
                                    "\nRelevant knowledge:\n"
                                    + "\n".join(lines)
                                )
                        except Exception:
                            pass

                    system = (
                        f"You are {agent['role']}. {agent['description']}.\n"
                        f"Workflow goal: {workflow.goal}\n"
                    )
                    if context:
                        system += f"\nPrevious results:\n{context}"
                    if knowledge_context:
                        system += knowledge_context

                    # Execute with timeout
                    with task_timeout(TASK_TIMEOUT_SECONDS):
                        result = ollama_service.generate(
                            model=model,
                            prompt=task.instruction,
                            system=system,
                        )

                    task.status = TaskStatus.SUCCESS
                    task.result = result
                    task.duration_seconds = time.time() - task_start
                    completed.add(task.id)

                    task_results[task.id] = {
                        "task": task.name,
                        "agent": task.agent,
                        "model": model,
                        "status": "success",
                        "result": result,
                        "duration": round(task.duration_seconds, 2),
                    }

                    print(
                        f"   ✅ [{task.id}] done in "
                        f"{task.duration_seconds:.1f}s"
                    )

                except TimeoutError as e:
                    task.status = TaskStatus.FAILED
                    task.error = str(e)
                    task.duration_seconds = time.time() - task_start
                    failed_count += 1
                    completed.add(task.id)

                    task_results[task.id] = {
                        "task": task.name,
                        "agent": task.agent,
                        "status": "timeout",
                        "error": str(e),
                        "duration": round(task.duration_seconds, 2),
                    }
                    print(f"   ⏰ [{task.id}] TIMEOUT after {TASK_TIMEOUT_SECONDS}s")

                except Exception as e:
                    task.status = TaskStatus.FAILED
                    task.error = str(e)
                    task.duration_seconds = time.time() - task_start
                    failed_count += 1
                    completed.add(task.id)

                    task_results[task.id] = {
                        "task": task.name,
                        "agent": task.agent,
                        "status": "failed",
                        "error": str(e),
                        "duration": round(task.duration_seconds, 2),
                    }
                    print(f"   ❌ [{task.id}] failed: {str(e)[:100]}")

        total_duration = time.time() - start_time
        completed_count = sum(
            1 for t in workflow.tasks if t.status == TaskStatus.SUCCESS
        )
        failed_count = sum(
            1 for t in workflow.tasks if t.status == TaskStatus.FAILED
        )

        if failed_count == 0:
            status = WorkflowStatus.SUCCESS
        elif completed_count == 0:
            status = WorkflowStatus.FAILED
        else:
            status = WorkflowStatus.PARTIAL

        summary = self._generate_summary(workflow, task_results)

        print(f"\n{'='*50}")
        print(f"Workflow: {workflow.name}")
        print(f"Status:   {status}")
        print(f"Tasks:    {completed_count}/{len(workflow.tasks)} completed")
        print(f"Duration: {total_duration:.1f}s")
        print(f"{'='*50}")

        return WorkflowResult(
            workflow_id=db_id,
            name=workflow.name,
            goal=workflow.goal,
            status=status,
            task_count=len(workflow.tasks),
            completed_count=completed_count,
            failed_count=failed_count,
            duration_seconds=round(total_duration, 2),
            task_results=task_results,
            summary=summary,
            success=status != WorkflowStatus.FAILED,
        )

    def _build_context(
        self,
        task,
        task_results: dict,
        workflow: WorkflowDefinition,
    ) -> str:
        if not task.depends_on:
            return ""
        lines = []
        for dep_id in task.depends_on:
            dep_result = task_results.get(dep_id)
            if dep_result and dep_result.get("status") == "success":
                dep_task = workflow.get_task(dep_id)
                name = dep_task.name if dep_task else dep_id
                result_text = str(dep_result.get("result", ""))[:1000]
                lines.append(f"[{name}]:\n{result_text}")
        return "\n\n".join(lines)

    def _generate_summary(
        self,
        workflow: WorkflowDefinition,
        task_results: dict,
    ) -> str:
        for task in reversed(workflow.tasks):
            result = task_results.get(task.id)
            if result and result.get("status") == "success":
                return str(result.get("result", ""))[:2000]
        return "Workflow completed."


workflow_executor = WorkflowExecutor()
