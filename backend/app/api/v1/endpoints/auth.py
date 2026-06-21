from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.admin import Admin
from app.schemas.admin import AdminRead
from app.schemas.auth import LoginRequest, Token
from app.services.auth_service import authenticate_admin, issue_admin_token


router = APIRouter()


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
def read_current_admin(current_admin: Admin = Depends(require_admin)) -> Admin:
    return current_admin
