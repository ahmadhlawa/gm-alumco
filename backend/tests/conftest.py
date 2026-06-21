import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.database import get_db
from app.main import app
from app.models import Admin  # noqa: F401 - imports all model metadata


@pytest.fixture
def db() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture
def client(db: Session) -> TestClient:
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def make_admin(db: Session):
    def factory(
        *,
        email: str = "admin@example.com",
        password: str = "StrongPass123!",
        role: str = "admin",
        is_active: bool = True,
    ) -> Admin:
        admin = Admin(
            full_name="Test Admin",
            email=email,
            password_hash=get_password_hash(password),
            role=role,
            is_active=is_active,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    return factory


@pytest.fixture
def auth_headers(client: TestClient, make_admin):
    def factory(*, role: str = "admin", email: str | None = None) -> dict[str, str]:
        resolved_email = email or f"{role}@example.com"
        make_admin(email=resolved_email, role=role)
        response = client.post(
            "/api/v1/auth/login",
            json={"email": resolved_email, "password": "StrongPass123!"},
        )
        assert response.status_code == 200
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    return factory
