# GM Alomco FastAPI Backend

FastAPI + MySQL backend for the GM Alomco website. Provides a REST API for the admin CMS and public-facing content endpoints.

## Requirements

- Python 3.11 or newer
- MySQL 8 or newer
- A MySQL database named `gm_alomco_db`

## 1. Create a virtual environment

From the `backend/` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On macOS / Linux:

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

The `.env` file is already present. Open it and verify the database URL, JWT secret, and frontend origin are correct.

Create the MySQL database if it does not already exist:

```sql
CREATE DATABASE gm_alomco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Multilingual fields are stored as plain columns with `_ar`, `_en`, and `_he` suffixes. Arabic is used during development; English and Hebrew are the production languages.

## 4. Apply migrations

```bash
alembic upgrade head
```

To generate a new migration after changing a model:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## 5. Seed the first super admin (optional)

The script is idempotent — it will not create a duplicate if the email already exists.

```bash
python -m app.utils.seed_admin
```

Credentials come from `.env` (`FIRST_SUPERADMIN_*` variables). There is no public registration endpoint.

> **Production/staging:** `FIRST_SUPERADMIN_PASSWORD` must be a strong, unique value.
> When `ENVIRONMENT` is not one of `development`/`dev`/`local`/`test`/`testing`, the app
> refuses to start if the password is missing, a known placeholder (e.g. `ChangeMe123!`),
> or shorter than 12 characters (>= 16 recommended). In development a relaxed default is tolerated.

## 6. Run the development server

```bash
uvicorn app.main:app --reload
```

### Useful URLs

| Purpose | URL |
|---|---|
| Health check | `GET http://localhost:8000/api/v1/health` |
| Interactive docs | `http://localhost:8000/api/v1/docs` |
| Login | `POST http://localhost:8000/api/v1/auth/login` |
| Current admin | `GET http://localhost:8000/api/v1/auth/me` |

### Login payload

```json
{
  "email": "admin@gm-alomco.local",
  "password": "ChangeMe123!"
}
```

Send the returned token as `Authorization: Bearer <token>` on protected endpoints.

## Local uploads on Hostinger VPS/KVM

Uploaded images are stored only under `backend/uploads/` and served by FastAPI from `/uploads/...`; they are not copied into the frontend build or stored in MySQL.

On the Hostinger VPS, `backend/uploads` must be persistent and writable by the account running FastAPI. Create the folders during initial provisioning:

```bash
mkdir -p backend/uploads/{projects,services,partners,gallery}
chown -R <app-user>:<app-group> backend/uploads
chmod -R u+rwX backend/uploads
```

Deployment and restart scripts must preserve this directory. Do not replace, clean, or include `backend/uploads` in an `rsync --delete` target; deploy application code around it or mount/link a persistent directory at this path.

## Admin roles

| Role | Permissions |
|---|---|
| `super_admin` | Full access; can create, deactivate, and delete admin accounts |
| `admin` | Can manage website content; cannot manage other admin accounts |
