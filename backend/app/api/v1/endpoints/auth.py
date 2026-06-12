from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminRead
from app.schemas.auth import LoginRequest, Token
from app.services.auth_service import authenticate_admin, issue_admin_token


router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise credentials_error

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        subject = payload.get("sub")
        if subject is None:
            raise credentials_error
        admin_id = int(subject)
    except (JWTError, TypeError, ValueError) as exc:
        raise credentials_error from exc

    admin = db.get(Admin, admin_id)
    if admin is None or not admin.is_active:
        raise credentials_error
    return admin


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)) -> Token:
    admin = authenticate_admin(db, credentials.email, credentials.password)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(access_token=issue_admin_token(admin))


@router.get("/me", response_model=AdminRead)
def read_current_admin(current_admin: Admin = Depends(get_current_admin)) -> Admin:
    return current_admin
