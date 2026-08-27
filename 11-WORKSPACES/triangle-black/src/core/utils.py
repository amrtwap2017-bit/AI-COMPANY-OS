"""Triangle Black Core Utilities"""


def _clamp_limit(limit: int, default: int = 20, max_val: int = 10000) -> int:
    """Clamp limit parameter to valid range to prevent 500 errors."""
    if limit is None:
        return default
    return max(1, min(limit, max_val))

