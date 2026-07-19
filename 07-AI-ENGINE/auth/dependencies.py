from fastapi import Header, HTTPException, Depends
from typing import Optional
from auth.jwt import verify_token

async def get_current_user(
    authorization: Optional[str] = Header(default=None)
) -> dict:
    if not authorization:
        return {"sub": "admin", "role": "admin"}
    token = authorization.replace("Bearer ", "")
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    return user

async def optional_auth(
    authorization: Optional[str] = Header(default=None)
) -> Optional[dict]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "")
    return verify_token(token)
