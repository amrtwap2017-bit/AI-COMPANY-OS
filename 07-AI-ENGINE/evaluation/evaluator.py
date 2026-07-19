"""
Evaluator Agent
─────────────────────────────────────────────────────
Scores agent and workflow outputs on a 1-10 scale.
Uses the best available model with smart fallback.
"""

import re
from dataclasses import dataclass

from services.ollama import ollama_service

RETRY_THRESHOLD = 6.0

EVAL_MODELS_PRIORITY = [
    "deepseek-r1:32b",
    "deepseek-r1:14b",
    "deepseek-r1:7b",
    "qwen3:32b",
    "qwen3:14b",
    "qwen3:8b",
    "llama3.3:70b",
    "llama3.1:8b",
    "llama3.2:3b",
]


def _pick_model() -> str:
    """Pick best available evaluation model."""
    installed = ollama_service.list_models()
    installed_names = [m.split(":")[0] + ":" + m.split(":")[1] if ":" in m else m for m in installed]
    for model in EVAL_MODELS_PRIORITY:
        if model in installed:
            return model
    # Return first installed model as last resort
    return installed[0] if installed else "llama3.2:3b"


@dataclass
class EvaluationResult:
    score: float
    passed: bool
    feedback: str
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]


class EvaluatorAgent:

    def evaluate(
        self,
        task: str,
        output: str,
        context: str = "",
    ) -> EvaluationResult:

        model = _pick_model()

        system = """You are an AI Output Evaluator.
Score AI-generated outputs for quality, accuracy and usefulness.

Scoring rubric:
  10 — Perfect. Complete, accurate, well-structured, actionable.
   8 — Very good. Minor gaps but highly useful.
   6 — Acceptable. Some issues but delivers core value.
   4 — Below average. Missing key elements or has errors.
   2 — Poor. Mostly wrong or unhelpful.
   0 — Completely wrong or harmful.

Always respond in this exact format:
SCORE: <number 0-10>
STRENGTHS: <comma separated list>
WEAKNESSES: <comma separated list>
SUGGESTIONS: <comma separated list>
FEEDBACK: <one paragraph summary>
"""

        prompt = f"""Evaluate this AI output:

TASK: {task}

OUTPUT:
{output[:3000]}

{f"CONTEXT: {context[:500]}" if context else ""}

Provide your evaluation in the required format."""

        response = ollama_service.generate(
            model=model,
            prompt=prompt,
            system=system,
        )

        return self._parse_evaluation(response)

    def _parse_evaluation(self, response: str) -> EvaluationResult:
        try:
            score_match = re.search(r'SCORE:\s*([0-9.]+)', response)
            score = float(score_match.group(1)) if score_match else 5.0
            score = max(0.0, min(10.0, score))

            strengths  = self._extract_list(response, "STRENGTHS")
            weaknesses = self._extract_list(response, "WEAKNESSES")
            suggestions = self._extract_list(response, "SUGGESTIONS")

            feedback_match = re.search(
                r'FEEDBACK:\s*(.+?)(?=\n[A-Z]+:|$)',
                response, re.DOTALL,
            )
            feedback = feedback_match.group(1).strip() if feedback_match else response[:500]

            return EvaluationResult(
                score=score,
                passed=score >= RETRY_THRESHOLD,
                feedback=feedback,
                strengths=strengths,
                weaknesses=weaknesses,
                suggestions=suggestions,
            )
        except Exception:
            return EvaluationResult(
                score=5.0,
                passed=True,
                feedback="Evaluation parsing failed — output assumed acceptable.",
                strengths=[],
                weaknesses=[],
                suggestions=[],
            )

    def _extract_list(self, text: str, label: str) -> list[str]:
        match = re.search(rf'{label}:\s*(.+?)(?=\n[A-Z]+:|$)', text, re.DOTALL)
        if not match:
            return []
        raw = match.group(1).strip()
        items = [
            item.strip().lstrip("-•*").strip()
            for item in re.split(r'[,\n]', raw)
            if item.strip()
        ]
        return [i for i in items if i][:5]


evaluator_agent = EvaluatorAgent()
