# T.A.S Workspace

This repository is a frontend/backend workspace for the T.A.S corporate website and its admin CMS.

```text
project-root/
  frontend/   Vite + React 19 + TypeScript SPA (public site + admin CMS)
  backend/    FastAPI + SQLAlchemy + Alembic backend on MySQL
  docs/       Full project documentation
```

## Documentation

See [README_PROJECT.md](README_PROJECT.md) for the complete technical reference, quick-start commands, and the documentation index under `docs/project-documentation/`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

See [frontend/README.md](frontend/README.md) for routes, architecture, and frontend details.

## Backend

```bash
cd backend
python -m venv .venv && .\.venv\Scripts\Activate.ps1   # or source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.utils.seed_admin
uvicorn app.main:app --reload
```

See [backend/README.md](backend/README.md) for database setup and environment configuration.
