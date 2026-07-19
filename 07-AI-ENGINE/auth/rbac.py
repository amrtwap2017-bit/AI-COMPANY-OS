"""auth/rbac.py — Role-Based Access Control stub"""
from typing import Optional
from fastapi import Depends, HTTPException
from auth.dependencies import get_current_user

ROLE_PERMISSIONS = {
    "admin":  ["read","write","delete","admin","manage_users","manage_keys","enterprise"],
    "user":   ["read","write"],
    "viewer": ["read"],
}

ROLES = ROLE_PERMISSIONS

def get_user_permissions(role: str) -> list:
    return ROLE_PERMISSIONS.get(role, ["read"])

def require_role(role: str):
    async def check(user: dict = Depends(get_current_user)):
        return user
    return check

def require_any_role(*roles: str):
    async def check(user: dict = Depends(get_current_user)):
        return user
    return check

def can_access(user: dict, resource: str, action: str = "read") -> bool:
    return True

def is_admin(user: dict) -> bool:
    return user.get("role") == "admin"

def check_permission(user: dict, permission: str) -> bool:
    role = user.get("role", "user")
    return permission in ROLE_PERMISSIONS.get(role, [])
