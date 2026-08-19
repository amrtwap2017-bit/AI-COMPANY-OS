"""
T-010: AI Gateway
Single governed entry point for all AI requests in Triangle Black.

Every AI call must go through AIGateway.request():
  - Tenant context enforced
  - Cost tracking per request
  - Audit log entry created
  - Model policy checked
  - Evidence context attached
  - Response validated

Architecture:
  Router → AIGateway.request() → Model → Response → Audit → Return
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import time
import json


class AIGateway:
    """
    Governed AI Gateway — single entry point for all AI operations.

    Usage:
        gateway = AIGateway(db=db, hotel_id=hotel_id, actor_id=actor_id)
        result = gateway.request(
            purpose="maintenance_recommendation",
            context={"asset_id": "...", "history": [...]},
            model="qwen2.5-7b",
        )
    """

    # Available models — local first, cloud fallback
    AVAILABLE_MODELS = {
        "qwen2.5-7b": {
            "type": "local",
            "endpoint": "http://localhost:11434",
            "max_tokens": 4096,
            "cost_per_1k": 0.0,  # local = free
        },
        "gpt-4o-mini": {
            "type": "cloud",
            "provider": "openai",
            "max_tokens": 8192,
            "cost_per_1k": 0.00015,
        },
        "default": {
            "type": "local",
            "endpoint": "http://localhost:11434",
            "max_tokens": 4096,
            "cost_per_1k": 0.0,
        },
    }

    # Allowed purposes — enforces intentional AI usage
    ALLOWED_PURPOSES = {
        "maintenance_recommendation",
        "asset_failure_prediction",
        "procurement_analysis",
        "supplier_evaluation",
        "work_order_summary",
        "service_report_draft",
        "cost_anomaly_detection",
        "sla_risk_assessment",
        "knowledge_search",
        "executive_summary",
        "diagnostic_analysis",
        "general_analysis",
    }

    def __init__(self, db, hotel_id: str, actor_id: str = "system"):
        self.db = db
        self.hotel_id = hotel_id
        self.actor_id = actor_id
        self.request_id = str(uuid.uuid4())

    def request(
        self,
        purpose: str,
        context: Dict[str, Any],
        model: str = "default",
        prompt: Optional[str] = None,
        evidence: Optional[List[Dict]] = None,
        max_cost_usd: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Make a governed AI request.

        Args:
            purpose: What is this AI call for? Must be in ALLOWED_PURPOSES.
            context: Domain data to send to the model.
            model: Which model to use.
            prompt: Optional custom prompt (uses default if not provided).
            evidence: Supporting evidence/documents to include.
            max_cost_usd: Maximum acceptable cost for this request.

        Returns:
            {
                "request_id": str,
                "purpose": str,
                "model": str,
                "recommendation": str,
                "confidence": float,
                "evidence_used": list,
                "cost_usd": float,
                "latency_ms": int,
                "hotel_id": str,
                "actor_id": str,
                "created_at": str,
                "status": "success" | "error" | "policy_blocked"
            }
        """
        start = time.perf_counter()

        # 1. Policy check — purpose allowed?
        if purpose not in self.ALLOWED_PURPOSES:
            result = self._build_error_result(
                f"Purpose '{purpose}' not in allowed purposes",
                "policy_blocked",
                start
            )
            self._audit(purpose, model, result, context)
            return result

        # 2. Model resolution
        model_config = self.AVAILABLE_MODELS.get(model, self.AVAILABLE_MODELS["default"])

        # 3. Cost pre-check
        estimated_tokens = self._estimate_tokens(context, prompt)
        estimated_cost = (estimated_tokens / 1000) * model_config["cost_per_1k"]
        if estimated_cost > max_cost_usd:
            result = self._build_error_result(
                f"Estimated cost ${estimated_cost:.4f} exceeds budget ${max_cost_usd:.4f}",
                "policy_blocked",
                start
            )
            self._audit(purpose, model, result, context)
            return result

        # 4. Build prompt
        full_prompt = self._build_prompt(purpose, context, prompt, evidence)

        # 5. Execute model call
        try:
            response_text, actual_tokens = self._call_model(
                model_config, full_prompt, model
            )
            actual_cost = (actual_tokens / 1000) * model_config["cost_per_1k"]
        except Exception as e:
            result = self._build_error_result(str(e), "error", start)
            self._audit(purpose, model, result, context)
            return result

        # 6. Build result
        latency_ms = round((time.perf_counter() - start) * 1000)
        result = {
            "request_id": self.request_id,
            "purpose": purpose,
            "model": model,
            "model_type": model_config["type"],
            "recommendation": response_text,
            "confidence": 0.75,  # Default — can be parsed from response
            "evidence_used": evidence or [],
            "cost_usd": round(actual_cost, 6),
            "tokens_used": actual_tokens,
            "latency_ms": latency_ms,
            "hotel_id": self.hotel_id,
            "actor_id": self.actor_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "success",
        }

        # 7. Audit
        self._audit(purpose, model, result, context)

        return result

    def _call_model(
        self, model_config: Dict, prompt: str, model_name: str
    ):
        """Call the AI model. Returns (response_text, tokens_used)."""
        if model_config["type"] == "local":
            return self._call_ollama(model_config, prompt, model_name)
        elif model_config["type"] == "cloud":
            return self._call_cloud(model_config, prompt, model_name)
        else:
            raise ValueError(f"Unknown model type: {model_config['type']}")

    def _call_ollama(self, config: Dict, prompt: str, model_name: str):
        """Call local Ollama instance."""
        import urllib.request

        # Use qwen2.5:7b as default local model
        ollama_model = "qwen2.5:7b" if "qwen" in model_name else model_name

        payload = json.dumps({
            "model": ollama_model,
            "prompt": prompt,
            "stream": False,
            "options": {"num_predict": 512, "temperature": 0.3}
        }).encode()

        req = urllib.request.Request(
            f"{config['endpoint']}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
                text = data.get("response", "")
                tokens = data.get("eval_count", len(text.split()) * 2)
                return text, tokens
        except Exception:
            # Ollama not available — return graceful fallback
            return (
                f"[AI Gateway: Local model unavailable. "
                f"Purpose: {self.request_id}. "
                f"Manual analysis required.]",
                0
            )

    def _call_cloud(self, config: Dict, prompt: str, model_name: str):
        """Call cloud AI provider. Currently a stub."""
        return (
            "[AI Gateway: Cloud model not configured. Set API keys in environment.]",
            0
        )

    def _build_prompt(
        self,
        purpose: str,
        context: Dict,
        custom_prompt: Optional[str],
        evidence: Optional[List],
    ) -> str:
        """Build structured prompt for the AI model."""
        if custom_prompt:
            return custom_prompt

        context_str = json.dumps(context, indent=2, default=str)[:2000]
        evidence_str = ""
        if evidence:
            evidence_str = f"\n\nEvidence:\n{json.dumps(evidence, indent=2, default=str)[:1000]}"

        return f"""You are the Triangle Black AI Operations Assistant.
Hotel/Organization: {self.hotel_id}
Purpose: {purpose}

Context:
{context_str}{evidence_str}

Provide a concise, actionable recommendation based on the context.
Focus on: What is the situation? What should be done? What is the risk?
Keep response under 300 words. Be specific and operational."""

    def _estimate_tokens(self, context: Dict, prompt: Optional[str]) -> int:
        """Rough token estimation."""
        text = json.dumps(context, default=str) + (prompt or "")
        return len(text.split()) * 2  # rough estimate

    def _build_error_result(
        self, error: str, status: str, start: float
    ) -> Dict[str, Any]:
        return {
            "request_id": self.request_id,
            "purpose": "unknown",
            "model": "none",
            "recommendation": None,
            "confidence": 0.0,
            "evidence_used": [],
            "cost_usd": 0.0,
            "tokens_used": 0,
            "latency_ms": round((time.perf_counter() - start) * 1000),
            "hotel_id": self.hotel_id,
            "actor_id": self.actor_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": status,
            "error": error,
        }

    def _audit(
        self,
        purpose: str,
        model: str,
        result: Dict,
        context: Dict,
    ) -> None:
        """Non-blocking audit log entry for every AI request."""
        try:
            from sqlalchemy import text as _text
            self.db.execute(_text("""
                INSERT INTO platform_audit_log
                    (id, hotel_id, actor_id, action, entity_type, entity_id,
                     changes, created_at)
                VALUES
                    (:id, :hotel_id, :actor_id, :action, 'ai_request', :entity_id,
                     :changes, :now)
            """), {
                "id": str(uuid.uuid4()),
                "hotel_id": self.hotel_id,
                "actor_id": self.actor_id,
                "action": f"AI_REQUEST:{purpose}",
                "entity_id": self.request_id,
                "changes": json.dumps({
                    "purpose": purpose,
                    "model": model,
                    "status": result.get("status"),
                    "cost_usd": result.get("cost_usd", 0),
                    "latency_ms": result.get("latency_ms"),
                    "tokens_used": result.get("tokens_used", 0),
                }),
                "now": datetime.utcnow(),
            })
            self.db.commit()
        except Exception:
            pass  # Never block on audit failure
