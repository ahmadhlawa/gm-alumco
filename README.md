# Ofok Aluminum Workspace

This repository is organized as a frontend/backend workspace for the Ofok Aluminum corporate website and Visual CMS.

```text
project-root/
  frontend/   Existing Vite + React frontend
  backend/    NestJS + PostgreSQL + Prisma backend foundation
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

The `backend/` directory contains the NestJS + PostgreSQL + Prisma foundation, including validated environment configuration, security middleware, the initial database schema, an admin seed, and cookie-based JWT authentication.

Run backend setup commands from its directory:

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

See [backend/README.md](backend/README.md) for local database setup and [backend/BACKEND_ROADMAP.md](backend/BACKEND_ROADMAP.md) for the remaining implementation plan.
