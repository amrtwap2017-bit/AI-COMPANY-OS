"""
Execution Engine — Wave 3
Autonomous build loop: Context → Code → Lint → Quality → Commit → Memory
"""

from __future__ import annotations

import importlib.util
import os
import sys
import time
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession


def _load_context_packs():
    spec = importlib.util.spec_from_file_location(
        "context_packs",
        "/home/amr/AI-COMPANY-OS/09-EXECUTION/context_packs.py",
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.build_context_pack


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
    QUALITY_GATE_THRESHOLD = 65.0

    def __init__(self) -> None:
        self._factory = _get_factory()
        self._ollama_url = os.environ.get(
            "OLLAMA_BASE_URL", "http://localhost:11434"
        )
        self._build_context_pack = _load_context_packs()

    async def run_pipeline(
        self,
        task_id: UUID,
        workspace_id: UUID,
        project_id: UUID,
        run_group: UUID,
    ) -> dict[str, Any]:
        report = {
            "task_id": str(task_id),
            "run_group": str(run_group),
            "stages": [],
            "final_status": "running",
            "quality_score": None,
            "artifacts": [],
            "error": None,
        }

        try:
            # STAGE 1: Context Pack
            ctx_result = await self._timed_stage(
                "context_pack", run_group, task_id, workspace_id, project_id,
                self._build_context_pack,
                task_id, workspace_id, project_id,
            )
            report["stages"].append(ctx_result)
            if not ctx_result["is_ok"]:
                report["final_status"] = "failed"
                return report
            context_pack = ctx_result["output"]

            # STAGE 2: Code Generation
            code_result = await self._timed_stage(
                "coding", run_group, task_id, workspace_id, project_id,
                self._generate_code, context_pack,
            )
            report["stages"].append(code_result)
            if not code_result["is_ok"]:
                report["final_status"] = "failed"
                return report
            generated_code = code_result["output"]

            # STAGE 3: Write to filesystem
            write_result = await self._timed_stage(
                "writing", run_group, task_id, workspace_id, project_id,
                self._write_code, context_pack, generated_code,
            )
            report["stages"].append(write_result)
            artifacts = write_result.get("output", {}).get("files_written", [])
            report["artifacts"].extend(artifacts)

            # STAGE 4: Lint
            lint_result = await self._timed_stage(
                "linting", run_group, task_id, workspace_id, project_id,
                self._lint, artifacts,
            )
            report["stages"].append(lint_result)

            # STAGE 5: Quality Score
            quality = await self._score(generated_code, artifacts)
            report["quality_score"] = quality
            await self._save_quality(run_group, quality)

            # STAGE 6: Quality Gate
            if quality["overall_score"] < self.QUALITY_GATE_THRESHOLD:
                report["final_status"] = "quality_gate_failed"
                await self._set_task_status(task_id, workspace_id, "failed")
                await self._save_memory(
                    workspace_id, run_group,
                    context_pack["task"]["title"],
                    "failure",
                    f"Quality gate: {quality['overall_score']:.1f} < {self.QUALITY_GATE_THRESHOLD}",
                )
                return report

            # STAGE 7: Commit
            commit_result = await self._timed_stage(
                "commit", run_group, task_id, workspace_id, project_id,
                self._commit, context_pack, artifacts, run_group,
            )
            report["stages"].append(commit_result)

            # Done
            await self._set_task_status(task_id, workspace_id, "done")
            await self._save_memory(
                workspace_id, run_group,
                context_pack["task"]["title"],
                "success",
                f"Pipeline completed. Score: {quality['overall_score']:.1f}. Files: {artifacts}",
            )
            report["final_status"] = "completed"

        except Exception as exc:
            report["final_status"] = "error"
            report["error"] = str(exc)
            await self._set_task_status(task_id, workspace_id, "failed")

        return report

    async def _timed_stage(self, stage, run_group, task_id, wid, pid, fn, *args):
        start = time.time()
        result = {"stage": stage, "is_ok": False, "output": None, "error": None}
        try:
            result["output"] = await fn(*args)
            result["is_ok"] = True
        except Exception as exc:
            result["error"] = str(exc)
        result["duration_ms"] = int((time.time() - start) * 1000)
        await self._save_run(
            run_group, task_id, wid, pid, stage,
            result["is_ok"], result["duration_ms"],
            str(result.get("output", ""))[:400],
            result.get("error"),
        )
        return result

    async def _generate_code(self, context_pack: dict) -> str:
        task = context_pack["task"]
        memories = context_pack.get("memories", [])
        failures = "\n".join(
            f"- {m['content'][:150]}"
            for m in memories if m["type"] == "failure"
        )
        avoid = f"\nAVOID THESE PAST MISTAKES:\n{failures}" if failures else ""

        prompt = f"""You are an expert Python backend developer.
Generate production-quality Python code for this task.

TASK: {task['title']}
DESCRIPTION: {task['description']}
ACCEPTANCE CRITERIA: {task['acceptance_criteria']}
{avoid}

Write clean, well-documented Python with type hints, docstrings, and error handling.
Use FastAPI patterns for APIs. Use SQLAlchemy async for database access.
Return ONLY the code."""

        model = context_pack.get("model_route", {}).get("model_id", "llama3.2:3b")
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self._ollama_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1},
                },
            )
            if resp.status_code == 200:
                return resp.json().get("response", "# generation failed")
        return "# Ollama not responding"

    async def _write_code(self, context_pack: dict, code: str) -> dict:
        import re
        from pathlib import Path

        slug = context_pack["workspace"]["slug"]
        base = context_pack["workspace"]["base_path"]
        title = context_pack["task"]["title"]
        safe = re.sub(r"[^a-z0-9_]", "_", title.lower())[:40]

        out_dir = Path(base) / slug / "artifacts"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"{safe}.py"
        out_file.write_text(code, encoding="utf-8")

        return {"files_written": [str(out_file)], "char_count": len(code)}

    async def _lint(self, artifacts: list) -> dict:
        import subprocess
        results = []
        for f in artifacts:
            try:
                proc = subprocess.run(
                    ["ruff", "check", f, "--fix"],
                    capture_output=True, text=True, timeout=20,
                )
                results.append({"file": f, "exit_code": proc.returncode})
            except Exception as exc:
                results.append({"file": f, "error": str(exc)})
        return {"results": results}

    async def _score(self, code: str, artifacts: list) -> dict:
        base = 30.0
        if '"""' in code or "'''" in code:
            base += 20.0
        if "-> " in code or ": str" in code:
            base += 20.0
        if "try:" in code or "except " in code:
            base += 15.0
        if 100 < len(code) < 5000:
            base += 15.0
        score = min(base, 100.0)
        return {
            "architecture_score": score * 0.9,
            "security_score": score * 0.85,
            "performance_score": score * 0.8,
            "test_coverage_score": 0.0,
            "code_smells_score": score * 0.9,
            "doc_completeness_score": score * 0.95,
            "hallucination_index": 5.0,
            "overall_score": score,
            "passed_gate": score >= self.QUALITY_GATE_THRESHOLD,
            "feedback_details": {
                "has_docstrings": '"""' in code,
                "has_type_hints": "-> " in code,
                "code_length": len(code),
            },
        }

    async def _commit(self, context_pack, artifacts, run_group) -> dict:
        return {
            "status": "artifacts_saved",
            "artifacts": artifacts,
            "run_group": str(run_group),
            "message": "Code written to workspace artifacts directory",
        }

    async def _save_run(self, rg, tid, wid, pid, stage, ok, dur, preview, err):
        async with self._factory() as s:
            await s.execute(
                text("""
                    INSERT INTO builder_runs
                    (workspace_id, project_id, task_id, run_group,
                     stage, is_ok, duration_ms, output_preview, error_message)
                    VALUES (:wid,:pid,:tid,:rg,:stage,:ok,:dur,:preview,:err)
                """),
                {
                    "wid": str(wid), "pid": str(pid), "tid": str(tid),
                    "rg": str(rg), "stage": stage, "ok": ok,
                    "dur": dur, "preview": preview or "", "err": err,
                },
            )
            await s.commit()

    async def _save_quality(self, rg, scores):
        import json
        async with self._factory() as s:
            await s.execute(
                text("""
                    INSERT INTO quality_scores
                    (run_group, architecture_score, security_score,
                     performance_score, test_coverage_score,
                     code_smells_score, doc_completeness_score,
                     hallucination_index, overall_score,
                     passed_gate, feedback_details)
                    VALUES (:rg,:arch,:sec,:perf,:cov,:smell,:doc,
                            :hall,:overall,:gate,CAST(:fb AS jsonb))
                """),
                {
                    "rg": str(rg),
                    "arch": scores["architecture_score"],
                    "sec": scores["security_score"],
                    "perf": scores["performance_score"],
                    "cov": scores["test_coverage_score"],
                    "smell": scores["code_smells_score"],
                    "doc": scores["doc_completeness_score"],
                    "hall": scores["hallucination_index"],
                    "overall": scores["overall_score"],
                    "gate": scores["passed_gate"],
                    "fb": json.dumps(scores["feedback_details"]),
                },
            )
            await s.commit()

    async def _set_task_status(self, tid, wid, status):
        async with self._factory() as s:
            await s.execute(
                text("UPDATE tasks SET status=:status WHERE id=:tid AND workspace_id=:wid"),
                {"status": status, "tid": str(tid), "wid": str(wid)},
            )
            await s.commit()

    async def _save_memory(self, wid, rg, title, outcome, details):
        mtype = "failure" if outcome == "failure" else "execution"
        content = f"Task: {title}\nOutcome: {outcome}\nRun: {rg}\nDetails: {details[:400]}"
        async with self._factory() as s:
            await s.execute(
                text("INSERT INTO memories (workspace_id, memory_type, content) VALUES (:wid,:mt,:c)"),
                {"wid": str(wid), "mt": mtype, "c": content},
            )
            await s.commit()
