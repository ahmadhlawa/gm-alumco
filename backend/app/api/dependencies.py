from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.admin import Admin


bearer_scheme = HTTPBearer(auto_error=False)
VALID_ADMIN_ROLES = {"admin", "super_admin"}


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise error
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        admin_id = int(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError) as exc:
        raise error from exc
    admin = db.get(Admin, admin_id)
    if admin is None or not admin.is_active:
        raise error
    return admin


def require_admin(admin: Admin = Depends(get_current_admin)) -> Admin:
    if admin.role not in VALID_ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid role")
    return admin


def require_super_admin(admin: Admin = Depends(require_admin)) -> Admin:
    if admin.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required",
        )
    return admin
