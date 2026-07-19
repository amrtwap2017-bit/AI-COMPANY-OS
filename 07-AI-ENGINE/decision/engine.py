"""
app/decision/engine.py
────────────────────────────────────────────────────────────────
Orchestrates the full decision pipeline.

Pipeline:
  1. Score confidence (ConfidenceScorer)
  2. Analyze risks (RiskAnalyzer)
  3. Generate alternatives if needed (AlternativesGenerator)
  4. Determine verdict (accept/review/retry/escalate)
  5. Persist DecisionRecord to DB
  6. Return DecisionResult

Usage in ChatService:
    decision = decision_engine.evaluate(DecisionInput(...))
    if decision.verdict == DecisionVerdict.ACCEPT:
        return response
    elif decision.verdict == DecisionVerdict.RETRY:
        # re-run agent with improved prompt
"""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from decision.models import (
    DecisionInput,
    DecisionResult,
    DecisionVerdict,
    RiskLevel,
)
from decision.scorer import ConfidenceScorer
from decision.risk import RiskAnalyzer
from decision.alternatives import AlternativesGenerator
from models.db.decision import DecisionRecord

log = logging.getLogger(__name__)

# Confidence thresholds for verdicts
ACCEPT_THRESHOLD   = 0.65
REVIEW_THRESHOLD   = 0.40


class DecisionEngine:

    def __init__(
        self,
        db: Session,
        scorer: ConfidenceScorer | None = None,
        risk_analyzer: RiskAnalyzer | None = None,
        alt_generator: AlternativesGenerator | None = None,
    ) -> None:
        self._db      = db
        self._scorer  = scorer        or ConfidenceScorer()
        self._risk    = risk_analyzer or RiskAnalyzer()
        self._alts    = alt_generator or AlternativesGenerator()

    def evaluate(
        self,
        inp: DecisionInput,
        save_record: bool = True,
    ) -> DecisionResult:
        """
        Evaluate an agent output and produce a DecisionResult.
        Never raises — falls back to ACCEPT on any error.
        """
        try:
            return self._evaluate(inp, save_record)
        except Exception as exc:
            log.error("Decision engine failed: %s", exc)
            return DecisionResult(
                input=inp,
                confidence=0.5,
                verdict=DecisionVerdict.ACCEPT,
                risk_level=RiskLevel.LOW,
                reasoning="Decision engine error — defaulting to accept",
            )

    def _evaluate(
        self,
        inp: DecisionInput,
        save_record: bool,
    ) -> DecisionResult:

        # 1. Score confidence
        confidence = self._scorer.score(inp)

        # 2. Analyze risks
        risk_flags = self._risk.analyze(inp)

        # 3. Determine risk level
        risk_level = self._determine_risk_level(risk_flags)

        # 4. Generate alternatives if needed
        alternatives = self._alts.generate(inp, confidence, risk_flags)

        # 5. Make verdict
        verdict, reasoning = self._make_verdict(
            confidence, risk_level, risk_flags
        )

        result = DecisionResult(
            input=inp,
            confidence=confidence,
            verdict=verdict,
            risk_level=risk_level,
            risk_flags=risk_flags,
            alternatives=alternatives,
            reasoning=reasoning,
            should_retry=(verdict == DecisionVerdict.RETRY),
            should_escalate=(verdict == DecisionVerdict.ESCALATE),
        )

        # 6. Persist
        if save_record:
            self._save(result)

        log.debug(
            "Decision: agent=%s confidence=%.2f verdict=%s risk=%s",
            inp.agent_name,
            confidence,
            verdict.value,
            risk_level.value,
        )

        return result

    def _determine_risk_level(self, flags) -> RiskLevel:
        if not flags:
            return RiskLevel.LOW
        order = {
            RiskLevel.CRITICAL: 3,
            RiskLevel.HIGH:     2,
            RiskLevel.MEDIUM:   1,
            RiskLevel.LOW:      0,
        }
        return max(flags, key=lambda f: order[f.severity]).severity

    def _make_verdict(
        self,
        confidence: float,
        risk_level: RiskLevel,
        flags,
    ) -> tuple[DecisionVerdict, str]:

        # Critical risk always escalates
        if risk_level == RiskLevel.CRITICAL:
            return (
                DecisionVerdict.ESCALATE,
                f"Critical risk detected: "
                f"{[f.description for f in flags if f.severity == RiskLevel.CRITICAL]}",
            )

        # High risk + low confidence → retry
        if risk_level == RiskLevel.HIGH and confidence < ACCEPT_THRESHOLD:
            return (
                DecisionVerdict.RETRY,
                f"High risk (level={risk_level.value}) combined with "
                f"low confidence ({confidence:.2f}) → retry recommended",
            )

        # Low confidence → retry
        if confidence < REVIEW_THRESHOLD:
            return (
                DecisionVerdict.RETRY,
                f"Confidence too low ({confidence:.2f} < {REVIEW_THRESHOLD}) "
                f"to accept this output",
            )

        # Medium confidence → flag for review
        if confidence < ACCEPT_THRESHOLD:
            return (
                DecisionVerdict.REVIEW,
                f"Confidence ({confidence:.2f}) is acceptable but below "
                f"the acceptance threshold ({ACCEPT_THRESHOLD}). "
                f"Human review recommended.",
            )

        # High confidence + acceptable risk → accept
        return (
            DecisionVerdict.ACCEPT,
            f"Confidence {confidence:.2f} meets acceptance threshold. "
            f"Risk level: {risk_level.value}. Output accepted.",
        )

    def _save(self, result: DecisionResult) -> None:
        """Persist the decision record to the database."""
        try:
            record = DecisionRecord(
                agent_name=result.input.agent_name,
                task=result.input.task,
                model_used=result.input.model_used,
                confidence=result.confidence,
                verdict=result.verdict.value,
                risk_level=result.risk_level.value,
                risk_flags=[
                    {
                        "category":    f.category,
                        "description": f.description,
                        "severity":    f.severity.value,
                        "evidence":    f.evidence,
                    }
                    for f in result.risk_flags
                ],
                alternatives=[
                    {
                        "approach":  a.approach,
                        "rationale": a.rationale,
                        "agents":    a.agents,
                    }
                    for a in result.alternatives
                ],
                reasoning=result.reasoning,
                output_length=len(result.input.output),
                duration_seconds=result.input.duration_s,
            )
            self._db.add(record)
            self._db.commit()
        except Exception as exc:
            log.debug("Decision record save failed: %s", exc)
            self._db.rollback()

    def get_decisions(
        self,
        agent_name: str | None = None,
        verdict: str | None = None,
        limit: int = 20,
    ) -> list[DecisionRecord]:
        q = self._db.query(DecisionRecord)
        if agent_name:
            q = q.filter(DecisionRecord.agent_name == agent_name)
        if verdict:
            q = q.filter(DecisionRecord.verdict == verdict)
        return (
            q.order_by(DecisionRecord.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_agent_confidence(self, agent_name: str) -> dict:
        from sqlalchemy import func
        from sqlalchemy import case, Integer as SAInteger
        row = (
            self._db.query(
                func.count(DecisionRecord.id).label("total"),
                func.avg(DecisionRecord.confidence).label("avg_confidence"),
                func.sum(
                    case((DecisionRecord.verdict == "accept", 1), else_=0)
                ).label("accepted"),
            )
            .filter(DecisionRecord.agent_name == agent_name)
            .one()
        )
        total = row.total or 0
        return {
            "agent":          agent_name,
            "total_decisions": total,
            "avg_confidence": (
                round(float(row.avg_confidence), 3) if row.avg_confidence else None
            ),
            "accept_rate": (
                round(int(row.accepted or 0) / total * 100, 1) if total else 0.0
            ),
        }
