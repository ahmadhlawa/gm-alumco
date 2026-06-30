# 09 — REST API

Base URL: `/api/v1` (configurable via `API_PREFIX`). Interactive docs: `GET /api/v1/docs`. OpenAPI: `GET /api/v1/openapi.json`.

## Conventions

- **Auth**: protected endpoints require `Authorization: Bearer <token>`. The token comes from `POST /auth/login`.
- **Roles**: endpoints under `require_admin` accept any admin; those marked **super-admin** require role `super_admin`.
- **Errors**: JSON `{ "detail": "<message>" }` with status `400/401/403/404/409/413/422/429` as appropriate.
- **Soft delete**: `DELETE` on catalogue resources sets `is_active = false` (still returns `204`). Inbox records, project images, and site settings are **hard**-deleted.
- **Public list endpoints** return only `is_active = true` rows (except gallery, which filters by category only); admin list endpoints return everything.

## Auth & current user

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/login` | public | Body `{email, password}` → `{access_token}`. Rate-limited (5 fails/IP/5 min → `429`). Records a `login` audit entry. |
| GET | `/auth/me` | admin | Returns the current `AdminRead`. |

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@gm-alomco.local", "password": "ChangeMe123!" }
```
```json
200 OK
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

## Uploads

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/admin/uploads/image` | admin | Multipart `file` + `folder` (`projects`/`services`/`partners`/`gallery`). Validates extension, content-type, magic bytes, ≤5 MB. Returns `{url, filename, content_type, size}`. |

```http
POST /api/v1/admin/uploads/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<binary>; folder=projects
```
```json
201 Created
{ "url": "/uploads/projects/0c3e4f0a-....jpg", "filename": "0c3e4f0a-....jpg",
  "content_type": "image/jpeg", "size": 184213 }
```

## Projects

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/projects` | public | List active projects; optional `?category=LOCAL\|INTERNATIONAL\|FEATURED`. |
| GET | `/projects/{id}` | public | Active project **with images** (`ProjectDetail`). |
| GET | `/admin/projects` | admin | List all projects (any status). |
| GET | `/admin/projects/{id}` | admin | Project with images (any status). |
| POST | `/admin/projects` | admin | Create. Audited (`create`/`project`). |
| PUT | `/admin/projects/{id}` | admin | Update (partial). Audited. |
| DELETE | `/admin/projects/{id}` | admin | Soft delete. Audited. |
| POST | `/admin/projects/{id}/images` | admin | Add a gallery image. Audited (`add_image`). |
| DELETE | `/admin/project-images/{image_id}` | admin | Hard-delete a gallery image. Audited (`delete_image`). |

```json
// POST /admin/projects  body
{
  "title_ar": "...", "title_en": "Glass Tower", "title_he": "מגדל זכוכית",
  "description_en": "Curtain wall facade", "category": "FEATURED",
  "main_image_url": "/uploads/projects/uuid.jpg", "is_active": true, "sort_order": 1
}
```

## Services

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/services` | public | List active services. |
| GET | `/services/{id}` | public | Active service. |
| GET | `/admin/services` / `/admin/services/{id}` | admin | List all / get one. |
| POST `/admin/services` · PUT `/{id}` · DELETE `/{id}` | | admin | Create / update / soft delete. |

## Partners

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/partners` | public | List active partners. |
| GET | `/admin/partners` / `/admin/partners/{id}` | admin | List all / get one. |
| POST `/admin/partners` · PUT `/{id}` · DELETE `/{id}` | | admin | Create / update / soft delete. |

## Gallery

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/gallery` | public | List active gallery images; optional `?category=`. |
| GET | `/admin/gallery` / `/admin/gallery/{id}` | admin | List all / get one. |
| POST `/admin/gallery` · PUT `/{id}` · DELETE `/{id}` | | admin | Create / update / soft delete. |

*(API present; no routed admin editor or public page in the final UI.)*

## Testimonials

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/testimonials` | public | List active testimonials. |
| GET | `/admin/testimonials` / `/{id}` | admin | List all / get one. |
| POST `/admin/testimonials` · PUT `/{id}` · DELETE `/{id}` | | admin | Create / update / soft delete. |

*(API present and rendered on the homepage; no routed admin editor in the final UI.)*

## Site content & settings

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/site-content` | public | All active content rows. |
| GET | `/site-content/{section}` | public | Active rows in a section (used by the Company Numbers reader: `section=public_stats`). |
| GET | `/admin/site-content` / `/{id}` | admin | List all / get one. |
| POST `/admin/site-content` · PUT `/{id}` · DELETE `/{id}` | | admin | Create (unique `section`+`key`, `409` on conflict) / update / soft delete. |
| GET | `/site-settings` | public | All settings. |
| GET | `/admin/site-settings` / `/{id}` | admin | List all / get one. |
| POST `/admin/site-settings` · PUT `/{id}` · DELETE `/{id}` | | admin | Create (unique `key`) / update / **hard** delete. |

## Contact messages

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/contact/messages` | public | Submit a contact message (`name`, `email`, `phone?`, `subject?`, `message`). |
| GET | `/admin/contact-messages` / `/{id}` | admin | List (newest first) / get one. |
| PATCH | `/admin/contact-messages/{id}/status` | admin | Body `{status: NEW\|READ\|ARCHIVED}`. |
| DELETE | `/admin/contact-messages/{id}` | admin | Hard delete. |

## Quote requests

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/quote-requests` | public | Submit (`name`, `phone`, `email?`, `service_type?`, `message?`). Triggers best-effort SMTP notification. |
| GET | `/admin/quote-requests` / `/{id}` | admin | List (newest first) / get one. |
| PATCH | `/admin/quote-requests/{id}/status` | admin | Body `{status: NEW\|IN_PROGRESS\|DONE\|ARCHIVED}`. |
| DELETE | `/admin/quote-requests/{id}` | admin | Hard delete. |

## Dashboard

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/admin/dashboard/stats` | admin | Aggregated counts. |

```json
// GET /admin/dashboard/stats
{
  "projects": 12, "local_projects": 7, "international_projects": 3, "featured_projects": 2,
  "services": 5, "gallery": 0, "partners": 6, "testimonials": 3,
  "contact_messages": { "NEW": 4, "READ": 9 },
  "quote_requests": { "NEW": 2, "IN_PROGRESS": 1, "DONE": 5 }
}
```
(Status maps exclude `ARCHIVED`.)

## Admins (super-admin only)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/admins` / `/{id}` | List / get. |
| POST | `/admin/admins` | Create (`full_name`, `email`, `password` ≥8, `role`). `409` on duplicate email. Audited. |
| PUT | `/admin/admins/{id}` | Update (name/email/password/role/is_active). Self-protection: cannot deactivate/demote self (`409`). Audited. |
| DELETE | `/admin/admins/{id}` | Deactivate (sets `is_active=false`). Cannot deactivate self (`409`). Audited (`deactivate`). |

## Audit logs (super-admin only)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/audit-logs?limit=1..500` | Recent entries, newest first (default 100). Each includes `actor_name`/`actor_email`, `action`, `entity_type`, `entity_id`, `created_at`. |

## Health

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | `{"status": "ok"}`. |

## Upload flow (end-to-end)

1. Admin selects an image in a form (`ImageUploadField`).
2. The client POSTs it to `/admin/uploads/image` with the target `folder` (XHR with progress).
3. The backend validates and stores it, returning a relative `/uploads/...` URL.
4. That URL is saved into the entity (e.g. `project.main_image_url`) via the normal create/update endpoint.
5. On render, `normalizeImageUrl` rewrites the relative URL to the API origin so the browser loads it from the backend.
