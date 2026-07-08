from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://tb_user:tb_pass@localhost:5434/triangle_black"
    secret_key: str = "change-this-in-production-must-be-32-chars-min"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    environment: str = "development"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:3000"]

settings = Settings()
