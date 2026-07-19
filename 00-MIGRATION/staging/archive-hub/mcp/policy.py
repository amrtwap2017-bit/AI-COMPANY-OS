def is_allowed(tool_required_scopes: list[str], actor_scopes: list[str]) -> bool:
    req = set(tool_required_scopes or [])
    have = set(actor_scopes or [])
    return req.issubset(have)
