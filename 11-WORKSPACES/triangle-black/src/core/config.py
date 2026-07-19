"""Triangle Black Core Configuration"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    model_config = {'extra': 'ignore'}
    DATABASE_URL: str = "postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
    JWT_SECRET: str = "super-secret-jwt-key-change-in-prod"
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
