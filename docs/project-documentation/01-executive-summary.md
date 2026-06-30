# 01 — Executive Summary

## What the project is

T.A.S is a two-part web product:

1. **A public corporate website** — a premium, animated, bilingual (Hebrew / English) marketing site for a company that designs, manufactures, and installs aluminum-and-glass architectural systems (curtain-wall facades, sliding doors, windows, and bespoke solutions for villas and commercial buildings).
2. **A private administration system (CMS)** — a role-based admin panel where company staff manage the dynamic content shown on the public site (projects, services, partners, the headline company numbers) and process the leads the site collects (contact messages and quote requests).

The two parts are decoupled: a **React single-page application** (the browser client, serving both the public site and the admin panel) talks over a JSON REST API to a **FastAPI backend** backed by **MySQL**.

## Who it is for

| Audience | How they use the product |
|----------|--------------------------|
| **Prospective clients** (villa owners, contractors, commercial developers) | Browse the public site, view the project portfolio and services, and submit a contact message or a detailed quote request. |
| **Company sales / content staff** (`admin` role) | Log into the CMS to keep projects, services, partners and the headline numbers up to date, and to triage incoming messages and quote requests. |
| **Company owner / lead administrator** (`super_admin` role) | Everything an `admin` can do, plus provisioning and managing other admin accounts and reviewing the system audit log. |

## The business goal

Give an established aluminum/glass fabricator a **credible, premium online presence** in its real operating market (Hebrew-first, with an English fallback for international audiences), and a **simple, self-service way to keep it current** without a developer in the loop. The site must look high-end (the company sells premium architectural work, so the site itself is a sales asset), load fast, and read correctly right-to-left in Hebrew and left-to-right in English.

## The problem it solves

Before this product the company had no controlled way to:

- present a curated, categorized portfolio of completed projects with imagery;
- publish its service catalogue and partner roster;
- capture structured leads (contact + quote requests) instead of relying on phone/WhatsApp alone;
- update any of the above without editing code or paying for each change.

The CMS solves the "keep it current" problem with a focused, opinionated editing surface (see [Admin CMS](10-admin-cms.md)), deliberately narrower than a general-purpose CMS so that non-technical staff cannot break the carefully designed public layout.

## Target users and languages

The site ships in **two production languages**:

- **Hebrew (`he`)** — the default language and the default text direction (RTL).
- **English (`en`)** — the secondary language (LTR), used as the international fallback.

Arabic (`ar`) was the original development/preview language and still exists *inside the data model* as a preserved fallback, but it is **not** an option the public visitor can select. This evolution is documented in full in [Localization](12-localization.md).

## Client expectations (as finally settled)

- A luxury, dark, gold-accented visual identity that stays consistent across the public site and the admin panel (see [Design System](13-design-system.md)).
- Hebrew/English only on the public site, with correct mirrored RTL/LTR layouts and direction-aware iconography.
- A **deliberately simplified** content model: the client did not want a sprawling page-builder. The headline statistics are edited once as three canonical "Company Numbers" and projected everywhere automatically.
- Real lead capture with optional email notification for quote requests.
- Image management that works on a basic VPS (local file uploads served by the API), with manual external image URLs (e.g. Google Drive links) supported as an advanced fallback.
- Controlled administration: no public sign-up; admins are provisioned by a super-admin or a seed script.

## Status at a glance

The backend, the public website, and the routed admin pages form a **working, end-to-end product**: authentication, projects CRUD with image galleries, services/partners management, the Company Numbers editor, the contact/quote inboxes, admin management, and the audit log are all wired front-to-back and covered by automated tests. A set of earlier "Visual CMS" admin screens were superseded and remain in the repository as unrouted legacy code — see [Removed Features](17-removed-features.md) and [Current Status](18-current-status.md).
