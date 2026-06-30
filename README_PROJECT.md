# GM Alomco (T.A.S) — Complete Project Documentation

**Version 1.0 — Final Architecture**

This is the official technical reference for the T.A.S corporate website and its administration system (CMS). It documents the **final state of the repository** as it exists today, not the chronological history of how it was built. Where an architectural decision changed something important, the change and its reasoning are explained inline and gathered in [Features Removed During Development](docs/project-documentation/17-removed-features.md).

> **Brand note.** The project is internally referred to as *GM Alomco*. The brand that ships and is displayed to users is the literal string **`T.A.S`**. "GM Alomco" and the earlier placeholder "Ofok Aluminum" survive only inside historical config/seed strings and are documented as such.

---

## How this documentation is organized

| # | Document | What it covers |
|---|----------|----------------|
| 01 | [Executive Summary](docs/project-documentation/01-executive-summary.md) | What the product is, who it's for, the business goal |
| 02 | [Business Requirements](docs/project-documentation/02-business-requirements.md) | The final requirements after all iterations; what was intentionally removed |
| 03 | [Final Feature List](docs/project-documentation/03-features.md) | Every shipped feature, grouped by surface |
| 04 | [Final Tech Stack](docs/project-documentation/04-tech-stack.md) | Every technology and why it was chosen |
| 05 | [Project Structure](docs/project-documentation/05-project-structure.md) | The real directory tree and folder responsibilities |
| 06 | [Frontend Architecture](docs/project-documentation/06-frontend-architecture.md) | React app, pages, components, state, API layer, i18n |
| 07 | [Backend Architecture](docs/project-documentation/07-backend-architecture.md) | FastAPI app, routers, services, schemas, models, uploads |
| 08 | [Database](docs/project-documentation/08-database.md) | Every table, relationships, migrations, removed tables |
| 09 | [REST API](docs/project-documentation/09-rest-api.md) | Every endpoint, grouped by module, with examples |
| 10 | [Admin CMS](docs/project-documentation/10-admin-cms.md) | Every admin page, permissions, what each one edits |
| 11 | [Public Website](docs/project-documentation/11-public-website.md) | Every public page and section, and where its data comes from |
| 12 | [Localization](docs/project-documentation/12-localization.md) | The full i18n architecture and its Arabic→Hebrew/English evolution |
| 13 | [Design System](docs/project-documentation/13-design-system.md) | Colors, typography, motion, the premium dark visual language |
| 14 | [Security](docs/project-documentation/14-security.md) | JWT, roles, upload validation, audit logging, production notes |
| 15 | [Performance](docs/project-documentation/15-performance.md) | Bundling, images, lazy patterns, animation performance |
| 16 | [Testing](docs/project-documentation/16-testing.md) | Frontend + backend tests and verification commands |
| 17 | [Removed Features](docs/project-documentation/17-removed-features.md) | Every removed feature and the business reasoning |
| 18 | [Current Status](docs/project-documentation/18-current-status.md) | What's complete, deferred, and deployment-ready |
| 19 | [Future Roadmap](docs/project-documentation/19-roadmap.md) | Logical next improvements |
| 20 | [Final Technical Evaluation](docs/project-documentation/20-final-evaluation.md) | A scored technical review |

---

## One-paragraph summary

T.A.S is a bilingual (Hebrew / English) corporate portfolio website for an aluminum-and-glass fabrication and installation company, paired with a private admin CMS. The public site presents the company, its services, its projects portfolio, its partners, and collects contact messages and quote requests. The admin CMS lets staff manage projects (with image galleries), services, partners, the three headline "Company Numbers", and the contact/quote inboxes; a super-admin can additionally manage admin accounts and read the audit log. The frontend is a Vite + React 19 + TypeScript SPA styled with Tailwind CSS 4; the backend is a FastAPI + SQLAlchemy + Alembic application on MySQL with JWT authentication and local image uploads.

## Quick start

```bash
# Backend (from backend/)
python -m venv .venv && source .venv/bin/activate   # or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
# create MySQL DB, set backend/.env (JWT_SECRET_KEY required), then:
alembic upgrade head
python -m app.utils.seed_admin
uvicorn app.main:app --reload                        # http://localhost:8000/api/v1/docs

# Frontend (from frontend/)
npm install
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev                                          # http://localhost:5173
```

See [Current Status](docs/project-documentation/18-current-status.md) for the precise deployment checklist.
