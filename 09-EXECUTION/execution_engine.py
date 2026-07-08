"""
Execution Engine — Full Autonomous Pipeline v2
===============================================
The complete autonomous engineering loop.

PIPELINE:
  1. CONTEXT_PACK    — load workspace + task + Qdrant knowledge
  2. DEVELOPER       — generate code with business context
  3. WRITE           — save to workspace filesystem
  4. LINT            — ruff format and check
  5. TEST            — generate and run tests
  6. FIX_LOOP        — retry up to 5x if tests fail
  7. REVIEW          — score code quality
  8. SECURITY        — scan for vulnerabilities
  9. QUALITY_GATE    — block if score < threshold
  10. COMMIT         — git commit with release notes
  11. MEMORY         — distill to permanent learning

Every stage: writes builder_run record, emits to observability.
"""

from __future__ import annotations

import importlib.util
import os
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)


def _load_module(name: str, path: str):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BASE = "/home/amr/AI-COMPANY-OS"


def _get_factory():
    url = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os",
    )
    engine = create_async_engine(url, echo=False)
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )


class ExecutionEngine:
    """
    Full autonomous engineering pipeline.
    Connects: Context → Developer → Tester → FixLoop → Reviewer → Security → Git → Memory
    """

    QUALITY_GATE_THRESHOLD = 60.0
    MAX_FIX_RETRIES = 5

    def __init__(self) -> None:
        self._factory = _get_factory()
        self._ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

        # Load all agents dynamically (avoids relative import issues)
        self._cp_mod = _load_module(
            "context_packs", f"{BASE}/09-EXECUTION/context_packs.py"
        )
        self._dev_mod = _load_module(
            "developer", f"{BASE}/06-AGENTS/developer.py"
        )
        self._test_mod = _load_module(
            "tester", f"{BASE}/06-AGENTS/tester.py"
        )
        self._fix_mod = _load_module(
            "fix_loop", f"{BASE}/09-EXECUTION/fix_loop.py"
        )
        self._rev_mod = _load_module(
            "reviewer", f"{BASE}/06-AGENTS/reviewer.py"
        )
        self._sec_mod = _load_module(
            "security", f"{BASE}/06-AGENTS/security.py"
        )
        self._git_mod = _load_module(
            "git_agent", f"{BASE}/06-AGENTS/git_agent.py"
        )

        # Instantiate agents
        self._developer = self._dev_mod.DeveloperAgent()
        self._tester = self._test_mod.TesterAgent()
        self._fix_loop = self._fix_mod.FixLoop()
        self._reviewer = self._rev_mod.ReviewerAgent()
        self._security = self._sec_mod.SecurityAgent()
        self._git = self._git_mod.GitAgent()

    async def run_pipeline(
        self,
        task_id: UUID,
        workspace_id: UUID,
        project_id: UUID,
        run_group: UUID,
    ) -> dict[str, Any]:
        """Execute the full autonomous pipeline for a task."""
        report = {
            "task_id": str(task_id),
            "workspace_id": str(workspace_id),
            "run_group": str(run_group),
            "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": [],
            "final_status": "running",
            "quality_score": None,
            "artifacts": [],
            "error": None,
        }

        try:
            # ── STAGE 1: Context Pack ─────────────────────────────────────────
            ctx_result = await self._run_stage(
                "context_pack", run_group, task_id, workspace_id, project_id,
                self._cp_mod.build_context_pack,
                task_id, workspace_id, project_id,
            )
            report["stages"].append(ctx_result)
            if not ctx_result["is_ok"]:
                report["final_status"] = "failed"
                return report

            context_pack = ctx_result["output"]
            knowledge_count = context_pack.get("knowledge_count", 0)
            print(f"  Context pack ready — {knowledge_count} knowledge snippets from Qdrant")

            # ── STAGE 2: Developer Agent ──────────────────────────────────────
            dev_result = await self._run_stage(
                "coding", run_group, task_id, workspace_id, project_id,
                self._developer.execute,
                context_pack,
            )
            report["stages"].append(dev_result)
            if not dev_result["is_ok"]:
                report["final_status"] = "failed"
                return report

            dev_output = dev_result["output"]
            generated_code = dev_output["code"]
            code_file_path = dev_output["file_path"]
            language = dev_output["language"]
            print(f"  Code generated — {dev_output['lines']} lines — {language}")

            # ── STAGE 3: Write to filesystem ──────────────────────────────────
            write_result = await self._run_stage(
                "writing", run_group, task_id, workspace_id, project_id,
                self._write_code,
                code_file_path, generated_code,
            )
            report["stages"].append(write_result)
            report["artifacts"].append(code_file_path)

            # ── STAGE 4: Lint ─────────────────────────────────────────────────
            lint_result = await self._run_stage(
                "linting", run_group, task_id, workspace_id, project_id,
                self._run_lint,
                code_file_path, language,
            )
            report["stages"].append(lint_result)

            # ── STAGE 5: Test ─────────────────────────────────────────────────
            test_result = await self._run_stage(
                "testing", run_group, task_id, workspace_id, project_id,
                self._tester.execute,
                context_pack, generated_code, code_file_path, language,
            )
            report["stages"].append(test_result)
            test_data = test_result.get("output", {}) or {}

            # ── STAGE 6: Fix Loop ─────────────────────────────────────────────
            current_code = generated_code
            fix_attempt = 0

            while (
                not test_data.get("passed", True)
                and not test_data.get("skipped", False)
                and fix_attempt < self.MAX_FIX_RETRIES
            ):
                fix_attempt += 1
                print(f"  Tests failed — fix attempt {fix_attempt}/{self.MAX_FIX_RETRIES}")

                fix_stage = await self._run_stage(
                    f"fix_{fix_attempt}", run_group, task_id, workspace_id, project_id,
                    self._fix_loop.attempt_fix,
                    context_pack, current_code, code_file_path,
                    test_data, fix_attempt, language,
                )
                report["stages"].append(fix_stage)

                if fix_stage["is_ok"] and fix_stage["output"].get("fix_applied"):
                    current_code = fix_stage["output"]["fixed_code"]

                    # Re-run tests
                    retest = await self._run_stage(
                        f"retest_{fix_attempt}", run_group, task_id, workspace_id, project_id,
                        self._tester.execute,
                        context_pack, current_code, code_file_path, language,
                    )
                    report["stages"].append(retest)
                    test_data = retest.get("output", {}) or {}

                    if test_data.get("passed"):
                        print(f"  Tests passed after fix {fix_attempt}")
                        break
                else:
                    break

            # ── STAGE 7: Review ───────────────────────────────────────────────
            review_result = await self._run_stage(
                "review", run_group, task_id, workspace_id, project_id,
                self._reviewer.score,
                current_code, language, test_data, context_pack,
            )
            report["stages"].append(review_result)
            quality_scores = review_result.get("output", {}) or {}
            report["quality_score"] = quality_scores

            # ── STAGE 8: Security ─────────────────────────────────────────────
            sec_result = await self._run_stage(
                "security", run_group, task_id, workspace_id, project_id,
                self._security.scan,
                current_code, code_file_path, language,
            )
            report["stages"].append(sec_result)
            sec_data = sec_result.get("output", {}) or {}

            # Adjust security score based on scan
            if sec_data.get("high_count", 0) > 0 and quality_scores:
                quality_scores["security_score"] = max(
                    0, quality_scores.get("security_score", 60) - (sec_data["high_count"] * 15)
                )
                # Recompute overall
                quality_scores["overall_score"] = self._recompute_overall(quality_scores)
                quality_scores["passed_gate"] = quality_scores["overall_score"] >= self.QUALITY_GATE_THRESHOLD

            # Save quality score to database
            await self._save_quality(run_group, quality_scores or {})

            # ── STAGE 9: Quality Gate ─────────────────────────────────────────
            overall = quality_scores.get("overall_score", 0) if quality_scores else 0
            gate_passed = overall >= self.QUALITY_GATE_THRESHOLD

            if not gate_passed:
                print(f"  Quality gate FAILED: {overall:.1f} < {self.QUALITY_GATE_THRESHOLD}")
                report["final_status"] = "quality_gate_failed"
                await self._set_task_status(task_id, workspace_id, "failed")
                await self._save_memory(
                    workspace_id, run_group,
                    context_pack["task"]["title"],
                    "failure",
                    f"Quality gate failed. Score: {overall:.1f}. Fix: improve architecture separation and add docstrings.",
                )
                return report

            print(f"  Quality gate PASSED: {overall:.1f} >= {self.QUALITY_GATE_THRESHOLD}")

            # ── STAGE 10: Git Commit ──────────────────────────────────────────
            git_result = await self._run_stage(
                "commit", run_group, task_id, workspace_id, project_id,
                self._git.commit_artifacts,
                context_pack, report["artifacts"], run_group, quality_scores or {},
            )
            report["stages"].append(git_result)

            # ── STAGE 11: Memory ──────────────────────────────────────────────
            await self._set_task_status(task_id, workspace_id, "done")
            await self._save_memory(
                workspace_id, run_group,
                context_pack["task"]["title"],
                "success",
                f"Completed successfully. Score: {overall:.1f}. "
                f"Files: {[Path(a).name for a in report['artifacts']]}. "
                f"Knowledge snippets used: {knowledge_count}.",
            )

            report["final_status"] = "completed"
            report["completed_at"] = datetime.now(timezone.utc).isoformat()
            print(f"  Pipeline COMPLETE for task: {context_pack['task']['title']}")

        except Exception as exc:
            import traceback
            report["final_status"] = "error"
            report["error"] = str(exc)
            report["traceback"] = traceback.format_exc()[-500:]
            await self._set_task_status(task_id, workspace_id, "failed")

        return report

    def _recompute_overall(self, scores: dict) -> float:
        return round(min(
            scores.get("architecture_score", 0) * 0.25 +
            scores.get("security_score", 0) * 0.20 +
            scores.get("performance_score", 0) * 0.15 +
            scores.get("test_coverage_score", 0) * 0.15 +
            scores.get("code_smells_score", 0) * 0.10 +
            scores.get("doc_completeness_score", 0) * 0.10 +
            (100.0 - scores.get("hallucination_index", 5)) * 0.05,
            100.0,
        ), 2)

    async def _run_stage(self, stage, rg, tid, wid, pid, fn, *args):
        start = time.time()
        result = {"stage": stage, "is_ok": False, "output": None, "error": None}
        try:
            result["output"] = await fn(*args)
            result["is_ok"] = True
        except Exception as exc:
            result["error"] = str(exc)
        result["duration_ms"] = int((time.time() - start) * 1000)
        await self._save_run(rg, tid, wid, pid, stage, result["is_ok"],
                             result["duration_ms"],
                             str(result.get("output", ""))[:300],
                             result.get("error"))
        return result

    async def _write_code(self, file_path: str, code: str) -> dict:
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)
        Path(file_path).write_text(code, encoding="utf-8")
        return {"written": True, "path": file_path, "size": len(code)}

    async def _run_lint(self, file_path: str, language: str) -> dict:
        if language != "python":
            return {"skipped": True, "reason": f"No linter for {language}"}
        try:
            result = subprocess.run(
                ["ruff", "check", file_path, "--fix", "--quiet"],
                capture_output=True, text=True, timeout=20,
            )
            return {"exit_code": result.returncode, "output": result.stdout[:300]}
        except Exception as exc:
            return {"error": str(exc)}

    async def _save_run(self, rg, tid, wid, pid, stage, ok, dur, preview, err):
        import json
        async with self._factory() as s:
            try:
                await s.execute(
                    text("""
                        INSERT INTO builder_runs
                        (workspace_id, project_id, task_id, run_group,
                         stage, is_ok, duration_ms, output_preview, error_message)
                        VALUES (:wid,:pid,:tid,:rg,:stage,:ok,:dur,:preview,:err)
                    """),
                    {"wid": str(wid), "pid": str(pid), "tid": str(tid),
                     "rg": str(rg), "stage": stage, "ok": ok,
                     "dur": dur, "preview": str(preview or "")[:400], "err": err},
                )
                await s.commit()
            except Exception:
                pass

    async def _save_quality(self, rg, scores):
        import json
        if not scores:
            return
        async with self._factory() as s:
            try:
                await s.execute(
                    text("""
                        INSERT INTO quality_scores
                        (run_group, architecture_score, security_score,
                         performance_score, test_coverage_score, code_smells_score,
                         doc_completeness_score, hallucination_index,
                         overall_score, passed_gate, feedback_details)
                        VALUES (:rg,:arch,:sec,:perf,:cov,:smell,:doc,
                                :hall,:overall,:gate,CAST(:fb AS jsonb))
                    """),
                    {
                        "rg": str(rg),
                        "arch": scores.get("architecture_score", 0),
                        "sec": scores.get("security_score", 0),
                        "perf": scores.get("performance_score", 0),
                        "cov": scores.get("test_coverage_score", 0),
                        "smell": scores.get("code_smells_score", 0),
                        "doc": scores.get("doc_completeness_score", 0),
                        "hall": scores.get("hallucination_index", 5),
                        "overall": scores.get("overall_score", 0),
                        "gate": scores.get("passed_gate", False),
                        "fb": json.dumps({"threshold": self.QUALITY_GATE_THRESHOLD,
                                         "knowledge_connected": True}),
                    },
                )
                await s.commit()
            except Exception:
                pass

    async def _set_task_status(self, tid, wid, status):
        async with self._factory() as s:
            try:
                await s.execute(
                    text("UPDATE tasks SET status=:s WHERE id=:tid AND workspace_id=:wid"),
                    {"s": status, "tid": str(tid), "wid": str(wid)},
                )
                await s.commit()
            except Exception:
                pass

    async def _save_memory(self, wid, rg, title, outcome, details):
        mtype = "failure" if outcome == "failure" else "execution"
        if outcome == "success":
            mtype = "learning"
        content = f"Task: {title}\nOutcome: {outcome}\nRun: {rg}\nDetails: {details[:400]}"
        async with self._factory() as s:
            try:
                await s.execute(
                    text("INSERT INTO memories (workspace_id, memory_type, content) VALUES (:w,:m,:c)"),
                    {"w": str(wid), "m": mtype, "c": content},
                )
                await s.commit()
            except Exception:
                pass
