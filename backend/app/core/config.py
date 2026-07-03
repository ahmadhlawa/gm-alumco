from functools import lru_cache

from pydantic import AliasChoices, Field, SecretStr, ValidationInfo, field_validator
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

# Passwords that must never seed the first super admin outside development.
_PLACEHOLDER_SUPERADMIN_PASSWORDS = {
    "",
    "changeme123!",  # the value shipped as the development default
    "changeme",
    "change-me",
    "password",
    "password123",
    "admin",
    "admin123",
    "superadmin",
    "secret",
    "placeholder",
}
# Hard floor; >= 16 chars is recommended (see .env.example / README).
_MIN_SUPERADMIN_PASSWORD_LENGTH = 12
# Environments where the relaxed shipped default password is tolerated.
_RELAXED_ENVIRONMENTS = {"development", "dev", "local", "test", "testing"}


class Settings(BaseSettings):
    app_name: str = "T.A.S API"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "mysql+pymysql://root:password@localhost:3306/gm_alomco_db"

    # No usable default — the app refuses to start unless a strong secret is
    # provided via the JWT_SECRET_KEY environment variable (see validator below).
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    frontend_url: str = "http://localhost:5173"

    smtp_enabled: bool = True
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: SecretStr | None = None
    smtp_from_email: str | None = None
    smtp_from_name: str = "T.A.S"
    # QUOTE_NOTIFICATION_EMAIL is the canonical env var; the legacy
    # QUOTE_REQUEST_RECIPIENT_EMAIL name is still accepted.
    quote_notification_email: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "quote_notification_email",
            "quote_request_recipient_email",
        ),
    )

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

    @field_validator("first_superadmin_password")
    @classmethod
    def _validate_first_superadmin_password(cls, value: str, info: ValidationInfo) -> str:
        # `environment` is declared before this field, so it is already validated
        # and available in `info.data`. Outside development we refuse to seed the
        # first super admin with a default/placeholder/weak password.
        environment = str(info.data.get("environment", "development")).strip().lower()
        if environment in _RELAXED_ENVIRONMENTS:
            return value

        candidate = (value or "").strip()
        if candidate.lower() in _PLACEHOLDER_SUPERADMIN_PASSWORDS:
            raise ValueError(
                "FIRST_SUPERADMIN_PASSWORD is missing or set to a default/placeholder "
                f"value while ENVIRONMENT={environment!r}. Set a strong, unique password "
                "via the FIRST_SUPERADMIN_PASSWORD environment variable "
                "(>= 16 characters recommended)."
            )
        if len(candidate) < _MIN_SUPERADMIN_PASSWORD_LENGTH:
            raise ValueError(
                f"FIRST_SUPERADMIN_PASSWORD is too weak (minimum "
                f"{_MIN_SUPERADMIN_PASSWORD_LENGTH} characters; >= 16 recommended) "
                f"while ENVIRONMENT={environment!r}."
            )
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
