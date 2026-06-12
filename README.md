# Ofok Aluminum Workspace

This repository is organized as a frontend/backend workspace for the Ofok Aluminum corporate website and Visual CMS.

```text
project-root/
  frontend/   Existing Vite + React frontend
  backend/    Reserved for the future NestJS backend
  README.md
  .gitignore
```

## Frontend

The complete working frontend is located in `frontend/`. Its UI, routing, theme, animations, and Visual CMS baseline were preserved during the move.

Run it locally from the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

See [frontend/README.md](frontend/README.md) for routes, architecture, limitations, and frontend details.

## Backend

The `backend/` directory is reserved for the future NestJS + PostgreSQL + Prisma application. The backend has not been initialized.

See [backend/BACKEND_ROADMAP.md](backend/BACKEND_ROADMAP.md) for the proposed implementation plan.
