# 07 — Backend Architecture

The backend is a **FastAPI** application (`backend/app/`) using **SQLAlchemy 2.0** over **MySQL**, with **Alembic** migrations and **JWT** authentication. It exposes a versioned REST API under `/api/v1` and serves uploaded images statically.

## Application entry point

`app/main.py` is intentionally tiny:

```python
app = FastAPI(title=settings.app_name,
              docs_url=f"{settings.api_prefix}/docs",
              openapi_url=f"{settings.api_prefix}/openapi.json")

app.add_middleware(CORSMiddleware,
    allow_origins=[settings.frontend_url],   # locked to the configured frontend origin
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")
app.include_router(api_router, prefix=settings.api_prefix)
```

So the app: configures CORS to exactly one origin, ensures the uploads directory exists and serves it at `/uploads`, and mounts the v1 router at `/api/v1`.

## Layered design

```
HTTP request
   │
   ▼
endpoints/*.py         ← HTTP shape, auth dependency, audit-log call
   │
   ▼
services/*.py          ← business rules, queries, conflict handling
   │
   ▼
models/*.py (ORM)      ← SQLAlchemy tables
   ▲
   │
schemas/*.py           ← Pydantic validation + serialization at the boundary
```

This separation keeps endpoints declarative (they read like a table of routes), pushes all real logic into services, and keeps the ORM models free of request concerns.

## Routers

`app/api/v1/router.py` registers a `/health` check and every resource router with a clear public/admin split via path prefixes and OpenAPI tags. Most resources expose **two routers**:

- a **public_router** mounted at e.g. `/projects` (unauthenticated reads, or public POST for contact/quote);
- an **admin_router** mounted at e.g. `/admin/projects` (JWT-protected writes/reads).

Projects additionally has an **admin_image_router** at `/admin/project-images`. Uploads, dashboard, admins, and audit-logs are admin-only. See [REST API](09-rest-api.md) for the full endpoint catalogue.

## Authentication & authorization

- **`app/core/security.py`** — `get_password_hash`/`verify_password` (bcrypt via passlib) and `create_access_token` (HS256, `sub` = admin id, `exp` from `ACCESS_TOKEN_EXPIRE_MINUTES`).
- **`app/api/dependencies.py`** — the dependency chain:
  - `get_current_admin` decodes the bearer token, loads the `Admin`, and rejects missing/invalid tokens or inactive admins (401);
  - `require_admin` additionally checks the role is one of `{admin, super_admin}` (403 otherwise);
  - `require_super_admin` requires exactly `super_admin` (403 otherwise).
- **`app/services/auth_service.py`** — `authenticate_admin` (case-insensitive email lookup, active check, password verify, `last_login_at` update) and `issue_admin_token`.
- **`app/core/rate_limit.py`** — an in-process sliding-window limiter (5 failed logins / IP / 5 min) applied in the login endpoint, returning `429` with `Retry-After`. Its single-process limitation is documented in the source (use a shared store behind multiple workers).

## Services (business logic)

- **`crud.py`** — generic helpers shared by the catalogue resources: `list_entities` (optional `active_only`, filters, ordered by `sort_order` then `id`), `get_entity_or_404`, `create_entity`, `update_entity` (uses `exclude_unset` so PATCH/PUT only touch provided fields), and `soft_delete_entity` (sets `is_active = False`).
- **`admin_service.py`** — admin CRUD with **self-protection rules**: a super-admin cannot deactivate or demote themselves, and email-uniqueness conflicts are mapped to `409`.
- **`project_service.py`** — eager-loads project images (`selectinload`), adds/deletes gallery images.
- **`inbox_service.py`** — list (newest first), get-or-404, status update, and hard delete for contact/quote records.
- **`site_content_service.py`** — create/update with unique-constraint conflict handling (`409`) for `site_content` (section+key) and `site_settings` (key), plus list helpers and hard delete.
- **`audit_service.py`** — `record_audit(...)`: best-effort, isolated from the caller's success. The mutation is already committed before audit is written, and any audit failure is swallowed (rolled back) so it can never break the action it records.
- **`email_service.py`** — SMTP quote-request notifications (STARTTLS), with graceful degradation: missing SMTP config logs a warning (dev) or error (prod) and skips sending; saving the quote always succeeds.

## Schemas & validation

Pydantic models in `app/schemas/` define the boundary:

- **`common.py`** — `ORMModel` (`from_attributes=True`), and two URL validators: `HttpUrlString` (must be http/https) and `ImageUrlString` (accepts either a valid http(s) URL **or** a safe relative `/uploads/...` path, rejecting traversal/backslashes). This is what lets a project store either an external image URL or a locally uploaded one.
- Resource schemas use `Literal` enums for constrained fields (project `category`, message/quote `status`, admin `role`), `EmailStr` for emails, and `Field(min_length=…, max_length=…)` constraints. Create vs. Update vs. Read are distinct models; Update models make every field optional for partial updates.

## Models

SQLAlchemy 2.0 typed models (`Mapped[...]` / `mapped_column`). Catalogue entities share the `is_active` + `sort_order` + `created_at`/`updated_at` shape and the `*_ar/_en/_he` localized columns. `Project` has a cascade `images` relationship; `AuditLog` has a nullable `admin` relationship (`ondelete="SET NULL"`) plus `actor_name`/`actor_email` convenience properties. Full column-by-column detail is in [Database](08-database.md).

## Dependencies (DI)

FastAPI's dependency injection wires three things into endpoints: `get_db` (a scoped `Session` from `SessionLocal`, closed per-request), the auth dependencies (`require_admin`/`require_super_admin`), and request context (`Request` for client IP in rate-limiting). This keeps endpoints free of session/auth boilerplate.

## Image uploads

`endpoints/uploads.py` (`POST /admin/uploads/image`, `require_admin`):

1. Validates the file **extension** against an allow-list and that the declared **content-type** matches it.
2. Reads at most `MAX_IMAGE_SIZE + 1` bytes and rejects anything over **5 MB** (`413`).
3. Verifies the **magic-byte signature** matches the claimed type (JPEG `FF D8 FF`, PNG `89 50 4E 47…`, WEBP `RIFF…WEBP`).
4. Writes the bytes to `uploads/<folder>/<uuid><ext>` and returns `{ url: "/uploads/<folder>/<uuid>.<ext>", filename, content_type, size }`.

The `folder` is constrained to `Literal["projects","services","partners","gallery"]`.

## Static serving

Uploaded files are served by FastAPI's `StaticFiles` at `/uploads/...`. The frontend stores the relative URL and resolves it to the API origin at render time (`normalizeImageUrl`), so images load from the backend regardless of the frontend's host.

## Error handling

Errors are raised as `HTTPException` with appropriate status codes: `401` (auth), `403` (role), `404` (not found), `409` (uniqueness/self-protection conflicts), `413` (file too large), `429` (login rate limit), `400` (bad upload). Validation errors are handled automatically by FastAPI/Pydantic (`422`). The API returns a consistent `{ "detail": "<message>" }` body, which the frontend `ApiError` surfaces directly to the UI.

## Security posture (summary)

JWT auth, bcrypt hashing, role dependencies, login rate limiting, strict upload validation, CORS locked to one origin, fail-fast config validation (weak JWT secret / weak seed password rejected), and audit logging of privileged actions. Full treatment in [Security](14-security.md).

## Configuration

`app/core/config.py` is a Pydantic `Settings` loaded from `backend/.env`. Notable validators: the app **refuses to start** if `JWT_SECRET_KEY` is empty/placeholder/too short, and refuses a placeholder/weak `FIRST_SUPERADMIN_PASSWORD` outside development environments. Settings cover the DB URL, JWT params, frontend origin (CORS), SMTP, and the first-super-admin seed values.
