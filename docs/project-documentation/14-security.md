# 14 — Security

Security is enforced primarily on the **backend** (the source of truth) and mirrored on the **frontend** for UX. The model is appropriate for an internal CMS with a small, trusted set of administrators and no public sign-up.

## Authentication (JWT)

- Login (`POST /auth/login`) verifies credentials and returns an **HS256 JWT** whose `sub` is the admin id and whose `exp` is `ACCESS_TOKEN_EXPIRE_MINUTES` (default 30) in the future.
- Every protected request must send `Authorization: Bearer <token>`. `get_current_admin` decodes and validates the token, loads the admin, and rejects missing/invalid/expired tokens or inactive admins with `401`.
- The frontend stores the token in **`sessionStorage`** (`tas_admin_token`) — it is cleared when the tab/session closes and is not shared across tabs, reducing the window for token theft compared to `localStorage`.
- On any `401` for an authenticated request the client clears the token and dispatches `gm-auth-expired`, which forces a redirect to login.

## Authorization (roles)

Two roles, enforced by a dependency chain:
- `require_admin` — any valid admin (role in `{admin, super_admin}`), else `403`.
- `require_super_admin` — exactly `super_admin`, else `403`.

Super-admin-only operations: admin-account management and audit-log reading. The frontend additionally hides/guards these (`RequireSuperAdmin`, role-filtered nav), but **the backend is authoritative** — a forged client cannot bypass the role check.

### Self-protection rules
A super-admin **cannot deactivate or demote themselves** (returns `409`), preventing an account from accidentally locking the organization out of admin management.

## Password handling

- Passwords are hashed with **bcrypt** via passlib's `CryptContext` (`verify`/`hash`), never stored or logged in plaintext.
- Admin creation requires a password of **≥8 characters** (Pydantic constraint).
- Password reset is a super-admin action that re-hashes the new value.

## Login rate limiting

`LoginRateLimiter` (in `core/rate_limit.py`) blocks more than **5 failed attempts per client IP per 5-minute** sliding window, returning `429` with a `Retry-After` header; a successful login resets the counter. **Limitation (documented in source):** it is in-process, so behind multiple workers/replicas the effective limit multiplies — production with multiple workers should back this with a shared store (Redis) or enforce it at the gateway.

## Input validation

- All request bodies are validated by **Pydantic** schemas: constrained `Literal` enums (category, status, role), `EmailStr` for emails, and length constraints on names/messages.
- URL fields use custom validators: `HttpUrlString` (http/https only) and `ImageUrlString`, which accepts either a valid http(s) URL or a **safe relative `/uploads/...` path**, explicitly rejecting path traversal (`..`) and backslashes.

## File-upload validation

The upload endpoint defends in depth (`endpoints/uploads.py`):
1. **Extension allow-list** (`.jpg/.jpeg/.png/.webp`).
2. **Declared content-type must match** the extension.
3. **Magic-byte signature check** (JPEG/PNG/WEBP) — the file's actual bytes must match its claimed type, defeating a renamed/mislabeled file.
4. **5 MB size cap** (`413` if exceeded).
5. Stored under a **server-generated UUID filename** in a constrained folder (`Literal[...]`), so a client can't choose the path or filename.

This prevents arbitrary-file upload, content-type spoofing, oversized uploads, and path manipulation.

## Audit logging

Privileged actions (logins, project create/update/delete + image add/delete, admin create/update/deactivate) are recorded in `audit_logs` with the actor, action, entity type/id, and optional JSON details. Recording is **best-effort and isolated**: the mutation commits first, and any audit failure is swallowed so it can never break the operation it records. Super-admins can review the log.

## Transport & CORS

- **CORS is locked to a single origin** (`FRONTEND_URL`) with credentials allowed — not a wildcard.
- TLS is expected to be terminated by the reverse proxy in production (the app is designed to sit behind one).

## Fail-fast configuration

The app **refuses to start** on insecure config:
- `JWT_SECRET_KEY` must be present, non-placeholder, and ≥16 chars (≥32 recommended) — otherwise startup raises a validation error.
- `FIRST_SUPERADMIN_PASSWORD` must be strong (≥12 chars, ≥16 recommended) and non-placeholder **outside** development/test environments; a relaxed default is tolerated only in dev/local/test.

This makes it hard to deploy a weak instance by accident.

## Production considerations & known limitations

- **No refresh tokens / token revocation**: tokens are valid until expiry; deactivating an admin blocks new requests at validation time (the admin is re-loaded and checked for `is_active`), but an already-issued token can't be individually revoked before expiry. Short expiry mitigates this.
- **Rate limiter is single-process** — see above.
- **No CSRF token** is needed for the API because auth is a bearer token in a header (not a cookie), so it isn't automatically attached by the browser.
- **Uploads are served without auth** from `/uploads/...` (public by design, like any web image). Don't store sensitive material there.
- **Secrets** live in `backend/.env` (gitignored). Ensure the production `.env` is not world-readable and the JWT secret is unique per environment.
- **SMTP credentials** (if email is enabled) should use an app password / scoped credential.
