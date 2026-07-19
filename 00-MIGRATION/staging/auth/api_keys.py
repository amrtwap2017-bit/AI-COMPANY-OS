"""
API Key Management
─────────────────────────────────────────────────────
Generate, hash and validate API keys.
Format: acos_<random32chars>
"""

import secrets
import hashlib


def generate_api_key() -> tuple[str, str, str]:
    """
    Generate a new API key.
    Returns: (full_key, key_hash, key_prefix)
    """
    random_part = secrets.token_urlsafe(32)
    full_key = f"acos_{random_part}"
    key_hash = _hash_key(full_key)
    key_prefix = full_key[:8]
    return full_key, key_hash, key_prefix


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def verify_api_key(plain_key: str, stored_hash: str) -> bool:
    return _hash_key(plain_key) == stored_hash


def hash_api_key(key: str) -> str:
    return _hash_key(key)
