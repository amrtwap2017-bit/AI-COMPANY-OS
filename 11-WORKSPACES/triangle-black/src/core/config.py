"""Triangle Black Core Configuration"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    model_config = {"extra": "ignore"}
    DATABASE_URL: str = "postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
    JWT_SECRET: str = "dev-only-change-in-production"
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"

settings = Settings()

if os.environ.get("ENVIRONMENT") == "production":
    if settings.JWT_SECRET == "dev-only-change-in-production":
        raise RuntimeError(
            "CRITICAL: JWT_SECRET must be overridden in production. "
            "Run: python -c \"import secrets; print(secrets.token_hex(64))\" "
            "to generate a secure key."
        )
