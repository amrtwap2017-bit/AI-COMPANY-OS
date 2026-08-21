"""Triangle Black Core Configuration"""
import os
import warnings
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database — must be set via environment variable
    DATABASE_URL: str = ""

    # Authentication — must be set via TB_SECRET_KEY env var
    JWT_SECRET: str = "dev-only-change-in-production"

    # Email
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True


settings = Settings()

# Production safety checks
if os.environ.get("ENVIRONMENT") == "production":
    if settings.JWT_SECRET == "dev-only-change-in-production":
        raise RuntimeError(
            "CRITICAL: JWT_SECRET must be overridden in production. "
            "Set TB_SECRET_KEY environment variable. "
            "Generate: python3 -c \"import secrets; print(secrets.token_hex(64))\""
        )
    if not settings.DATABASE_URL:
        raise RuntimeError(
            "CRITICAL: DATABASE_URL must be set in production."
        )

# Development warnings
if os.environ.get("ENVIRONMENT") != "production":
    if not os.environ.get("TB_SECRET_KEY"):
        warnings.warn(
            "[security] TB_SECRET_KEY not set — tokens will be invalidated on restart. "
            "Set TB_SECRET_KEY in .env for persistent sessions.",
            stacklevel=1
        )
