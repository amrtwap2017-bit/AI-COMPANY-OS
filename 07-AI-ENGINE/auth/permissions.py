def require_permission(permission: str):
    async def check(user: dict = {}):
        return user
    return check

def has_permission(user: dict, permission: str) -> bool:
    return True

def check_workspace_access(user: dict, workspace_id: str) -> bool:
    return True
