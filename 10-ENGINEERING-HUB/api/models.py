"""
Model Router API
================
REST endpoints for the Model Router subsystem.

The Model Router is the ONLY component that selects AI models.
Agents never choose models directly. They call this router.

Routing logic (Wave 1 — rule-based):
  1. Check workspace_models table for overrides
  2. Apply task_type + complexity + local_only matrix
  3. Return ModelRoute with full connection details

Wave 2 upgrade: dynamic routing based on model health checks
and real-time token cost optimization.
"""

from __future__ import annotations

import os
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from ...01_INFRASTRUCTURE.database.session import get_db_session
from ...00_FOUNDATION.schemas import ModelRouteRequest, ModelRouteResponse

router = APIRouter()

# ─── Default Routing Matrix ───────────────────────────────────────────────────
# task_type → (model_id, provider, endpoint, context_window, cost_per_1k)

_DEFAULT_ROUTES = {
    "architecture": (
        "claude-3-5-sonnet-20241022",
        "anthropic",
        "https://api.anthropic.com/v1",
        200000,
        0.003,
    ),
    "coding": (
        "gpt-4o",
        "openai",
        "https://api.openai.com/v1",
        128000,
        0.005,
    ),
    "research": (
        "gemini-2.0-flash",
        "google",
        "https://generativelanguage.googleapis.com/v1beta",
        1000000,
        0.00015,
    ),
    "reasoning": (
        "o3-mini",
        "openai",
        "https://api.openai.com/v1",
        128000,
        0.011,
    ),
    "fast_review": (
        "claude-3-5-haiku-20241022",
        "anthropic",
        "https://api.anthropic.com/v1",
        200000,
        0.0008,
    ),
    "embedding": (
        "nomic-embed-text",
        "ollama",
        "http://localhost:11434",
        8192,
        0.0,
    ),
    "planning": (
        "o3-mini",
        "openai",
        "https://api.openai.com/v1",
        128000,
        0.011,
    ),
    "security_scan": (
        "claude-3-5-haiku-20241022",
        "anthropic",
        "https://api.anthropic.com/v1",
        200000,
        0.0008,
    ),
    "documentation": (
        "gpt-4o-mini",
        "openai",
        "https://api.openai.com/v1",
        128000,
        0.00015,
    ),
    "testing": (
        "gpt-4o",
        "openai",
        "https://api.openai.com/v1",
        128000,
        0.005,
    ),
}

# ─── Local-only routing (when local_only=True or no API keys) ─────────────────

_LOCAL_ROUTES = {
    "coding":        ("qwen2.5-coder:7b",    "ollama", "http://localhost:11434", 32768, 0.0),
    "architecture":  ("qwen2.5-coder:14b",   "ollama", "http://localhost:11434", 32768, 0.0),
    "fast_review":   ("qwen2.5-coder:7b",    "ollama", "http://localhost:11434", 32768, 0.0),
    "embedding":     ("nomic-embed-text",    "ollama", "http://localhost:11434", 8192,  0.0),
    "planning":      ("qwen2.5-coder:14b",   "ollama", "http://localhost:11434", 32768, 0.0),
    "research":      ("qwen2.5-coder:7b",    "ollama", "http://localhost:11434", 32768, 0.0),
    "reasoning":     ("qwen2.5-coder:14b",   "ollama", "http://localhost:11434", 32768, 0.0),
    "documentation": ("qwen2.5-coder:7b",    "ollama", "http://localhost:11434", 32768, 0.0),
    "testing":       ("qwen2.5-coder:7b",    "ollama", "http://localhost:11434", 32768, 0.0),
    "security_scan": ("qwen2.5-coder:7b",    "ollama", "http://localhost:11434", 32768, 0.0),
}

_FALLBACK = ("gpt-4o-mini", "openai", "https://api.openai.com/v1", 128000, 0.00015)


async def _check_ollama_available() -> bool:
    """Check if Ollama is responding."""
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
            r = await client.get(f"{ollama_url}/api/version")
            return r.status_code == 200
    except Exception:
        return False


def _has_api_key(provider: str) -> bool:
    """Check if API key is configured for a provider."""
    key_map = {
        "openai": "OPENAI_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "google": "GOOGLE_API_KEY",
    }
    env_key = key_map.get(provider, "")
    return bool(os.environ.get(env_key, "").strip())


@router.post("/route")
async def route_model(
    body: ModelRouteRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Determine the optimal AI model for a task.

    Routing precedence:
    1. Workspace-level override (workspace_models table)
    2. local_only flag → always use Ollama
    3. No API key for default provider → fallback to Ollama
    4. Default routing matrix by task_type + complexity
    5. Fallback model if all else fails

    Returns full connection details for the selected model.
    """
    task_type = body.task_type.lower()

    # Step 1: Check workspace override
    try:
        result = await db.execute(
            text(
                "SELECT model_id, provider FROM workspace_models "
                "WHERE workspace_id = :wid AND task_type = :tt "
                "LIMIT 1"
            ),
            {"wid": str(body.workspace_id), "tt": task_type},
        )
        override = result.fetchone()
        if override:
            model_id, provider = override
            route_map = _DEFAULT_ROUTES.get(task_type, _FALLBACK)
            return ModelRouteResponse(
                model_id=model_id,
                provider=provider,
                endpoint=route_map[2] if len(route_map) > 2 else _FALLBACK[2],
                context_window=route_map[3] if len(route_map) > 3 else 128000,
                estimated_cost_per_1k_tokens=route_map[4] if len(route_map) > 4 else 0.0,
                is_local=(provider == "ollama"),
                fallback_model_id=None,
            )
    except Exception:
        pass

    # Step 2: local_only → always use Ollama
    if body.local_only:
        local = _LOCAL_ROUTES.get(task_type, _LOCAL_ROUTES.get("coding"))
        ollama_ok = await _check_ollama_available()
        return ModelRouteResponse(
            model_id=local[0],
            provider=local[1],
            endpoint=local[2],
            context_window=local[3],
            estimated_cost_per_1k_tokens=local[4],
            is_local=True,
            fallback_model_id="qwen2.5-coder:7b" if ollama_ok else None,
        )

    # Step 3: Default routing matrix
    route = _DEFAULT_ROUTES.get(task_type)
    if route:
        model_id, provider, endpoint, ctx_window, cost = route

        # Check if API key exists for this provider
        if not _has_api_key(provider):
            # Fallback to local
            ollama_ok = await _check_ollama_available()
            if ollama_ok:
                local = _LOCAL_ROUTES.get(task_type, _LOCAL_ROUTES.get("coding"))
                return ModelRouteResponse(
                    model_id=local[0],
                    provider=local[1],
                    endpoint=local[2],
                    context_window=local[3],
                    estimated_cost_per_1k_tokens=0.0,
                    is_local=True,
                    fallback_model_id=None,
                )

        return ModelRouteResponse(
            model_id=model_id,
            provider=provider,
            endpoint=endpoint,
            context_window=ctx_window,
            estimated_cost_per_1k_tokens=cost,
            is_local=False,
            fallback_model_id="gpt-4o-mini",
        )

    # Step 4: Fallback
    return ModelRouteResponse(
        model_id=_FALLBACK[0],
        provider=_FALLBACK[1],
        endpoint=_FALLBACK[2],
        context_window=_FALLBACK[3],
        estimated_cost_per_1k_tokens=_FALLBACK[4],
        is_local=False,
        fallback_model_id=None,
    )


@router.get("/available")
async def list_available_models():
    """List all models in the routing table with their providers."""
    ollama_ok = await _check_ollama_available()

    models = []
    for task_type, route in _DEFAULT_ROUTES.items():
        model_id, provider, endpoint, ctx, cost = route
        has_key = _has_api_key(provider) if provider != "ollama" else ollama_ok
        models.append({
            "task_type": task_type,
            "model_id": model_id,
            "provider": provider,
            "available": has_key,
            "context_window": ctx,
            "cost_per_1k": cost,
            "is_local": provider == "ollama",
        })

    local_models = []
    if ollama_ok:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
                r = await client.get(f"{ollama_url}/api/tags")
                if r.status_code == 200:
                    data = r.json()
                    local_models = [
                        {
                            "name": m["name"],
                            "size_gb": round(m.get("size", 0) / (1024**3), 1),
                        }
                        for m in data.get("models", [])
                    ]
        except Exception:
            pass

    return {
        "routing_table": models,
        "ollama_available": ollama_ok,
        "local_models_installed": local_models,
    }


@router.post("/usage")
async def record_model_usage(
    run_group: UUID,
    workspace_id: UUID,
    model_id: str,
    provider: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
    task_type: str = "",
    db: AsyncSession = Depends(get_db_session),
):
    """Record token usage for cost tracking."""
    await db.execute(
        text(
            "INSERT INTO model_usage_log "
            "(workspace_id, run_group, model_id, provider, task_type, "
            "input_tokens, output_tokens, cost_usd) "
            "VALUES (:wid, :rg, :mid, :prov, :tt, :it, :ot, :cost)"
        ),
        {
            "wid": str(workspace_id),
            "rg": str(run_group),
            "mid": model_id,
            "prov": provider,
            "tt": task_type,
            "it": input_tokens,
            "ot": output_tokens,
            "cost": cost_usd,
        },
    )
    return {"recorded": True, "run_group": run_group}
