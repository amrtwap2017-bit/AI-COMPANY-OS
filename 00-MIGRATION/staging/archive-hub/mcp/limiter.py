import time
import redis
from hub.foundation.settings import settings

r = redis.from_url(settings.redis_url, decode_responses=True)

def allow_call(actor_id: str, tool_name: str, limit_per_min: int) -> tuple[bool, int]:
    if limit_per_min <= 0:
        return True, 0

    window = int(time.time() // 60)
    key = f"rl:v1:{actor_id}:{tool_name}:{window}"
    n = r.incr(key)
    if n == 1:
        r.expire(key, 70)
    if n > limit_per_min:
        return False, int(n)
    return True, int(n)
