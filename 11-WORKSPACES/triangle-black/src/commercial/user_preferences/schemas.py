"""user_preferences/schemas.py — Sprint-082"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class UserPreferenceSet(BaseModel):
    pref_key: str
    pref_value: Any

class UserPreferencesResponse(BaseModel):
    user_id: str
    preferences: Dict[str, Any]
