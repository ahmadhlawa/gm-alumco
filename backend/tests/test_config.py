import pytest
from pydantic import ValidationError

from app.core.config import Settings

# A secret strong enough to pass the JWT validator so these tests isolate the
# super-admin password validation behaviour.
STRONG_JWT_SECRET = "test-jwt-secret-key-with-enough-length-1234567890"


def make_settings(**overrides) -> Settings:
    base = {
        "jwt_secret_key": STRONG_JWT_SECRET,
        # Avoid reading any developer's local .env for these assertions.
        "_env_file": None,
    }
    base.update(overrides)
    return Settings(**base)


@pytest.mark.parametrize("environment", ["development", "dev", "local", "test", "testing"])
def test_development_environments_tolerate_default_password(environment):
    settings = make_settings(environment=environment, first_superadmin_password="ChangeMe123!")
    assert settings.first_superadmin_password == "ChangeMe123!"


@pytest.mark.parametrize("environment", ["production", "staging"])
def test_production_rejects_default_password(environment):
    with pytest.raises(ValidationError, match="FIRST_SUPERADMIN_PASSWORD"):
        make_settings(environment=environment, first_superadmin_password="ChangeMe123!")


@pytest.mark.parametrize("weak", ["password", "admin123", "superadmin", ""])
def test_production_rejects_placeholder_passwords(weak):
    with pytest.raises(ValidationError, match="FIRST_SUPERADMIN_PASSWORD"):
        make_settings(environment="production", first_superadmin_password=weak)


def test_production_rejects_short_password():
    with pytest.raises(ValidationError, match="too weak"):
        make_settings(environment="production", first_superadmin_password="Short1!")


def test_production_accepts_strong_password():
    settings = make_settings(
        environment="production",
        first_superadmin_password="Sxq9!correct-horse-battery",
    )
    assert settings.first_superadmin_password == "Sxq9!correct-horse-battery"


def test_password_validation_is_case_insensitive_for_default():
    with pytest.raises(ValidationError, match="FIRST_SUPERADMIN_PASSWORD"):
        make_settings(environment="production", first_superadmin_password="changeme123!")
