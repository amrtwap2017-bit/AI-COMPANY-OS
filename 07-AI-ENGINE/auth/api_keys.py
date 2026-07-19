import secrets, hashlib

def generate_api_key(prefix: str = "acos") -> str:
    return f"{prefix}_{secrets.token_urlsafe(32)}"

def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()

def verify_api_key(key: str, key_hash: str) -> bool:
    return hashlib.sha256(key.encode()).hexdigest() == key_hash

def extract_prefix(key: str) -> str:
    return key.split("_", 1)[0] if "_" in key else "unknown"

def get_api_key_from_db(db, key_hash: str):
    return None

def list_api_keys(db, user_id: int):
    return []
