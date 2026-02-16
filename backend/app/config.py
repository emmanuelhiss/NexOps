from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = "postgresql+asyncpg://nexops:nexops@localhost:5432/nexops"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"

    # Proxmox
    proxmox_host: str = "192.168.4.93"
    proxmox_port: int = 8006
    proxmox_user: str = "nexops@pve"
    proxmox_token_name: str = "nexops"
    proxmox_token_value: str  # Required — must be set in .env
    proxmox_verify_ssl: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # General
    environment: str = "development"
    log_level: str = "INFO"


settings = Settings()
