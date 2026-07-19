"""Self Improvement Loop — post-sprint retrospective and prompt updates."""
import httpx
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.db.engine import engine
from src.db.models import SprintRetrospective, PromptTemplate
from src import hub_client
from src.settings import OLLAMA_BASE_URL, MODELS


def _call_ollama(prompt: str) -> str:
    try:
        r = httpx.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": MODELS["planning"],
                "messages": [
                    {"role": "system", "content": "You are an AI engineering retrospective facilitator. Be specific and actionable."},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 1500},
            },
            timeout=180,
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()
    except Exception as e:
        return f"[AI unavailable: {e}]"


def run_sprint_retrospective(workspace_id: str, sprint_name: str = "COMMERCIAL Sprint 1") -> dict:
    """Run full sprint retrospective and store results."""
    # Gather sprint data
    with Session(engine) as s:
        total = s.execute(text("SELECT COUNT(*) FROM tasks WHERE workspace_id=:ws"), {"ws": workspace_id}).scalar() or 0
        completed = s.execute(text("SELECT COUNT(*) FROM tasks WHERE workspace_id=:ws AND status='done'"), {"ws": workspace_id}).scalar() or 0
        failed = s.execute(text("SELECT COUNT(*) FROM tasks WHERE workspace_id=:ws AND status='failed'"), {"ws": workspace_id}).scalar() or 0
        avg_score = s.execute(text("SELECT AVG(quality_score) FROM execution_runs WHERE workspace_id=:ws AND quality_score>0"), {"ws": workspace_id}).scalar() or 0

    failures = hub_client.recall(workspace_id, "failure")
    failure_text = "\n".join([f"- {m['subject']}: {m['content'][:150]}" for m in failures[:10]])

    prompt = f"""Sprint Retrospective for: {sprint_name}

DATA:
- Total tasks: {total}
- Completed: {completed} ({round(completed/total*100 if total else 0, 1)}%)
- Failed: {failed}
- Average review score: {round(float(avg_score), 1)}/100

FAILURES:
{failure_text or 'No recorded failures'}

Analyze and return JSON:
{{
  "top_failure_pattern": "what pattern caused most failures",
  "best_performing_area": "what worked well",
  "prompt_improvement": "specific prompt improvement for developer agent",
  "adr_suggestion": "if an architecture decision should be documented, describe it",
  "next_sprint_focus": "what to focus on next sprint",
  "lessons": ["lesson 1", "lesson 2", "lesson 3"]
}}"""

    raw = _call_ollama(prompt)
    analysis = {}
    try:
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start >= 0 and end > start:
            analysis = json.loads(raw[start:end])
    except Exception:
        analysis = {"top_failure_pattern": raw[:200], "lessons": []}

    success_rate = round(completed / total * 100 if total > 0 else 0.0, 1)

    retro = SprintRetrospective(
        workspace_id=workspace_id,
        sprint_name=sprint_name,
        total_tasks=total,
        success_rate=success_rate,
        avg_review_score=round(float(avg_score), 1),
        top_failure_pattern=analysis.get("top_failure_pattern", ""),
        recommended_changes=analysis,
        adrs_created=1 if analysis.get("adr_suggestion") else 0,
        prompts_updated=0,
    )
    with Session(engine) as s:
        s.add(retro)
        s.commit()
        retro_id = retro.id

    # Store lessons in memory
    for lesson in analysis.get("lessons", [])[:3]:
        hub_client.remember(
            workspace_id=workspace_id,
            memory_type="learning",
            subject=f"lesson:{sprint_name}",
            content=lesson,
        )

    # Store ADR suggestion
    if analysis.get("adr_suggestion"):
        hub_client.remember(
            workspace_id=workspace_id,
            memory_type="architecture",
            subject=f"ADR:{sprint_name}",
            content=analysis["adr_suggestion"],
        )

    return {
        "ok": True,
        "retrospective_id": retro_id,
        "sprint_name": sprint_name,
        "success_rate": success_rate,
        "avg_review_score": round(float(avg_score), 1),
        "analysis": analysis,
    }


def get_prompt_templates(task_type: str = "") -> list:
    """List current prompt templates."""
    with Session(engine) as s:
        if task_type:
            rows = s.execute(text("SELECT * FROM prompt_templates WHERE task_type=:t ORDER BY version DESC"), {"t": task_type}).fetchall()
        else:
            rows = s.execute(text("SELECT * FROM prompt_templates ORDER BY created_at DESC")).fetchall()
        return [dict(r._mapping) for r in rows]


def upsert_prompt_template(template_name: str, task_type: str,
                            content: str, improvement_reason: str = "") -> dict:
    """Create or update a prompt template."""
    with Session(engine) as s:
        existing = s.execute(
            text("SELECT id, version FROM prompt_templates WHERE template_name=:n"),
            {"n": template_name}
        ).fetchone()
        if existing:
            new_version = existing[1] + 1
            s.execute(
                text("""UPDATE prompt_templates
                    SET template_content=:c, version=:v,
                        improvement_reason=:r, last_improved_at=now()
                    WHERE template_name=:n"""),
                {"c": content, "v": new_version, "r": improvement_reason, "n": template_name}
            )
            s.commit()
            return {"ok": True, "action": "updated", "version": new_version}
        else:
            pt = PromptTemplate(
                template_name=template_name,
                task_type=task_type,
                template_content=content,
                improvement_reason=improvement_reason,
            )
            s.add(pt)
            s.commit()
            return {"ok": True, "action": "created", "id": pt.id}
