import json
import time
import hashlib
from typing import Any

import redis
from hub.foundation.settings import settings

r = redis.from_url(settings.redis_url, decode_responses=True)

def _hash(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]

def make_cache_key(intent: str, user_request: str, repo_key: str | None, graph_seed_node_id: str | None) -> str:
    return "contextpack:v1:" + ":".join([
        intent or "general",
        repo_key or "none",
        graph_seed_node_id or "none",
        _hash(user_request or ""),
    ])

def get_cached_pack(key: str) -> dict[str, Any] | None:
    raw = r.get(key)
    if not raw:
        return None
    return json.loads(raw)

def set_cached_pack(key: str, pack: dict[str, Any], ttl_s: int = 900) -> None:
    payload = json.dumps(pack, ensure_ascii=False)
    r.setex(key, ttl_s, payload)

def now_s() -> float:
    return time.time()
