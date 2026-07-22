from __future__ import annotations
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["ai-signals"])

DB_URL = "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"


@router.get("/signals", summary="Get all operational signals")
def get_signals(
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
):
    try:
        from src.commercial.ai_assistant.signals_engine import (
            generate_signals,
            get_signal_summary,
        )
        signals = generate_signals(DB_URL)
        if category:
            signals = [s for s in signals if s.get("category") == category]
        if priority:
            signals = [s for s in signals if s.get("priority") == priority]
        summary = get_signal_summary(signals)
        return {
            "signals": signals,
            "summary": summary,
            "generated_at": datetime.utcnow().isoformat(),
            "total": len(signals),
        }
    except Exception as e:
        return {
            "signals": [],
            "summary": {"critical": 0, "high": 0, "medium": 0, "total": 0},
            "generated_at": datetime.utcnow().isoformat(),
            "total": 0,
            "error": str(e),
        }


@router.get("/signals/summary", summary="Signal counts by priority for dashboard badge")
def get_signals_summary():
    try:
        from src.commercial.ai_assistant.signals_engine import (
            generate_signals,
            get_signal_summary,
        )
        signals = generate_signals(DB_URL)
        return get_signal_summary(signals)
    except Exception as e:
        return {"critical": 0, "high": 0, "medium": 0, "total": 0, "error": str(e)}
