"""
app/core/config.py
────────────────────────────────────────────────────────────────
Application configuration loaded from environment variables.

Priority order:
  1. Environment variables (highest)
  2. .env file in api/ directory
  3. Defaults defined here (lowest)

Production deployment:
  Set ENV=production and all sensitive values as env vars.
  Never commit .env with real credentials.

Development:
  Copy .env.example to .env and fill in values.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ── Application ───────────────────────────────────────────
    APP_NAME:    str  = "AI Company OS"
    APP_VERSION: str  = "0.1.0"
    ENV:         str  = "development"   # development | staging | production
    DEBUG:       bool = True

    # ── PostgreSQL ────────────────────────────────────────────
    POSTGRES_HOST:     str = "localhost"
    POSTGRES_PORT:     int = 5432
    POSTGRES_DB:       str = "ai"
    POSTGRES_USER:     str = "ai"
    POSTGRES_PASSWORD: str = "ai123"

    # ── Connection Pool ───────────────────────────────────────
    DB_POOL_SIZE:     int = 10
    DB_MAX_OVERFLOW:  int = 20
    DB_POOL_TIMEOUT:  int = 30
    DB_POOL_RECYCLE:  int = 1800   # recycle connections every 30min

    # ── Qdrant ────────────────────────────────────────────────
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    # ── Ollama ────────────────────────────────────────────────
    OLLAMA_HOST: str = "http://localhost:11434"

    # ── JWT Auth ──────────────────────────────────────────────
    SECRET_KEY:                   str = "ai-company-os-super-secret-key-change-in-production"
    ALGORITHM:                    str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:  int = 60
    REFRESH_TOKEN_EXPIRE_DAYS:    int = 7

    # ── Rate Limiting ─────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    # ── CORS ──────────────────────────────────────────────────
    # Comma-separated list of allowed origins.
    # Use "*" for development only. Set explicit domains in production.
    CORS_ORIGINS: str = "*"

    # ── Logging ───────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"   # DEBUG | INFO | WARNING | ERROR

    # ── Computed Properties ───────────────────────────────────

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}"
            f"/{self.POSTGRES_DB}"
        )

    @property
    def QDRANT_URL(self) -> str:
        return f"http://{self.QDRANT_HOST}:{self.QDRANT_PORT}"

    @property
    def cors_origins_list(self) -> list[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"

    @property
    def is_development(self) -> bool:
        return self.ENV == "development"

    # ── Pydantic Settings ─────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
