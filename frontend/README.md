# T.A.S Corporate Website — Frontend

Vite + React SPA for the T.A.S corporate website (public site) and its Hebrew/English admin CMS. All dynamic content is served by the FastAPI backend in `../backend` (see [../README_PROJECT.md](../README_PROJECT.md) for the full documentation index).

## Tech Stack

- Vite 6
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Router 7
- Motion for React
- Lucide React icons
- Vitest

## Languages

The public site and the admin UI are Hebrew (default, RTL) and English (LTR). The public site persists its language independently of the admin (`tas_public_language` / `tas_admin_language` localStorage keys).

## Premium Dark Theme

The design tokens are defined in `src/index.css`:

| Token | Color | Usage |
| --- | --- | --- |
| Brand navy | `#0A192F` | Main backgrounds |
| Brand surface | `#112240` | Cards and sections |
| Brand surface alt | `#172A45` | Inputs and elevated surfaces |
| Brand gold | `#D4AF37` | Accent, highlights, and edit controls |
| Brand silver | `#8892B0` | Secondary text |
| Brand text | `#F3F4F6` | Primary text |
| Brand border | `#233554` | Subtle borders and shadows |

The public website and admin dashboard share this visual identity.

## Project Structure

```text
src/
  api/          Backend REST client, DTOs, and adapters
  app/          Public and admin route components
  components/   Shared public, layout, form, card, and admin components
  data/         Static homepage copy and public-stats defaults/normalizers
  i18n/         Runtime language context (he/en)
  lib/          View-model helpers and shared utilities
  types/        Shared TypeScript view models
```

## Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/about` | Company overview |
| `/services` | Services listing |
| `/projects` | Projects gallery |
| `/contact` | Contact page and form |
| `/request-quote` | Quote request form |
| `/careers` | Careers placeholder ("coming soon") |

## Admin Routes

All admin routes except `/admin/login` require a valid JWT session; `admins` and `audit-logs` additionally require the super-admin role.

| Route | Purpose |
| --- | --- |
| `/admin/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/projects` (+ `/new`, `/:id/edit`) | Projects management |
| `/admin/services` (+ `/new`, `/:id/edit`) | Services management |
| `/admin/partners` (+ `/new`, `/:id/edit`) | Partners management |
| `/admin/testimonials` (+ `/new`, `/:id/edit`) | Testimonials management |
| `/admin/contact-messages` | Contact inbox |
| `/admin/quote-requests` | Quote requests inbox |
| `/admin/public-stats` | Company Numbers editor |
| `/admin/admins` | Admin accounts (super admin) |
| `/admin/audit-logs` | Audit log (super admin) |

## Environment

Copy `.env.example` to `.env`:

```text
VITE_API_URL=http://localhost:8000/api/v1
```

## Run Locally

Prerequisites: Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm run typecheck  # tsc --noEmit
npm run test       # vitest run
npm run build
npm run preview
npm run clean
```
