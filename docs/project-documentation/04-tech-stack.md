# 04 — Final Tech Stack

Versions below are taken directly from `frontend/package.json` and `backend/requirements.txt`.

## Frontend

| Technology | Version | Role | Why it was chosen |
|------------|---------|------|-------------------|
| **React** | 19.0.1 | UI library | Mature component model; React 19 for the latest concurrent features and ecosystem alignment. |
| **TypeScript** | ~5.8.2 | Language | Type safety across the API DTO layer and view models; catches integration mistakes at compile time. |
| **Vite** | 6.2.3 | Build tool / dev server | Fast HMR dev server and an efficient production build; first-class React + Tailwind plugins. |
| **Tailwind CSS** | 4.1.14 | Styling | Utility-first styling with a tiny custom theme; the v4 `@theme` block defines the brand tokens in CSS. Enables consistent premium styling without a bespoke component CSS framework. |
| **React Router** | 7.17.0 | Routing | Nested routes for the public/admin split, route guards, and programmatic navigation. |
| **Motion** (`motion/react`) | 12.23.24 | Animation | Declarative, performant animations (hero reveal, layout transitions, carousels). Successor to Framer Motion. |
| **lucide-react** | 0.546.0 | Icons | Clean, consistent SVG icon set; direction-aware usage. |
| **clsx** + **tailwind-merge** | 2.1.1 / 3.6.0 | Class composition | `cn()` helper to compose/merge conditional Tailwind classes without conflicts. |
| **Vitest** | 4.1.9 | Testing | Vite-native unit/component test runner; shares the build config, fast. |

The app is a **Vite single-page application** (not Next.js). Path alias `@/` → `src/` is configured in both `vite.config.ts` and `tsconfig.json`.

## Backend

| Technology | Version | Role | Why it was chosen |
|------------|---------|------|-------------------|
| **FastAPI** | 0.137.2 | Web framework | Async-capable, type-driven, auto-generates OpenAPI docs; Pydantic integration makes request/response validation declarative. |
| **Uvicorn** | 0.49.0 | ASGI server | Production-grade ASGI server with `[standard]` extras. |
| **SQLAlchemy** | 2.0.51 | ORM | Modern 2.0 typed `Mapped[...]` models; explicit, well-understood query layer. |
| **Alembic** | 1.18.4 | Migrations | Versioned, reversible schema migrations alongside SQLAlchemy. |
| **PyMySQL** | 1.2.0 | DB driver | Pure-Python MySQL driver (`mysql+pymysql://…`), simple to deploy on a VPS. |
| **Pydantic Settings** | 2.14.2 | Config | Typed env-var configuration with validators (JWT secret strength, seed-password strength). |
| **python-jose[cryptography]** | 3.5.0 | JWT | Encode/decode HS256 access tokens. |
| **passlib[bcrypt]** + **bcrypt** | 1.7.4 / 4.0.1 | Password hashing | Industry-standard bcrypt hashing via passlib's `CryptContext`. |
| **python-multipart** | 0.0.32 | File uploads | Multipart form parsing for the image-upload endpoint. |
| **email-validator** | 2.3.0 | Validation | Backs Pydantic `EmailStr` for contact/quote/admin emails. |
| **python-dotenv** | 1.2.2 | Env loading | Loads `backend/.env`. |
| **pytest** + **httpx** | 9.1.1 / 0.28.1 | Testing | `pytest` test suite driving the API via `httpx`/`TestClient`. |

## Database

- **MySQL 8+** (`utf8mb4` / `utf8mb4_unicode_ci`) — chosen for ubiquity and cheap availability on shared/VPS hosting. The connection string lives in `backend/.env` (`DATABASE_URL=mysql+pymysql://…`).
- For tests, SQLAlchemy is pointed at an isolated database via the test fixtures (`backend/tests/conftest.py`), independent of the production MySQL.

> **Naming history.** The DB/user were renamed from `gm_alomco_db`/`gm_alomco_user` to `tas_db`/`tas_user`; some shipped defaults and the backend README still reference the older `gm_alomco_db` name. The authoritative value is whatever `DATABASE_URL` in `backend/.env` is set to. See [Database](08-database.md).

## Uploads

- **Local filesystem** under `backend/uploads/<folder>/`, served by FastAPI's `StaticFiles` at `/uploads/...`. Chosen over object storage (S3/CDN) to keep the deployment a single process on a modest VPS. The directory must be persistent and excluded from `rsync --delete` deploys (documented in `backend/README.md`).

## Animation

- **Motion for React** for all front-of-site motion: the staged hero, scroll-reveal sections (`whileInView`), animated route/grid transitions (`AnimatePresence`, `layout`), and the partners carousel (the carousel itself is hand-rolled with CSS transforms + pointer events for precise infinite-loop control).

## Routing

- **React Router 7** with a nested structure: a top-level split between `/admin/*` (guarded, inside `AdminLayout`) and the public `/*` tree (inside `Navbar`/`Footer`/`WhatsAppButton`). See [Frontend Architecture](06-frontend-architecture.md).

## Testing

- **Frontend**: Vitest (19 test files) covering the API client/adapters, i18n, utilities, forms, navigation, and key components.
- **Backend**: pytest (63 test functions across 13 files) covering auth, admins, audit, dashboard, uploads, email service, and every resource.

## Deployment (intended)

- A **Hostinger VPS/KVM**-style target: one FastAPI/Uvicorn process behind a reverse proxy, MySQL, a persistent `backend/uploads/` directory, and the built frontend (`vite build` → `dist/`) served as static assets. CORS is locked to the configured `FRONTEND_URL`. No containerization or CI/CD is committed in the repository today (see [Current Status](18-current-status.md)).
