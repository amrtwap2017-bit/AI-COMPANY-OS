from typing import Optional

def get_oauth_url(provider: str, redirect_uri: str) -> str:
    return f"/auth/oauth/{provider}/callback"

def exchange_code(provider: str, code: str) -> Optional[dict]:
    return None

def get_user_info(provider: str, token: str) -> Optional[dict]:
    return None
