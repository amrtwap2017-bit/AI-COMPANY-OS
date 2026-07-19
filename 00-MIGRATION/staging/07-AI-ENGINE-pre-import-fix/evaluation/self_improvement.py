"""
app/evaluation/self_improvement.py
────────────────────────────────────────────────────────────────
Orchestrates the full agent self-improvement pipeline.

Pipeline:
  1. Load learning insights (which agents have quality issues?)
  2. Read current prompt for each struggling agent
  3. Call PromptOptimizer to generate improved version
  4. Save to DB + activate if meaningfully better
  5. Return ImprovementReport

Triggered by:
  - POST /self-improvement/run   (manual)
  - Scheduler (future: daily)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.evaluation.prompt_optimizer import PromptOptimizer, OptimizationResult
from app.evaluation.prompt_version_store import PromptVersionStore
from app.core.prompt_loader import load_prompt, load_prompt_with_fallback

log = logging.getLogger(__name__)

QUALITY_THRESHOLD  = 0.60   # below this triggers improvement attempt
REJECTION_THRESHOLD = 0.35  # above this triggers improvement attempt


@dataclass
class AgentImprovement:
    agent_name:      str
    triggered_by:    str    # quality | rejection | both
    quality_before:  float | None
    rejection_before: float | None
    optimization:    OptimizationResult
    activated:       bool
    version_id:      int | None


@dataclass
class ImprovementReport:
    agents_analyzed: int
    agents_improved: int
    agents_skipped:  int
    improvements:    list[AgentImprovement] = field(default_factory=list)
    summary:         str = ""


class SelfImprovementEngine:

    def __init__(self, db: Session) -> None:
        self._db        = db
        self._optimizer = PromptOptimizer()
        self._store     = PromptVersionStore(db)

    def run(
        self,
        force_agents: list[str] | None = None,
        dry_run:      bool             = False,
    ) -> ImprovementReport:
        """
        Run self-improvement for all struggling agents.

        Args:
            force_agents: Override auto-detection, improve these agents
            dry_run:      Analyze but do not save/activate anything
        """
        # 1. Import existing prompts if not already in DB
        imported = self._store.import_existing_prompts()
        if imported:
            log.info("Imported %d existing prompts as v1", imported)

        # 2. Find agents needing improvement
        if force_agents:
            candidates = self._build_forced_candidates(force_agents)
        else:
            candidates = self._find_candidates()

        log.info(
            "Self-improvement: %d candidates found",
            len(candidates),
        )

        improvements: list[AgentImprovement] = []
        skipped = 0

        for candidate in candidates:
            agent_name = candidate["agent_name"]
            log.info("Processing agent: %s", agent_name)

            current_prompt = load_prompt(agent_name)
            if not current_prompt:
                log.warning("No prompt file for %s — skipping", agent_name)
                skipped += 1
                continue

            # 3. Optimize
            result = self._optimizer.optimize(
                agent_name=agent_name,
                current_prompt=current_prompt,
                quality_score=candidate.get("quality_score"),
                rejection_rate=candidate.get("rejection_rate"),
                improvement_hints=candidate.get("hints", []),
            )

            activated  = False
            version_id = None

            if result.success and result.is_meaningfully_different and not dry_run:
                # 4. Save and activate
                record = self._store.save_and_activate(
                    agent_name=agent_name,
                    content=result.improved_prompt,
                    source="auto_improvement",
                    change_summary=result.change_summary,
                    quality_before=candidate.get("quality_score"),
                    hints=result.hints_applied,
                )
                activated  = True
                version_id = record.id
                log.info(
                    "Activated improved prompt v%d for %s",
                    record.version, agent_name,
                )
            elif not result.success:
                log.warning(
                    "Optimization failed for %s: %s",
                    agent_name, result.error,
                )
                skipped += 1
                continue

            improvements.append(AgentImprovement(
                agent_name=agent_name,
                triggered_by=candidate.get("reason", "quality"),
                quality_before=candidate.get("quality_score"),
                rejection_before=candidate.get("rejection_rate"),
                optimization=result,
                activated=activated,
                version_id=version_id,
            ))

        improved_count = sum(1 for i in improvements if i.activated)

        summary = (
            f"Analyzed {len(candidates)} agents. "
            f"Improved {improved_count}. "
            f"Skipped {skipped}."
        )
        if dry_run:
            summary = "[DRY RUN] " + summary

        return ImprovementReport(
            agents_analyzed=len(candidates),
            agents_improved=improved_count,
            agents_skipped=skipped,
            improvements=improvements,
            summary=summary,
        )

    def _find_candidates(self) -> list[dict]:
        """Find agents with quality or rejection issues."""
        candidates: list[dict] = []

        # From learning engine insights
        try:
            from app.learning.engine import LearningEngine
            engine = LearningEngine(self._db)
            report = engine.run()

            for score in report.prompt_scores:
                reasons = []
                hints   = []

                if score.avg_output_quality < QUALITY_THRESHOLD:
                    reasons.append("quality")
                    hints.append(
                        f"Quality {score.avg_output_quality:.2f} below "
                        f"threshold {QUALITY_THRESHOLD}"
                    )

                if score.rejection_rate > REJECTION_THRESHOLD:
                    reasons.append("rejection")
                    hints.append(score.improvement_hint)

                if reasons:
                    candidates.append({
                        "agent_name":    score.agent_name,
                        "reason":        "+".join(reasons),
                        "quality_score": score.avg_output_quality,
                        "rejection_rate": score.rejection_rate,
                        "hints":         hints,
                    })

        except Exception as exc:
            log.warning("Could not load learning insights: %s", exc)

        return candidates

    def _build_forced_candidates(
        self,
        agent_names: list[str],
    ) -> list[dict]:
        """Build candidate list from forced agent names."""
        return [
            {
                "agent_name": name,
                "reason":     "forced",
                "hints":      ["Manual improvement requested"],
            }
            for name in agent_names
        ]


self_improvement_engine_factory = SelfImprovementEngine
