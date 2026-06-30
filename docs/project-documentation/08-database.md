# 08 — Database

The database is **MySQL 8+** (`utf8mb4` / `utf8mb4_unicode_ci`). Schema is managed by **Alembic** (`backend/alembic/versions/`). Multilingual content is stored as **separate columns** per language (`*_ar`, `*_en`, `*_he`) — a deliberate decision over JSON blobs, so each language is independently queryable and indexable.

## Entity overview

```
                ┌────────────┐      audit_logs.admin_id  (SET NULL)
                │   admins   │◄──────────────────────────┐
                └────────────┘                           │
                                                   ┌────────────┐
   ┌──────────────┐   1     N   ┌────────────────┐ │ audit_logs │
   │   projects   │────────────▶│ project_images │ └────────────┘
   └──────────────┘ (CASCADE)   └────────────────┘
   ┌──────────┐ ┌──────────┐ ┌────────────────┐ ┌──────────────┐
   │ services │ │ partners │ │ gallery_images │ │ testimonials │   (independent catalogue tables)
   └──────────┘ └──────────┘ └────────────────┘ └──────────────┘
   ┌──────────────┐ ┌───────────────┐ ┌──────────────────┐ ┌────────────────┐
   │ site_content │ │ site_settings │ │ contact_messages │ │ quote_requests │   (independent tables)
   └──────────────┘ └───────────────┘ └──────────────────┘ └────────────────┘
```

The only foreign keys are **`project_images.project_id → projects.id`** (`ON DELETE CASCADE`) and **`audit_logs.admin_id → admins.id`** (`ON DELETE SET NULL`). Every other table is independent — a pragmatic, denormalized design suited to a content site.

## Tables

### `admins`
The CMS user accounts. `id`, `full_name`, `email` (unique, indexed, stored lowercase), `password_hash` (bcrypt), `role` (`admin` | `super_admin`, default `admin`), `is_active`, `created_at`, `updated_at`, `last_login_at` (nullable). **Why:** authentication and authorization; no public registration, so this table is populated only by the seed script or a super-admin.

### `projects`
Portfolio entries. Localized `title_*` (required) and `description_*` (nullable); `category` (`LOCAL` | `INTERNATIONAL` | `FEATURED`, indexed, default `LOCAL`); `main_image_url` (nullable); `is_active`; `sort_order`; timestamps. **Why:** the core content type — the company's project portfolio, categorized and orderable.

### `project_images`
Ordered gallery images for a project. `project_id` (FK, CASCADE, indexed), `image_url` (required), localized `alt_text_*` (nullable), `sort_order`, `created_at`. **Why:** a project has many images beyond its main image; deleting a project removes its images automatically.

### `services`
The service catalogue. Localized `title_*`/`description_*`, `image_url` (nullable), `starting_price` (`Numeric(12,2)`, nullable), `is_active`, `sort_order`, timestamps. **Why:** the company's offerings, with an optional "from" price.

### `partners`
Success-partner roster. Localized `name_*` (required), `logo_url` (required), `website_url` (nullable), `is_active`, `sort_order`, timestamps. **Why:** the partner carousel on the homepage.

### `gallery_images`
A standalone image gallery. `image_url` (required), localized `title_*`/`alt_text_*` (nullable), `category` (nullable), `is_active`, `sort_order`, timestamps. **Why:** originally intended for a public gallery page; the table and API remain but there is **no public gallery page or routed admin editor** in the final UI (see [Removed Features](17-removed-features.md)).

### `testimonials`
Client testimonials. Localized `client_name_*` and `message_*` (required), localized `client_position_*` (nullable), `is_active`, `sort_order`, timestamps. **Why:** testimonials render on the homepage from the API; there is no routed admin editor (editor screen is unrouted legacy code).

### `contact_messages`
Immutable contact-form inbox. `name`, `email` (indexed), `phone` (nullable), `subject` (nullable), `message` (text), `status` (`NEW` | `READ` | `ARCHIVED`, indexed, default `NEW`), `created_at`. **Why:** lead capture from the contact form. **No `updated_at`** — records are immutable except for their status.

### `quote_requests`
Quote-form inbox. `name`, `email` (nullable, indexed), `phone` (required), `service_type` (nullable), `message` (text, nullable), `status` (`NEW` | `IN_PROGRESS` | `DONE` | `ARCHIVED`, indexed, default `NEW`), `created_at`, `updated_at`. **Why:** structured quote leads with a follow-up workflow; a save can trigger an email notification.

### `site_content`
Key/value JSON content blocks. `section` (indexed) + `key` (indexed) with a **unique constraint on `(section, key)`**, `value` (JSON), `content_type` (default `text`), `is_active`, timestamps. **Why:** the **Company Numbers** feature stores its full statistics document here under `section='public_stats', key='content'` (seeded by migration). The table is general-purpose, but the final UI only edits that one row.

### `site_settings`
Key/value JSON settings. `key` (unique, indexed), `value` (JSON), timestamps. **Why:** general site configuration. The table and API exist but there is no routed admin editor in the final UI.

### `audit_logs`
Append-only privileged-action log. `admin_id` (FK, SET NULL, nullable, indexed), `action` (indexed), `entity_type` (nullable), `entity_id` (nullable string), `details` (JSON, nullable), `created_at`. The model also exposes `actor_name`/`actor_email` properties via the `admin` relationship. **Why:** accountability — logins and project/admin mutations are recorded; readable by super-admins.

### `alembic_version`
Alembic's bookkeeping table (current migration revision). Created and maintained automatically by Alembic.

## Removed / dropped tables

### `products` — **dropped**
The Products module was removed entirely (the site is a project portfolio, not a product catalogue). Migration `20260629_0001_drop_products_table` drops the `products` table; its `downgrade()` recreates the original schema, so the change is reversible. The public `/products` route and admin product editor were removed from the frontend.

> **Other "legacy but present" tables.** `gallery_images`, `testimonials`, `site_settings` are **not removed** — they still exist and have working APIs — but they have no routed editor in the final admin UI. They are documented here as present-but-not-surfaced rather than active features.

## Migrations

Five migrations, in order:

| Revision | File | What it does |
|----------|------|--------------|
| `20260612_0001` | `initial_schema` | Creates all original tables (incl. `products`) and indexes. |
| `20260620_0001` | `consolidate_unique_indexes` | Fixes redundant index pairs on `admins.email` and `site_settings.key` into single unique named indexes (resolves `alembic check` drift). |
| `20260622_0001` | `admin_realignment` | Adds `services.starting_price`; makes `quote_requests.email` nullable; **normalizes enum casing** in existing data (`category` → `LOCAL`/`INTERNATIONAL`/`FEATURED`, statuses → uppercase, `completed` → `DONE`). |
| `20260628_0001` | `seed_public_stats_content` | Seeds the `public_stats` / `content` row in `site_content` with the default hero/about statistics, value chips, and badges (idempotent — skips if present). |
| `20260629_0001` | `drop_products_table` | Drops `products`; reversible downgrade recreates it. |

Run `alembic upgrade head` to apply; generate new ones with `alembic revision --autogenerate -m "..."`.

## Conventions (enforced)

- Localized columns use `_ar` / `_en` / `_he` suffixes (never JSON blobs).
- `is_active` (not `is_published`) and `sort_order` (not `display_order`).
- Roles are `super_admin` / `admin` (underscore).
- `audit_logs.details` (JSON) holds extra context (not `metadata`).
- Catalogue deletes are **soft** (`is_active = False`); inbox/image/settings deletes are **hard**.

## Naming history

The database and user were renamed from `gm_alomco_db` / `gm_alomco_user` to `tas_db` / `tas_user`. Some shipped defaults (`alembic.ini`, `config.py` default `DATABASE_URL`, `backend/README.md`) still reference the older `gm_alomco_db` name. **The authoritative connection string is whatever `DATABASE_URL` in `backend/.env` is set to.** When provisioning a fresh environment, create the MySQL database to match that value.
