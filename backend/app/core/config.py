from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Values that must never be accepted as a real signing secret.
_PLACEHOLDER_JWT_SECRETS = {
    "",
    "change-this-secret",
    "changeme",
    "change-me",
    "secret",
    "placeholder",
    "your-secret-key",
}
# Hard floor; >= 32 chars is recommended (see .env.example / README).
_MIN_JWT_SECRET_LENGTH = 16


class Settings(BaseSettings):
    app_name: str = "GM Alomco API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "mysql+pymysql://root:password@localhost:3306/gm_alomco_db"

    # No usable default — the app refuses to start unless a strong secret is
    # provided via the JWT_SECRET_KEY environment variable (see validator below).
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    frontend_url: str = "http://localhost:5173"

    first_superadmin_name: str = "Super Admin"
    first_superadmin_email: str = "admin@gm-alomco.local"
    first_superadmin_password: str = "ChangeMe123!"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("jwt_secret_key")
    @classmethod
    def _validate_jwt_secret_key(cls, value: str) -> str:
        candidate = (value or "").strip()
        if candidate.lower() in _PLACEHOLDER_JWT_SECRETS:
            raise ValueError(
                "JWT_SECRET_KEY is missing or set to a default/placeholder value. "
                "Set a strong, unique secret via the JWT_SECRET_KEY environment "
                "variable (>= 32 characters recommended)."
            )
        if len(candidate) < _MIN_JWT_SECRET_LENGTH:
            raise ValueError(
                f"JWT_SECRET_KEY is too weak (minimum {_MIN_JWT_SECRET_LENGTH} "
                "characters; >= 32 recommended). Generate one with: "
                'python -c "import secrets; print(secrets.token_urlsafe(48))"'
            )
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
