# Ofok Aluminum FastAPI Backend

Clean FastAPI and MySQL baseline for the Ofok Aluminum CMS. The frontend is not connected to this API yet, and the resource routers are placeholders for future CRUD work.

## Requirements

- Python 3.11 or newer
- MySQL 8 or newer
- A MySQL database named `ofok_db`

## 1. Create a virtual environment

From the `backend` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 3. Configure environment variables

Copy `.env.example` to `.env` and update the database credentials, JWT secret, frontend origin, and initial superadmin credentials.

```powershell
Copy-Item .env.example .env
```

Create the database if it does not already exist:

```sql
CREATE DATABASE ofok_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Multilingual database fields use JSON objects in this shape:

```json
{
  "ar": "temporary development text",
  "en": "English production text",
  "he": "Hebrew production text"
}
```

Arabic is temporary during development. The intended production languages are English and Hebrew.

## 4. Run migrations

```bash
alembic upgrade head
```

For future model changes, create and apply a migration:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## 5. Seed the first superadmin

The command is idempotent and will not create a duplicate admin with the configured email.

```bash
python -m app.utils.seed_admin
```

There is no public registration endpoint.

## 6. Run the API

```bash
uvicorn app.main:app --reload
```

Useful URLs:

- Health check: `GET http://localhost:8000/api/v1/health`
- API docs: `http://localhost:8000/api/v1/docs`
- Login: `POST http://localhost:8000/api/v1/auth/login`
- Current admin: `GET http://localhost:8000/api/v1/auth/me`

Login accepts JSON:

```json
{
  "email": "admin@ofok.local",
  "password": "ChangeMe123!"
}
```

Send the returned token to `/auth/me` as `Authorization: Bearer <token>`.
