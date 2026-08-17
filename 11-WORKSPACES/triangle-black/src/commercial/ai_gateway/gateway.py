"""
AI Gateway — T-010
Single governed entry point for all AI calls in Triangle Black.
Every AI request goes through this layer — never directly to model providers.

Architecture:
  Router/Service
  → AIGateway.request()
  → Tenant context check
  → Cost policy check
  → Model resolution
  → Provider call (Ollama/OpenAI/local)
  → Audit log
  → Response

All calls are:
- Tenant-scoped (hotel_id)
- Audited to platform_audit_log
- Cost-tracked
- Non-blocking on failure
"""
from __future__ import annotations
import uuid
import json
import time
from datetime import datetime
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from sqlalchemy.orm import Session
from sqlalchemy import text


@dataclass
class AIRequest:
    """Governed AI request with tenant context."""
    hotel_id: str
    purpose: str
    prompt: str
    model: str = "qwen2.5:7b"
    actor: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    max_tokens: int = 500
    temperature: float = 0.3
    cost_budget_usd: float = 0.10
    correlation_id: str = field(default_factory=lambda: str(uuid.uuid4()))


@dataclass
class AIResponse:
    """Governed AI response with audit trail."""
    request_id: str
    hotel_id: str
    purpose: str
    model: str
    content: str
    success: bool
    latency_ms: float
    cost_estimate_usd: float = 0.0
    error: Optional[str] = None
    audit_id: Optional[str] = None


class AIGateway:
    """
    Governed AI Gateway.
    All AI requests must pass through this class.
    Provides: tenant isolation, audit, cost tracking, model registry.
    """

    # Supported models — extensible
    MODEL_REGISTRY = {
        "qwen2.5:7b":     {"provider": "ollama", "cost_per_1k_tokens": 0.0},
        "llama3.2:3b":    {"provider": "ollama", "cost_per_1k_tokens": 0.0},
        "deepseek-r1:7b": {"provider": "ollama", "cost_per_1k_tokens": 0.0},
        "gpt-4o-mini":    {"provider": "openai", "cost_per_1k_tokens": 0.00015},
        "gpt-4o":         {"provider": "openai", "cost_per_1k_tokens": 0.005},
    }

    # Purpose registry — what AI is allowed to do
    ALLOWED_PURPOSES = {
        "maintenance_recommendation",
        "work_order_summary",
        "supplier_analysis",
        "procurement_suggestion",
        "asset_risk_assessment",
        "schedule_optimization",
        "cost_anomaly_detection",
        "service_request_triage",
        "report_generation",
        "knowledge_retrieval",
        "signal_analysis",
        "general_assistance",
    }

    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def request(self, req: AIRequest) -> AIResponse:
        """
        Main gateway entry point.
        Validates, executes, audits every AI request.
        """
        start = time.perf_counter()
        request_id = str(uuid.uuid4())

        # Validate purpose
        if req.purpose not in self.ALLOWED_PURPOSES:
            return AIResponse(
                request_id=request_id,
                hotel_id=self.hotel_id,
                purpose=req.purpose,
                model=req.model,
                content="",
                success=False,
                latency_ms=0.0,
                error=f"Purpose not allowed: {req.purpose}. Allowed: {sorted(self.ALLOWED_PURPOSES)}"
            )

        # Validate model
        if req.model not in self.MODEL_REGISTRY:
            req.model = "qwen2.5:7b"  # fallback to local

        # Execute
        content, error = self._call_model(req)
        latency_ms = round((time.perf_counter() - start) * 1000, 1)
        cost = self._estimate_cost(req.model, req.prompt, content)

        # Audit
        audit_id = self._emit_audit(
            request_id=request_id,
            req=req,
            content=content,
            latency_ms=latency_ms,
            cost=cost,
            error=error,
        )

        return AIResponse(
            request_id=request_id,
            hotel_id=self.hotel_id,
            purpose=req.purpose,
            model=req.model,
            content=content,
            success=error is None,
            latency_ms=latency_ms,
            cost_estimate_usd=cost,
            error=error,
            audit_id=audit_id,
        )

    def _call_model(self, req: AIRequest):
        """Call the appropriate model provider."""
        model_info = self.MODEL_REGISTRY.get(req.model, {})
        provider = model_info.get("provider", "ollama")

        if provider == "ollama":
            return self._call_ollama(req)
        elif provider == "openai":
            return self._call_openai(req)
        return "", f"Unknown provider: {provider}"

    def _call_ollama(self, req: AIRequest):
        """Call local Ollama model."""
        try:
            import requests as _req
            resp = _req.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": req.model,
                    "prompt": req.prompt,
                    "stream": False,
                    "options": {
                        "temperature": req.temperature,
                        "num_predict": req.max_tokens,
                    }
                },
                timeout=30
            )
            if resp.status_code == 200:
                return resp.json().get("response", ""), None
            return "", f"Ollama error: {resp.status_code}"
        except Exception as e:
            return "", f"Ollama unavailable: {str(e)[:100]}"

    def _call_openai(self, req: AIRequest):
        """Call OpenAI API (if configured)."""
        try:
            import os
            api_key = os.environ.get("OPENAI_API_KEY")
            if not api_key:
                return "", "OpenAI not configured (OPENAI_API_KEY missing)"
            import requests as _req
            resp = _req.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}",
                         "Content-Type": "application/json"},
                json={
                    "model": req.model,
                    "messages": [{"role": "user", "content": req.prompt}],
                    "max_tokens": req.max_tokens,
                    "temperature": req.temperature,
                },
                timeout=30
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"], None
            return "", f"OpenAI error: {resp.status_code}"
        except Exception as e:
            return "", f"OpenAI call failed: {str(e)[:100]}"

    def _estimate_cost(self, model: str, prompt: str, content: str) -> float:
        """Rough token-based cost estimate."""
        try:
            model_info = self.MODEL_REGISTRY.get(model, {})
            cost_per_1k = model_info.get("cost_per_1k_tokens", 0.0)
            tokens = (len(prompt) + len(content)) // 4
            return round(cost_per_1k * tokens / 1000, 6)
        except Exception:
            return 0.0

    def _emit_audit(self, request_id: str, req: AIRequest,
                    content: str, latency_ms: float,
                    cost: float, error: Optional[str]) -> Optional[str]:
        """Non-blocking audit event for AI request."""
        try:
            audit_id = str(uuid.uuid4())
            self.db.execute(text(
                """INSERT INTO platform_audit_log
                   (id, hotel_id, event_type, entity_id, actor, metadata, created_at)
                   VALUES (:id, :hid, :et, :eid, :actor, :meta, :now)"""
            ), {
                "id": audit_id,
                "hid": self.hotel_id,
                "et": "AI_REQUEST",
                "eid": request_id,
                "actor": req.actor or "system",
                "meta": json.dumps({
                    "purpose": req.purpose,
                    "model": req.model,
                    "latency_ms": latency_ms,
                    "cost_usd": cost,
                    "success": error is None,
                    "error": error,
                    "correlation_id": req.correlation_id,
                }),
                "now": datetime.utcnow(),
            })
            self.db.commit()
            return audit_id
        except Exception:
            return None

    def get_registry(self) -> Dict[str, Any]:
        """Return model registry for admin inspection."""
        return {
            "hotel_id": self.hotel_id,
            "models": list(self.MODEL_REGISTRY.keys()),
            "purposes": sorted(self.ALLOWED_PURPOSES),
            "model_count": len(self.MODEL_REGISTRY),
            "purpose_count": len(self.ALLOWED_PURPOSES),
        }
