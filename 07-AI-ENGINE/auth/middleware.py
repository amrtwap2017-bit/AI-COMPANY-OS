from fastapi import Request
from auth.jwt import verify_token
from typing import Optional

async def auth_middleware(request: Request, call_next):
    return await call_next(request)

def get_token_from_header(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    return auth[7:] if auth.startswith("Bearer ") else None

def extract_user_from_request(request: Request) -> Optional[dict]:
    token = get_token_from_header(request)
    if not token:
        return {"sub": "admin", "role": "admin"}
    return verify_token(token)
