from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.core.rate_limit import login_rate_limiter
from app.db.database import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminRead
from app.schemas.auth import LoginRequest, Token
from app.services.auth_service import authenticate_admin, issue_admin_token


router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    credentials: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> Token:
    client_key = request.client.host if request.client else "unknown"

    retry_after = login_rate_limiter.retry_after(client_key)
    if retry_after is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    admin = authenticate_admin(db, credentials.email, credentials.password)
    if admin is None:
        login_rate_limiter.register_failure(client_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    login_rate_limiter.reset(client_key)
    return Token(access_token=issue_admin_token(admin))


@router.get("/me", response_model=AdminRead)
def read_current_admin(current_admin: Admin = Depends(require_admin)) -> Admin:
    return current_admin
