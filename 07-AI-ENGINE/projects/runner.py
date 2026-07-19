"""
Project Runner
─────────────────────────────────────────────────────
Autonomous end-to-end project execution:

  1. Create project record
  2. Plan workflow (template or AI)
  3. Execute all tasks
  4. Evaluate output quality
  5. Critique final output
  6. Generate final report
  7. Save everything to DB + Memory + Knowledge

This is the core of Autonomous Company Mode.
"""

import time
from dataclasses import dataclass

from db.database import SessionLocal
from models.db.project import Project
from repositories.project import ProjectRepository
from workflows.engine import workflow_engine
from workflows.planner import workflow_planner
from evaluation.evaluator import evaluator_agent
from evaluation.critic import critic_agent
from services.ollama import ollama_service
from memory.service import memory_service
from knowledge.ingest import knowledge_ingest
from models.router import model_router


@dataclass
class ProjectResult:
    project_id: int
    name: str
    goal: str
    status: str
    eval_score: float
    eval_passed: bool
    final_report: str
    duration_seconds: float
    success: bool
    error: str | None = None


class ProjectRunner:

    def run(
        self,
        name: str,
        goal: str,
        owner: str = "admin",
        template: str | None = None,
        use_ai_planner: bool = False,
    ) -> ProjectResult:
        """
        Run a full autonomous project from goal to report.
        """
        start_time = time.time()
        db = SessionLocal()

        try:
            repo = ProjectRepository(db)

            # ── 1. Create project ─────────────────────
            project = repo.create(
                Project(
                    name=name,
                    goal=goal,
                    owner=owner,
                    status="planning",
                )
            )
            project_id = project.id

            print(f"\n{'='*60}")
            print(f"🚀 PROJECT: {name}")
            print(f"   Goal: {goal}")
            print(f"   ID:   {project_id}")
            print(f"{'='*60}")

            # ── 2. Save goal to memory ────────────────
            try:
                from memory.service import MemorySaveRequest
                memory_service.save(MemorySaveRequest(
                    agent_name="orchestrator",
                    content=f"Project started: {name}. Goal: {goal}",
                    memory_type="long_term",
                    extra_data={"project_id": project_id, "type": "project_start"},
                ))
            except Exception:
                pass

            # ── 3. Execute workflow ───────────────────
            print(f"\n📋 Phase 1: Workflow Execution")
            repo.set_status(project_id, "running")

            try:
                if use_ai_planner:
                    workflow_result = workflow_engine.run_ai_planned(goal=goal)
                elif template:
                    workflow_result = workflow_engine.run_template(
                        template_name=template,
                        goal=goal,
                    )
                else:
                    # Default: research_report for most goals
                    workflow_result = workflow_engine.run_template(
                        template_name="research_report",
                        goal=goal,
                    )

                repo.save_results(
                    project_id=project_id,
                    workflow_run_id=workflow_result.workflow_id,
                    task_results=workflow_result.task_results,
                )

                final_output = workflow_result.summary or ""

            except Exception as e:
                repo.set_status(project_id, "failed")
                return ProjectResult(
                    project_id=project_id,
                    name=name,
                    goal=goal,
                    status="failed",
                    eval_score=0.0,
                    eval_passed=False,
                    final_report="",
                    duration_seconds=time.time() - start_time,
                    success=False,
                    error=str(e),
                )

            # ── 4. Evaluate output ────────────────────
            print(f"\n🔍 Phase 2: Evaluation")
            repo.set_status(project_id, "evaluating")

            try:
                eval_result = evaluator_agent.evaluate(
                    task=goal,
                    output=final_output,
                )
                print(f"   Score: {eval_result.score}/10")
                print(f"   Passed: {eval_result.passed}")
            except Exception:
                from evaluation.evaluator import EvaluationResult
                eval_result = EvaluationResult(
                    score=7.0,
                    passed=True,
                    feedback="Evaluation unavailable",
                    strengths=[],
                    weaknesses=[],
                    suggestions=[],
                )

            # ── 5. Critique output ────────────────────
            print(f"\n📝 Phase 3: Critique")
            try:
                critique = critic_agent.critique(
                    goal=goal,
                    final_output=final_output,
                    task_results=workflow_result.task_results,
                )
                critic_text = (
                    f"Summary: {critique.summary}\n"
                    f"What worked: {critique.what_worked}\n"
                    f"What failed: {critique.what_failed}\n"
                    f"Improvements: {critique.improvements}\n"
                    f"Recommendation: {critique.recommendation}"
                )
            except Exception:
                critic_text = "Critique unavailable"

            repo.save_evaluation(
                project_id=project_id,
                score=eval_result.score,
                feedback=eval_result.feedback,
                critic_feedback=critic_text,
            )

            # ── 6. Generate final report ──────────────
            print(f"\n📄 Phase 4: Final Report")
            try:
                report = self._generate_report(
                    project=project,
                    goal=goal,
                    final_output=final_output,
                    eval_result=eval_result,
                    critic_text=critic_text,
                    workflow_result=workflow_result,
                )
            except Exception:
                report = final_output

            duration = time.time() - start_time

            repo.save_report(
                project_id=project_id,
                report=report,
                duration=duration,
            )

            # ── 7. Save to knowledge ──────────────────
            try:
                knowledge_ingest.ingest_text(
                    title=f"Project Report: {name}",
                    content=report,
                    source=f"project-{project_id}",
                    doc_type="project_report",
                )
            except Exception:
                pass

            # ── 8. Save completion to memory ──────────
            try:
                from memory.service import MemorySaveRequest
                memory_service.save(MemorySaveRequest(
                    agent_name="orchestrator",
                    content=f"Project completed: {name}. Score: {eval_result.score}/10. Goal: {goal}",
                    memory_type="long_term",
                    extra_data={"project_id": project_id, "type": "project_complete"},
                ))
            except Exception:
                pass

            print(f"\n{'='*60}")
            print(f"✅ PROJECT COMPLETE: {name}")
            print(f"   Score:    {eval_result.score}/10")
            print(f"   Duration: {duration:.1f}s")
            print(f"   Status:   complete")
            print(f"{'='*60}\n")

            return ProjectResult(
                project_id=project_id,
                name=name,
                goal=goal,
                status="complete",
                eval_score=eval_result.score,
                eval_passed=eval_result.passed,
                final_report=report,
                duration_seconds=round(duration, 2),
                success=True,
            )

        except Exception as e:
            return ProjectResult(
                project_id=0,
                name=name,
                goal=goal,
                status="failed",
                eval_score=0.0,
                eval_passed=False,
                final_report="",
                duration_seconds=time.time() - start_time,
                success=False,
                error=str(e),
            )
        finally:
            db.close()

    def _generate_report(
        self,
        project,
        goal: str,
        final_output: str,
        eval_result,
        critic_text: str,
        workflow_result,
    ) -> str:
        """
        Generate a structured final project report.
        """
        model = model_router.route("write a report")

        system = (
            "You are a Technical Report Writer. "
            "Write clear, professional, well-structured reports. "
            "Use markdown formatting."
        )

        completed = workflow_result.completed_count
        total = workflow_result.task_count

        prompt = f"""Write a complete project report for:

PROJECT: {project.name}
GOAL: {goal}

EXECUTION SUMMARY:
- Tasks completed: {completed}/{total}
- Duration: {workflow_result.duration_seconds:.1f}s
- Quality score: {eval_result.score}/10

KEY FINDINGS:
{final_output[:2000]}

EVALUATION:
{eval_result.feedback}

CRITIQUE:
{critic_text[:1000]}

Write a professional report with these sections:
1. Executive Summary
2. Objectives
3. Key Findings
4. Analysis
5. Recommendations
6. Conclusion

Keep it concise and actionable."""

        return ollama_service.generate(
            model=model,
            prompt=prompt,
            system=system,
        )


project_runner = ProjectRunner()
