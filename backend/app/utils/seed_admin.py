from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.admin import Admin


def seed_admin() -> None:
    email = str(settings.first_superadmin_email).lower()

    with SessionLocal() as db:
        existing_admin = db.scalar(select(Admin).where(Admin.email == email))
        if existing_admin is not None:
            print(f"Admin already exists: {email}")
            return

        admin = Admin(
            name=settings.first_superadmin_name,
            email=email,
            password_hash=get_password_hash(settings.first_superadmin_password),
            role="superadmin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Superadmin created: {email}")


if __name__ == "__main__":
    seed_admin()
