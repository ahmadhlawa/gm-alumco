from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Ofok Aluminum API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "mysql+pymysql://root:password@localhost:3306/ofok_db"

    jwt_secret_key: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    frontend_url: str = "http://localhost:5173"

    first_superadmin_name: str = "Super Admin"
    first_superadmin_email: str = "admin@ofok.local"
    first_superadmin_password: str = "ChangeMe123!"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
