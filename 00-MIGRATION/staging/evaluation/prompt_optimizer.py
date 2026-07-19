"""
app/evaluation/prompt_optimizer.py
────────────────────────────────────────────────────────────────
Automatically improves agent prompt templates using LLM.

Pipeline per agent:
  1. Read current prompt content
  2. Read quality data (reflections, decisions, learning insights)
  3. Ask LLM: "Here is the prompt and its problems. Improve it."
  4. Validate the improvement (must be meaningfully different)
  5. Return improved prompt text

The optimizer does NOT save or activate prompts.
That is the caller's responsibility (PromptVersionStore).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from app.services.ollama import ollama_service
from app.models.router import model_router

log = logging.getLogger(__name__)

MIN_IMPROVEMENT_CHARS = 50   # New prompt must differ by at least 50 chars
MAX_PROMPT_CHARS      = 4000 # Cap prompt size sent to LLM


@dataclass
class OptimizationResult:
    agent_name:      str
    original_prompt: str
    improved_prompt: str
    change_summary:  str
    hints_applied:   list[str]
    success:         bool
    error:           str | None = None

    @property
    def is_meaningfully_different(self) -> bool:
        """True if the improvement is substantive, not just whitespace."""
        orig_stripped = self.original_prompt.strip()
        impr_stripped = self.improved_prompt.strip()
        if orig_stripped == impr_stripped:
            return False
        diff_chars = abs(len(impr_stripped) - len(orig_stripped))
        return diff_chars >= MIN_IMPROVEMENT_CHARS


class PromptOptimizer:

    def optimize(
        self,
        agent_name:         str,
        current_prompt:     str,
        quality_score:      float | None   = None,
        rejection_rate:     float | None   = None,
        improvement_hints:  list[str]      = None,
        failure_examples:   list[str]      = None,
    ) -> OptimizationResult:
        """
        Generate an improved version of an agent's system prompt.

        Args:
            agent_name:        Which agent to improve
            current_prompt:    Current .md file content
            quality_score:     avg quality from reflections (0-1)
            rejection_rate:    % outputs rejected by decision engine
            improvement_hints: Specific hints from learning engine
            failure_examples:  Sample failure cases to learn from

        Returns:
            OptimizationResult with improved_prompt text
        """
        hints = improvement_hints or []
        failures = failure_examples or []

        log.info(
            "Optimizing prompt for agent %s (quality=%.2f)",
            agent_name, quality_score or 0,
        )

        try:
            improved = self._generate_improvement(
                agent_name=agent_name,
                current_prompt=current_prompt[:MAX_PROMPT_CHARS],
                quality_score=quality_score,
                rejection_rate=rejection_rate,
                hints=hints,
                failures=failures,
            )

            if not improved or len(improved.strip()) < 100:
                return OptimizationResult(
                    agent_name=agent_name,
                    original_prompt=current_prompt,
                    improved_prompt=current_prompt,
                    change_summary="No improvement generated",
                    hints_applied=hints,
                    success=False,
                    error="Generated prompt too short or empty",
                )

            change_summary = self._summarize_changes(
                current_prompt, improved, hints
            )

            return OptimizationResult(
                agent_name=agent_name,
                original_prompt=current_prompt,
                improved_prompt=improved,
                change_summary=change_summary,
                hints_applied=hints,
                success=True,
            )

        except Exception as exc:
            log.error("Prompt optimization failed for %s: %s", agent_name, exc)
            return OptimizationResult(
                agent_name=agent_name,
                original_prompt=current_prompt,
                improved_prompt=current_prompt,
                change_summary="",
                hints_applied=hints,
                success=False,
                error=str(exc),
            )

    def _generate_improvement(
        self,
        agent_name:    str,
        current_prompt: str,
        quality_score: float | None,
        rejection_rate: float | None,
        hints:         list[str],
        failures:      list[str],
    ) -> str:
        """Call LLM to generate the improved prompt."""
        model = model_router.route("write a structured document")

        system = """You are an expert AI prompt engineer.
Your task is to improve agent system prompts to increase output quality.

Rules:
1. Keep the agent's identity, role, and core purpose intact
2. Add clearer output format requirements if missing
3. Add concrete examples of what good output looks like
4. Add explicit completion signals (conclusion, summary, etc.)
5. Make requirements more specific and measurable
6. Keep the prompt under 2000 words
7. Return ONLY the improved prompt — no commentary or explanations
8. Use markdown formatting with clear sections
"""

        quality_info = ""
        if quality_score is not None:
            quality_info += f"\nCurrent quality score: {quality_score:.2f}/1.0"
        if rejection_rate is not None:
            quality_info += f"\nOutput rejection rate: {rejection_rate:.0%}"

        hints_text = ""
        if hints:
            hints_text = "\nIdentified improvement areas:\n" + "\n".join(
                f"- {h}" for h in hints
            )

        failures_text = ""
        if failures:
            failures_text = "\nSample failure cases to address:\n" + "\n".join(
                f"- {f}" for f in failures[:3]
            )

        prompt = f"""Improve this system prompt for the "{agent_name}" AI agent.

CURRENT PROMPT:
{current_prompt}

PERFORMANCE ISSUES:{quality_info}{hints_text}{failures_text}

Generate an improved version that addresses these issues.
Return ONLY the improved prompt text in markdown format."""

        return ollama_service.generate(
            model=model,
            prompt=prompt,
            system=system,
        )

    def _summarize_changes(
        self,
        original: str,
        improved: str,
        hints:    list[str],
    ) -> str:
        """Generate a brief summary of what changed."""
        orig_len = len(original)
        impr_len = len(improved)
        diff     = impr_len - orig_len

        parts = [f"Prompt {'expanded' if diff > 0 else 'refined'} by {abs(diff)} chars."]

        if hints:
            parts.append(f"Applied hints: {'; '.join(hints[:3])}")

        return " ".join(parts)


prompt_optimizer = PromptOptimizer()
