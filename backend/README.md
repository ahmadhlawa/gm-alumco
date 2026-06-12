# Ofok Aluminum Backend

NestJS foundation for the Ofok Aluminum website and Visual CMS. This baseline provides PostgreSQL/Prisma models and admin authentication only. CMS CRUD, uploads, deployment, and frontend integration are intentionally not implemented yet.

## Stack

- NestJS and TypeScript
- PostgreSQL and Prisma
- JWT authentication with HTTP-only cookies
- Passport and bcrypt
- `class-validator` and `class-transformer`
- Helmet, CORS, and cookie-parser

## Structure

```text
src/
  admins/   Admin lookup service
  auth/     Login, current-admin, logout, JWT guard and strategy
  common/   Shared decorators and future cross-cutting utilities
  config/   Environment validation
  prisma/   Prisma module and lifecycle-managed client
prisma/
  schema.prisma
  seed.ts
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and replace the development secrets.

3. Start PostgreSQL and create the database configured by `DATABASE_URL`.

4. Generate the Prisma client and create the first migration:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Seed the initial administrator:

```bash
npm run prisma:seed
```

6. Run the API in watch mode:

```bash
npm run start:dev
```

The default API address is `http://localhost:4000`.

## Authentication Endpoints

- `POST /auth/login` accepts `{ "email": "...", "password": "..." }` and sets the JWT cookie.
- `GET /auth/me` returns the authenticated administrator.
- `POST /auth/logout` clears the JWT cookie.

Set `credentials: "include"` when the frontend later calls these endpoints.

## Environment

See `.env.example`. Required values are `DATABASE_URL` and `JWT_SECRET`. The seed also requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Use a long random `JWT_SECRET` and a unique administrator password outside local development. `FRONTEND_URL` accepts a comma-separated list of allowed CORS origins.

## Current Scope

- No public registration
- No refresh-token flow
- No CMS CRUD controllers
- No image uploads
- No frontend connection
- No production deployment configuration
