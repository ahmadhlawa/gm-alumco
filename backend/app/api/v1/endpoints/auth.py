from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.api.dependencies import bearer_scheme, require_admin
from app.core.rate_limit import login_rate_limiter
from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.admin import Admin
from app.models.revoked_token import RevokedToken
from app.schemas.admin import AdminRead
from app.schemas.auth import LoginRequest, Token
from app.services.audit_service import record_audit
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
    record_audit(db, admin_id=admin.id, action="login")
    return Token(access_token=issue_admin_token(admin))


@router.get("/me", response_model=AdminRead)
def read_current_admin(current_admin: Admin = Depends(require_admin)) -> Admin:
    return current_admin


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    current_admin: Admin = Depends(require_admin),
    db: Session = Depends(get_db),
) -> Response:
    if credentials is not None:
        payload = decode_access_token(credentials.credentials)
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        expires_at = datetime.fromtimestamp(
            float(payload["exp"]), timezone.utc
        ).replace(tzinfo=None)
        db.execute(delete(RevokedToken).where(RevokedToken.expires_at <= now))
        db.merge(
            RevokedToken(
                jti=str(payload["jti"]),
                admin_id=current_admin.id,
                expires_at=expires_at,
            )
        )
        db.commit()
    record_audit(db, admin_id=current_admin.id, action="logout")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
