# About Page Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the About page's Success Story, Vision/Mission, and Difference/Stats content admin-editable via a new singleton `about_page_content` table, with character limits enforced on both backend and frontend, while keeping the public page's design pixel-identical.

**Architecture:** Follow the existing `homepage_video_section` singleton pattern exactly: one SQLAlchemy model with flat `_en`/`_he` columns (no nested JSON, no Arabic), a public GET (no auth) + admin GET/PUT (auth) pair of routers, `get_or_create` singleton semantics, audit logging on PUT. Frontend fetches the DTO, adapts it to a localized view model with a `pick(locale, he, en)` fallback (mirroring `adapters.ts`), and falls back to a hardcoded default DTO (identical to the DB seed) if the fetch fails. The admin page is a single form with three visually grouped sections, built from a small reusable `TextField` component that shows a live character counter.

**Tech Stack:** FastAPI + SQLAlchemy + Alembic + Pydantic v2 (backend, `backend/`), React + TypeScript + Vite + Tailwind + vitest (frontend, `frontend/`).

## Global Constraints

- Public languages are Hebrew and English only. No Arabic columns, fields, or admin inputs anywhere in this feature.
- Multilingual DB columns use flat `_en`/`_he` suffixes, never nested JSON (matches `homepage_video_section`, not `site_content`).
- Singleton table: exactly one row, created on demand via `get_or_create_content`, never a second row.
- Character limits (exact, enforced identically in Pydantic `Field(max_length=N)` and the DB column length, and mirrored in the frontend `TextField`/`maxLength`):
  - Titles (`title`, `vision_title`, `mission_title`, `difference_title`): **60**
  - Subtitles (`subtitle`, `difference_intro`): **120**
  - Paragraphs (`paragraph_1`, `paragraph_2`, `difference_paragraph`): **350**
  - Bullet items (`bullet_1`..`bullet_4`): **90**
  - Vision/Mission text (`vision_text`, `mission_text`): **250**
  - Stat/experience labels (`experience_label`, `stat_1_label`, `stat_2_label`, `stat_3_label`): **40**
  - Stat/experience numbers (`experience_number`, `stat_1_number`, `stat_2_number`, `stat_3_number`): **12**
  - CTA text (`cta_text`): **40**
  - CTA link (`cta_link`): **255**
  - Image URL (`image_url`): **500**, validated with the shared image URL validator
- Admin roles `admin` and `super_admin` can both read and write this content (no `RequireSuperAdmin` wrapper, no role gate beyond `require_admin`).
- Endpoints: `GET /api/v1/about-page-content` (public, no auth), `GET /api/v1/admin/about-page-content` (admin auth), `PUT /api/v1/admin/about-page-content` (admin auth, partial update via `exclude_unset`, audit-logged with `entity_type="about_page_content"`).
- The public About page must render identically to today when the API is unreachable — the fallback constant must contain the exact current hardcoded copy (mirrored from `About.tsx` and `CTASection.tsx`'s current defaults) so a failed fetch is visually indistinguishable from success.
- Do not touch `public_stats` / `site_content` / `AdminPublicStats.tsx` / the Home page — the About page's stats and CTA stop reading from `public_stats` entirely, but `public_stats` keeps serving the Home page and Company Numbers admin page unchanged.
- Do not change any Tailwind classes, motion props, grid layout, or the stats-grid column count on `About.tsx` — only swap literal text/props for data-driven equivalents.

---

## Field reference (used by every task below — do not deviate from these names/limits)

| Field | Max | Notes |
|---|---|---|
| `title_en` / `title_he` | 60 | Success Story heading |
| `subtitle_en` / `subtitle_he` | 120 | Success Story subheading |
| `paragraph_1_en` / `paragraph_1_he` | 350 | |
| `paragraph_2_en` / `paragraph_2_he` | 350 | |
| `bullet_1_en` / `bullet_1_he` | 90 | |
| `bullet_2_en` / `bullet_2_he` | 90 | |
| `bullet_3_en` / `bullet_3_he` | 90 | |
| `bullet_4_en` / `bullet_4_he` | 90 | |
| `image_url` | 500 | Success Story image |
| `experience_number` | 12 | Badge over the image, e.g. `10+` |
| `experience_label_en` / `experience_label_he` | 40 | |
| `vision_title_en` / `vision_title_he` | 60 | |
| `vision_text_en` / `vision_text_he` | 250 | |
| `mission_title_en` / `mission_title_he` | 60 | |
| `mission_text_en` / `mission_text_he` | 250 | |
| `difference_title_en` / `difference_title_he` | 60 | `CTASection` `title` prop |
| `difference_intro_en` / `difference_intro_he` | 120 | `CTASection` `subtitle` prop |
| `difference_paragraph_en` / `difference_paragraph_he` | 350 | `CTASection` new `description` prop |
| `cta_text_en` / `cta_text_he` | 40 | `CTASection` `buttonText` prop |
| `cta_link` | 255 | `CTASection` `buttonLink` prop |
| `stat_1_number` | 12 | |
| `stat_1_label_en` / `stat_1_label_he` | 40 | |
| `stat_2_number` | 12 | |
| `stat_2_label_en` / `stat_2_label_he` | 40 | |
| `stat_3_number` | 12 | |
| `stat_3_label_en` / `stat_3_label_he` | 40 | |

## Seed content (must match verbatim across the migration seed and the frontend fallback constant)

```
title:                 he="סיפור ההצלחה שלנו"                              en="Our success story"
subtitle:               he="מסע של תשוקה בעולם האדריכלות למען איכות."         en="A journey of passion in architecture, begun to deliver the quality you deserve."
paragraph_1:            he="T.A.S הוקמה בחזון ברור לחולל שינוי מהותי בתעשיית קירוי מבנים ומערכות אלומיניום."
                         en="T.A.S was founded with a clear vision to drive a real shift in the building cladding and aluminum systems industry. From day one we have focused on superior quality, strict engineering standards and on-time delivery."
paragraph_2:            he="אנו גאים להעסיק אנשי מקצוע ומהנדסים מובילים לפיתוח בר קיימא עבור המגזר הפרטי והעסקי."
                         en="We are proud to employ leading professionals and engineers, and we continually adopt the latest manufacturing technology to deliver sustainable, safe solutions for the residential and commercial sectors."
bullet_1:                he="יישום תקני בטיחות ואיכות מחמירים"                en="Applying the strictest safety and quality standards"
bullet_2:                he="שימוש בחומרי גלם באישור בינלאומי"                en="Using internationally certified raw materials"
bullet_3:                he="צוות טכני מיומן ומנוסה"                         en="A skilled and experienced technical team"
bullet_4:                he="שירותי לאחר המכירה ואחריות מקיפה"                en="Comprehensive after-sales service and genuine warranty"
image_url:               "/images/our-success-story.png"
experience_number:       "10+"
experience_label:        he="שנות ניסיון"                                    en="Years of experience"
vision_title:            he="החזון שלנו"                                     en="Our vision"
vision_text:              he="להיות הבחירה הראשונה והחברה המובילה במתן פתרונות אלומיניום וזכוכית חדשניים ואיכותיים ביות"
                         en="To be the first choice and leading company providing innovative aluminum and glass solutions in the region, setting new standards for quality, design and reliability."
mission_title:           he="המשימה שלנו"                                    en="Our mission"
mission_text:             he="לספק מענה מלא לדרישות הלקוחות בעזרת ייצור מתקדם ואמינות מתמשכת לפני, תוך ולאחר הייצור."
                         en="To fully meet our clients' aspirations through advanced, time-resistant systems, with the highest professional integrity and exceptional service before, during and after execution."
difference_title:        he="האם יש לך פרויקט חדש? תן לנו לעזור לך לממש אותו." en="Have a new project? Let us help you bring it to life."
difference_intro:        he="אנו כאן לייעוץ הנדסי והצעות מחיר תחרותיות לפרויקט הבא שלך."
                         en="We're here to provide engineering consultation and competitive quotes for your next project."
difference_paragraph:    he="מהרעיון ועד ההתקנה, צוות ההנדסה שלנו לצדכם בכל שלב – ומספק מערכות אלומיניום וזכוכית מהונדסות בדייקנות, בגיבוי בקרת איכות קפדנית ואחריות אמיתית."
                         en="From concept to installation, our engineering team partners with you at every step, delivering precision-engineered aluminum and glass systems backed by rigorous quality control and a genuine warranty."
cta_text:                 he="צור קשר עכשיו"                                  en="Contact us now"
cta_link:                "/request-quote"
stat_1_number: "250+"    stat_1_label: he="פרויקטים שהושלמו"                  en="Completed projects"
stat_2_number: "10+"     stat_2_label: he="שנות ניסיון"                       en="Years of experience"
stat_3_number: "5"       stat_3_label: he="שנות אחריות"                       en="Years warranty"
```

---

### Task 1: Backend model + link/image URL validator + model registration

**Files:**
- Modify: `backend/app/schemas/common.py`
- Create: `backend/app/models/about_page_content.py`
- Modify: `backend/app/models/__init__.py`

**Interfaces:**
- Produces: `AboutPageContent` SQLAlchemy model (46 nullable string columns + `id`/`created_at`/`updated_at`), importable as `from app.models.about_page_content import AboutPageContent`.
- Produces: `SafeLinkString` (Annotated type) in `common.py`, for `cta_link`.
- Modifies: `ImageUrlString`'s local-path check to also accept `/images/...` static paths (currently only accepts `/uploads/...`), because the seed default `image_url` is a frontend static asset, not an admin upload.

- [ ] **Step 1: Broaden `validate_image_url` and add `SafeLinkString` in `common.py`**

In `backend/app/schemas/common.py`, replace the `validate_image_url` function and add a new validator right after `ImageUrlString`:

```python
def validate_image_url(value: str) -> str:
    parsed = urlsplit(value)
    parts = PurePosixPath(parsed.path).parts
    if (
        not parsed.scheme
        and not parsed.netloc
        and not parsed.query
        and not parsed.fragment
        and len(parts) >= 3
        # "uploads" covers admin-uploaded files; "images" covers the frontend's
        # bundled static assets (e.g. seeded defaults that predate the uploader).
        and parts[1] in {"uploads", "images"}
        and ".." not in parts
        and "\\" not in value
    ):
        return value
    return validate_http_url(value)


ImageUrlString = Annotated[str, AfterValidator(validate_image_url)]


def validate_safe_link(value: str) -> str:
    parsed = urlsplit(value)
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        raise ValueError("Link must use HTTP or HTTPS, or be a relative path")
    return value


SafeLinkString = Annotated[str, AfterValidator(validate_safe_link)]
```

Note `len(parts) >= 3` (was `>= 4`): `/images/our-success-story.png` splits into `('/', 'images', 'our-success-story.png')` — 3 parts — while `/uploads/<folder>/<file>` still satisfies `>= 3` as well (it has 4), so no existing behavior is lost, only broadened.

- [ ] **Step 2: Create the model**

Create `backend/app/models/about_page_content.py`:

```python
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AboutPageContent(Base):
    """Singleton editable content for the public About page.

    Success Story, Vision/Mission, and Difference/Stats sections. There is
    only ever one row, created on demand by get_or_create_content and seeded
    by migration 20260709_0001. Hebrew + English only — no Arabic columns.
    """

    __tablename__ = "about_page_content"

    id: Mapped[int] = mapped_column(primary_key=True)

    title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    subtitle_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    subtitle_he: Mapped[str | None] = mapped_column(String(120), nullable=True)
    paragraph_1_en: Mapped[str | None] = mapped_column(String(350), nullable=True)
    paragraph_1_he: Mapped[str | None] = mapped_column(String(350), nullable=True)
    paragraph_2_en: Mapped[str | None] = mapped_column(String(350), nullable=True)
    paragraph_2_he: Mapped[str | None] = mapped_column(String(350), nullable=True)
    bullet_1_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_1_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_2_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_2_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_3_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_3_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_4_en: Mapped[str | None] = mapped_column(String(90), nullable=True)
    bullet_4_he: Mapped[str | None] = mapped_column(String(90), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    experience_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    experience_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    experience_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)

    vision_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    vision_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    vision_text_en: Mapped[str | None] = mapped_column(String(250), nullable=True)
    vision_text_he: Mapped[str | None] = mapped_column(String(250), nullable=True)
    mission_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    mission_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    mission_text_en: Mapped[str | None] = mapped_column(String(250), nullable=True)
    mission_text_he: Mapped[str | None] = mapped_column(String(250), nullable=True)

    difference_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True)
    difference_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True)
    difference_intro_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    difference_intro_he: Mapped[str | None] = mapped_column(String(120), nullable=True)
    difference_paragraph_en: Mapped[str | None] = mapped_column(String(350), nullable=True)
    difference_paragraph_he: Mapped[str | None] = mapped_column(String(350), nullable=True)
    cta_text_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cta_text_he: Mapped[str | None] = mapped_column(String(40), nullable=True)
    cta_link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stat_1_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    stat_1_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_1_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_2_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    stat_2_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_2_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_3_number: Mapped[str | None] = mapped_column(String(12), nullable=True)
    stat_3_label_en: Mapped[str | None] = mapped_column(String(40), nullable=True)
    stat_3_label_he: Mapped[str | None] = mapped_column(String(40), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
```

- [ ] **Step 3: Register the model**

In `backend/app/models/__init__.py`, add the import (alphabetically, before `Admin`... actually `about_page_content` sorts before `admin` alphabetically, so add it as the first import) and `__all__` entry:

```python
from app.models.about_page_content import AboutPageContent
from app.models.admin import Admin
```

and in `__all__`, add `"AboutPageContent",` as the first entry (before `"Admin"`).

- [ ] **Step 4: Verify it imports cleanly**

Run: `cd backend && python -c "from app.models import AboutPageContent; print(AboutPageContent.__tablename__)"`
Expected: prints `about_page_content` with no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/app/schemas/common.py backend/app/models/about_page_content.py backend/app/models/__init__.py
git commit -m "feat: add about_page_content model and broaden URL validators"
```

---

### Task 2: Backend schemas

**Files:**
- Create: `backend/app/schemas/about_page_content.py`

**Interfaces:**
- Consumes: `ImageUrlString`, `SafeLinkString`, `ORMModel` from `app.schemas.common` (Task 1).
- Produces: `AboutPageContentUpdate`, `AboutPageContentRead`, `AboutPageContentPublic` — consumed by Task 3's router.

- [ ] **Step 1: Write the schema file**

Create `backend/app/schemas/about_page_content.py`:

```python
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ImageUrlString, ORMModel, SafeLinkString


class AboutPageContentBase(BaseModel):
    title_en: str | None = Field(default=None, max_length=60)
    title_he: str | None = Field(default=None, max_length=60)
    subtitle_en: str | None = Field(default=None, max_length=120)
    subtitle_he: str | None = Field(default=None, max_length=120)
    paragraph_1_en: str | None = Field(default=None, max_length=350)
    paragraph_1_he: str | None = Field(default=None, max_length=350)
    paragraph_2_en: str | None = Field(default=None, max_length=350)
    paragraph_2_he: str | None = Field(default=None, max_length=350)
    bullet_1_en: str | None = Field(default=None, max_length=90)
    bullet_1_he: str | None = Field(default=None, max_length=90)
    bullet_2_en: str | None = Field(default=None, max_length=90)
    bullet_2_he: str | None = Field(default=None, max_length=90)
    bullet_3_en: str | None = Field(default=None, max_length=90)
    bullet_3_he: str | None = Field(default=None, max_length=90)
    bullet_4_en: str | None = Field(default=None, max_length=90)
    bullet_4_he: str | None = Field(default=None, max_length=90)
    image_url: ImageUrlString | None = Field(default=None, max_length=500)
    experience_number: str | None = Field(default=None, max_length=12)
    experience_label_en: str | None = Field(default=None, max_length=40)
    experience_label_he: str | None = Field(default=None, max_length=40)

    vision_title_en: str | None = Field(default=None, max_length=60)
    vision_title_he: str | None = Field(default=None, max_length=60)
    vision_text_en: str | None = Field(default=None, max_length=250)
    vision_text_he: str | None = Field(default=None, max_length=250)
    mission_title_en: str | None = Field(default=None, max_length=60)
    mission_title_he: str | None = Field(default=None, max_length=60)
    mission_text_en: str | None = Field(default=None, max_length=250)
    mission_text_he: str | None = Field(default=None, max_length=250)

    difference_title_en: str | None = Field(default=None, max_length=60)
    difference_title_he: str | None = Field(default=None, max_length=60)
    difference_intro_en: str | None = Field(default=None, max_length=120)
    difference_intro_he: str | None = Field(default=None, max_length=120)
    difference_paragraph_en: str | None = Field(default=None, max_length=350)
    difference_paragraph_he: str | None = Field(default=None, max_length=350)
    cta_text_en: str | None = Field(default=None, max_length=40)
    cta_text_he: str | None = Field(default=None, max_length=40)
    cta_link: SafeLinkString | None = Field(default=None, max_length=255)
    stat_1_number: str | None = Field(default=None, max_length=12)
    stat_1_label_en: str | None = Field(default=None, max_length=40)
    stat_1_label_he: str | None = Field(default=None, max_length=40)
    stat_2_number: str | None = Field(default=None, max_length=12)
    stat_2_label_en: str | None = Field(default=None, max_length=40)
    stat_2_label_he: str | None = Field(default=None, max_length=40)
    stat_3_number: str | None = Field(default=None, max_length=12)
    stat_3_label_en: str | None = Field(default=None, max_length=40)
    stat_3_label_he: str | None = Field(default=None, max_length=40)


class AboutPageContentUpdate(AboutPageContentBase):
    pass


class AboutPageContentRead(AboutPageContentBase, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class AboutPageContentPublic(AboutPageContentBase, ORMModel):
    """Fields the public About page needs — no internal id/audit timestamps."""
```

- [ ] **Step 2: Verify it imports cleanly**

Run: `cd backend && python -c "from app.schemas.about_page_content import AboutPageContentRead; print('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/about_page_content.py
git commit -m "feat: add about_page_content Pydantic schemas"
```

---

### Task 3: Backend router + registration + upload folder

**Files:**
- Create: `backend/app/api/v1/endpoints/about_page_content.py`
- Modify: `backend/app/api/v1/router.py`
- Modify: `backend/app/api/v1/endpoints/uploads.py`

**Interfaces:**
- Consumes: `AboutPageContent` model (Task 1), `AboutPageContentPublic`/`Read`/`Update` schemas (Task 2), `require_admin` from `app.api.dependencies`, `record_audit` from `app.services.audit_service`.
- Produces: `public_router`, `admin_router` in `about_page_content.py`, mounted at `/about-page-content` and `/admin/about-page-content`.

- [ ] **Step 1: Write the router**

Create `backend/app/api/v1/endpoints/about_page_content.py`:

```python
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_admin
from app.db.database import get_db
from app.models.about_page_content import AboutPageContent
from app.models.admin import Admin
from app.schemas.about_page_content import (
    AboutPageContentPublic,
    AboutPageContentRead,
    AboutPageContentUpdate,
)
from app.services.audit_service import record_audit


public_router = APIRouter()
admin_router = APIRouter()


def get_or_create_content(db: Session) -> AboutPageContent:
    """Return the singleton About page content, creating it if absent."""
    content = db.scalar(select(AboutPageContent).order_by(AboutPageContent.id))
    if content is None:
        content = AboutPageContent()
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


@public_router.get("", response_model=AboutPageContentPublic)
def read_public_about_content(db: Session = Depends(get_db)) -> AboutPageContent:
    return get_or_create_content(db)


@admin_router.get("", response_model=AboutPageContentRead)
def read_admin_about_content(
    db: Session = Depends(get_db),
    _: Admin = Depends(require_admin),
) -> AboutPageContent:
    return get_or_create_content(db)


@admin_router.put("", response_model=AboutPageContentRead)
def update_about_content(
    data: AboutPageContentUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(require_admin),
) -> AboutPageContent:
    content = get_or_create_content(db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    record_audit(
        db,
        admin_id=current_admin.id,
        action="update",
        entity_type="about_page_content",
        entity_id=content.id,
    )
    return content
```

- [ ] **Step 2: Register the router**

In `backend/app/api/v1/router.py`, add `about_page_content` to the import block (alphabetically first, since `about_page_content` < `admins`):

```python
from app.api.v1.endpoints import (
    about_page_content,
    admins,
    audit_logs,
    auth,
    dashboard,
    gallery,
    homepage_video_section,
    messages,
    partners,
    production_projects,
    projects,
    quote_requests,
    services,
    site_content,
    site_settings,
    testimonials,
    uploads,
)
```

Then add the two `include_router` calls right after the `health_check` block and before `auth.router` (or anywhere in the file — order doesn't affect routing, but keep it near the top for readability):

```python
api_router.include_router(
    about_page_content.public_router,
    prefix="/about-page-content",
    tags=["about page content"],
)
api_router.include_router(
    about_page_content.admin_router,
    prefix="/admin/about-page-content",
    tags=["admin: about page content"],
)
```

- [ ] **Step 3: Add the `about` upload folder**

In `backend/app/api/v1/endpoints/uploads.py`, update the `UploadFolder` literal:

```python
UploadFolder = Literal[
    "projects",
    "services",
    "partners",
    "gallery",
    "videos",
    "production-projects",
    "about",
]
```

- [ ] **Step 4: Verify the app boots and routes exist**

Run: `cd backend && python -c "from app.main import app; paths = {r.path for r in app.routes}; assert '/api/v1/about-page-content' in paths; assert '/api/v1/admin/about-page-content' in paths; print('ok')"`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/v1/endpoints/about_page_content.py backend/app/api/v1/router.py backend/app/api/v1/endpoints/uploads.py
git commit -m "feat: add about_page_content public/admin endpoints"
```

---

### Task 4: Alembic migration with seed row

**Files:**
- Create: `backend/alembic/versions/20260709_0001_add_about_page_content.py`

**Interfaces:**
- Consumes: current migration head `20260708_0002` (verified via `alembic/versions` listing).
- Produces: `about_page_content` table + one seeded row, matching the "Seed content" block above verbatim.

- [ ] **Step 1: Write the migration**

Create `backend/alembic/versions/20260709_0001_add_about_page_content.py`:

```python
"""add about_page_content

Revision ID: 20260709_0001
Revises: 20260708_0002
Create Date: 2026-07-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260709_0001"
down_revision = "20260708_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "about_page_content",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title_en", sa.String(60), nullable=True),
        sa.Column("title_he", sa.String(60), nullable=True),
        sa.Column("subtitle_en", sa.String(120), nullable=True),
        sa.Column("subtitle_he", sa.String(120), nullable=True),
        sa.Column("paragraph_1_en", sa.String(350), nullable=True),
        sa.Column("paragraph_1_he", sa.String(350), nullable=True),
        sa.Column("paragraph_2_en", sa.String(350), nullable=True),
        sa.Column("paragraph_2_he", sa.String(350), nullable=True),
        sa.Column("bullet_1_en", sa.String(90), nullable=True),
        sa.Column("bullet_1_he", sa.String(90), nullable=True),
        sa.Column("bullet_2_en", sa.String(90), nullable=True),
        sa.Column("bullet_2_he", sa.String(90), nullable=True),
        sa.Column("bullet_3_en", sa.String(90), nullable=True),
        sa.Column("bullet_3_he", sa.String(90), nullable=True),
        sa.Column("bullet_4_en", sa.String(90), nullable=True),
        sa.Column("bullet_4_he", sa.String(90), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("experience_number", sa.String(12), nullable=True),
        sa.Column("experience_label_en", sa.String(40), nullable=True),
        sa.Column("experience_label_he", sa.String(40), nullable=True),
        sa.Column("vision_title_en", sa.String(60), nullable=True),
        sa.Column("vision_title_he", sa.String(60), nullable=True),
        sa.Column("vision_text_en", sa.String(250), nullable=True),
        sa.Column("vision_text_he", sa.String(250), nullable=True),
        sa.Column("mission_title_en", sa.String(60), nullable=True),
        sa.Column("mission_title_he", sa.String(60), nullable=True),
        sa.Column("mission_text_en", sa.String(250), nullable=True),
        sa.Column("mission_text_he", sa.String(250), nullable=True),
        sa.Column("difference_title_en", sa.String(60), nullable=True),
        sa.Column("difference_title_he", sa.String(60), nullable=True),
        sa.Column("difference_intro_en", sa.String(120), nullable=True),
        sa.Column("difference_intro_he", sa.String(120), nullable=True),
        sa.Column("difference_paragraph_en", sa.String(350), nullable=True),
        sa.Column("difference_paragraph_he", sa.String(350), nullable=True),
        sa.Column("cta_text_en", sa.String(40), nullable=True),
        sa.Column("cta_text_he", sa.String(40), nullable=True),
        sa.Column("cta_link", sa.String(255), nullable=True),
        sa.Column("stat_1_number", sa.String(12), nullable=True),
        sa.Column("stat_1_label_en", sa.String(40), nullable=True),
        sa.Column("stat_1_label_he", sa.String(40), nullable=True),
        sa.Column("stat_2_number", sa.String(12), nullable=True),
        sa.Column("stat_2_label_en", sa.String(40), nullable=True),
        sa.Column("stat_2_label_he", sa.String(40), nullable=True),
        sa.Column("stat_3_number", sa.String(12), nullable=True),
        sa.Column("stat_3_label_en", sa.String(40), nullable=True),
        sa.Column("stat_3_label_he", sa.String(40), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    about_page_content = sa.table(
        "about_page_content",
        sa.column("title_en", sa.String),
        sa.column("title_he", sa.String),
        sa.column("subtitle_en", sa.String),
        sa.column("subtitle_he", sa.String),
        sa.column("paragraph_1_en", sa.String),
        sa.column("paragraph_1_he", sa.String),
        sa.column("paragraph_2_en", sa.String),
        sa.column("paragraph_2_he", sa.String),
        sa.column("bullet_1_en", sa.String),
        sa.column("bullet_1_he", sa.String),
        sa.column("bullet_2_en", sa.String),
        sa.column("bullet_2_he", sa.String),
        sa.column("bullet_3_en", sa.String),
        sa.column("bullet_3_he", sa.String),
        sa.column("bullet_4_en", sa.String),
        sa.column("bullet_4_he", sa.String),
        sa.column("image_url", sa.String),
        sa.column("experience_number", sa.String),
        sa.column("experience_label_en", sa.String),
        sa.column("experience_label_he", sa.String),
        sa.column("vision_title_en", sa.String),
        sa.column("vision_title_he", sa.String),
        sa.column("vision_text_en", sa.String),
        sa.column("vision_text_he", sa.String),
        sa.column("mission_title_en", sa.String),
        sa.column("mission_title_he", sa.String),
        sa.column("mission_text_en", sa.String),
        sa.column("mission_text_he", sa.String),
        sa.column("difference_title_en", sa.String),
        sa.column("difference_title_he", sa.String),
        sa.column("difference_intro_en", sa.String),
        sa.column("difference_intro_he", sa.String),
        sa.column("difference_paragraph_en", sa.String),
        sa.column("difference_paragraph_he", sa.String),
        sa.column("cta_text_en", sa.String),
        sa.column("cta_text_he", sa.String),
        sa.column("cta_link", sa.String),
        sa.column("stat_1_number", sa.String),
        sa.column("stat_1_label_en", sa.String),
        sa.column("stat_1_label_he", sa.String),
        sa.column("stat_2_number", sa.String),
        sa.column("stat_2_label_en", sa.String),
        sa.column("stat_2_label_he", sa.String),
        sa.column("stat_3_number", sa.String),
        sa.column("stat_3_label_en", sa.String),
        sa.column("stat_3_label_he", sa.String),
    )

    connection = op.get_bind()
    exists = connection.execute(
        sa.select(sa.literal(1)).select_from(about_page_content)
    ).first()
    if not exists:
        connection.execute(
            about_page_content.insert().values(
                title_en="Our success story",
                title_he="סיפור ההצלחה שלנו",
                subtitle_en="A journey of passion in architecture, begun to deliver the quality you deserve.",
                subtitle_he="מסע של תשוקה בעולם האדריכלות למען איכות.",
                paragraph_1_en=(
                    "T.A.S was founded with a clear vision to drive a real shift in the "
                    "building cladding and aluminum systems industry. From day one we have "
                    "focused on superior quality, strict engineering standards and on-time "
                    "delivery."
                ),
                paragraph_1_he="T.A.S הוקמה בחזון ברור לחולל שינוי מהותי בתעשיית קירוי מבנים ומערכות אלומיניום.",
                paragraph_2_en=(
                    "We are proud to employ leading professionals and engineers, and we "
                    "continually adopt the latest manufacturing technology to deliver "
                    "sustainable, safe solutions for the residential and commercial sectors."
                ),
                paragraph_2_he="אנו גאים להעסיק אנשי מקצוע ומהנדסים מובילים לפיתוח בר קיימא עבור המגזר הפרטי והעסקי.",
                bullet_1_en="Applying the strictest safety and quality standards",
                bullet_1_he="יישום תקני בטיחות ואיכות מחמירים",
                bullet_2_en="Using internationally certified raw materials",
                bullet_2_he="שימוש בחומרי גלם באישור בינלאומי",
                bullet_3_en="A skilled and experienced technical team",
                bullet_3_he="צוות טכני מיומן ומנוסה",
                bullet_4_en="Comprehensive after-sales service and genuine warranty",
                bullet_4_he="שירותי לאחר המכירה ואחריות מקיפה",
                image_url="/images/our-success-story.png",
                experience_number="10+",
                experience_label_en="Years of experience",
                experience_label_he="שנות ניסיון",
                vision_title_en="Our vision",
                vision_title_he="החזון שלנו",
                vision_text_en=(
                    "To be the first choice and leading company providing innovative "
                    "aluminum and glass solutions in the region, setting new standards for "
                    "quality, design and reliability."
                ),
                vision_text_he="להיות הבחירה הראשונה והחברה המובילה במתן פתרונות אלומיניום וזכוכית חדשניים ואיכותיים ביות",
                mission_title_en="Our mission",
                mission_title_he="המשימה שלנו",
                mission_text_en=(
                    "To fully meet our clients' aspirations through advanced, "
                    "time-resistant systems, with the highest professional integrity and "
                    "exceptional service before, during and after execution."
                ),
                mission_text_he="לספק מענה מלא לדרישות הלקוחות בעזרת ייצור מתקדם ואמינות מתמשכת לפני, תוך ולאחר הייצור.",
                difference_title_en="Have a new project? Let us help you bring it to life.",
                difference_title_he="האם יש לך פרויקט חדש? תן לנו לעזור לך לממש אותו.",
                difference_intro_en=(
                    "We're here to provide engineering consultation and competitive quotes "
                    "for your next project."
                ),
                difference_intro_he="אנו כאן לייעוץ הנדסי והצעות מחיר תחרותיות לפרויקט הבא שלך.",
                difference_paragraph_en=(
                    "From concept to installation, our engineering team partners with you "
                    "at every step, delivering precision-engineered aluminum and glass "
                    "systems backed by rigorous quality control and a genuine warranty."
                ),
                difference_paragraph_he=(
                    "מהרעיון ועד ההתקנה, צוות ההנדסה שלנו לצדכם בכל שלב – ומספק מערכות "
                    "אלומיניום וזכוכית מהונדסות בדייקנות, בגיבוי בקרת איכות קפדנית ואחריות אמיתית."
                ),
                cta_text_en="Contact us now",
                cta_text_he="צור קשר עכשיו",
                cta_link="/request-quote",
                stat_1_number="250+",
                stat_1_label_en="Completed projects",
                stat_1_label_he="פרויקטים שהושלמו",
                stat_2_number="10+",
                stat_2_label_en="Years of experience",
                stat_2_label_he="שנות ניסיון",
                stat_3_number="5",
                stat_3_label_en="Years warranty",
                stat_3_label_he="שנות אחריות",
            )
        )


def downgrade() -> None:
    op.drop_table("about_page_content")
```

- [ ] **Step 2: Run the migration against the dev DB**

Run: `cd backend && alembic upgrade head`
Expected: no errors; last line mentions revision `20260709_0001`.

- [ ] **Step 3: Verify the seed row**

Run: `cd backend && python -c "
from app.db.database import SessionLocal
from app.models.about_page_content import AboutPageContent
db = SessionLocal()
row = db.query(AboutPageContent).first()
assert row is not None
assert row.title_en == 'Our success story'
assert row.image_url == '/images/our-success-story.png'
assert row.stat_3_number == '5'
print('seed ok')
"`
Expected: `seed ok`

- [ ] **Step 4: Commit**

```bash
git add backend/alembic/versions/20260709_0001_add_about_page_content.py
git commit -m "feat: migrate and seed about_page_content"
```

---

### Task 5: Backend tests

**Files:**
- Create: `backend/tests/test_about_page_content.py`

**Interfaces:**
- Consumes: `client`, `auth_headers` fixtures from `backend/tests/conftest.py` (already exist, no changes needed).

- [ ] **Step 1: Write the tests**

Create `backend/tests/test_about_page_content.py`:

```python
from fastapi.testclient import TestClient


def test_public_about_content_returns_seeded_defaults(client: TestClient) -> None:
    response = client.get("/api/v1/about-page-content")
    assert response.status_code == 200
    payload = response.json()
    assert payload["title_en"] == "Our success story"
    assert payload["title_he"] == "סיפור ההצלחה שלנו"
    assert payload["image_url"] == "/images/our-success-story.png"
    assert payload["stat_1_number"] == "250+"
    # Public payload excludes internal audit fields.
    assert "id" not in payload
    assert "created_at" not in payload


def test_public_about_content_requires_no_auth(client: TestClient) -> None:
    assert client.get("/api/v1/about-page-content").status_code == 200


def test_admin_about_content_requires_auth(client: TestClient) -> None:
    assert client.get("/api/v1/admin/about-page-content").status_code == 401
    assert client.put("/api/v1/admin/about-page-content", json={}).status_code == 401


def test_admin_can_read_and_update_about_content(client: TestClient, auth_headers) -> None:
    headers = auth_headers()

    read = client.get("/api/v1/admin/about-page-content", headers=headers)
    assert read.status_code == 200
    assert "id" in read.json()

    update = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={
            "title_en": "Updated title",
            "title_he": "כותרת מעודכנת",
            "stat_1_number": "500+",
        },
    )
    assert update.status_code == 200
    assert update.json()["title_en"] == "Updated title"
    assert update.json()["stat_1_number"] == "500+"

    public = client.get("/api/v1/about-page-content")
    assert public.json()["title_en"] == "Updated title"


def test_admin_update_is_partial(client: TestClient, auth_headers) -> None:
    headers = auth_headers()

    client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_en": "First update"},
    )
    second = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"subtitle_en": "Second update"},
    )
    assert second.status_code == 200
    body = second.json()
    assert body["title_en"] == "First update"
    assert body["subtitle_en"] == "Second update"


def test_admin_update_rejects_over_limit_title(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_en": "x" * 61},
    )
    assert response.status_code == 422


def test_admin_update_rejects_over_limit_paragraph(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"paragraph_1_en": "x" * 351},
    )
    assert response.status_code == 422


def test_admin_update_rejects_unsafe_cta_link(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"cta_link": "javascript:alert(1)"},
    )
    assert response.status_code == 422


def test_admin_update_accepts_relative_cta_link(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"cta_link": "/contact"},
    )
    assert response.status_code == 200
    assert response.json()["cta_link"] == "/contact"


def test_admin_update_records_audit_log(client: TestClient, auth_headers) -> None:
    headers = auth_headers(role="super_admin")
    client.put(
        "/api/v1/admin/about-page-content",
        headers=headers,
        json={"title_en": "Audited update"},
    )
    logs = client.get("/api/v1/admin/audit-logs", headers=headers)
    assert logs.status_code == 200
    entries = logs.json()
    assert any(
        entry["action"] == "update" and entry["entity_type"] == "about_page_content"
        for entry in entries
    )
```

- [ ] **Step 2: Run the tests**

Run: `cd backend && pytest tests/test_about_page_content.py -v`
Expected: all 10 tests PASS.

- [ ] **Step 3: Run the full backend suite to check for regressions**

Run: `cd backend && pytest -q`
Expected: all tests PASS (no regressions in other test files).

- [ ] **Step 4: Commit**

```bash
git add backend/tests/test_about_page_content.py
git commit -m "test: add about_page_content backend coverage"
```

---

### Task 6: Frontend types + API client + upload folder

**Files:**
- Modify: `frontend/src/api/types.ts`
- Create: `frontend/src/api/aboutPageContent.ts`
- Modify: `frontend/src/api/uploads.ts`

**Interfaces:**
- Produces: `AboutPageContentDto` (all 46 content fields as `string | null`), `getAboutPageContent`, `getAdminAboutPageContent`, `updateAboutPageContent` — consumed by Task 7 (adapter/defaults) and Task 9/10 (public page/admin page).

- [ ] **Step 1: Add the DTO**

In `frontend/src/api/types.ts`, add after the `HomepageVideoSectionDto` block:

```typescript
export interface AboutPageContentDto {
  title_en: string | null; title_he: string | null;
  subtitle_en: string | null; subtitle_he: string | null;
  paragraph_1_en: string | null; paragraph_1_he: string | null;
  paragraph_2_en: string | null; paragraph_2_he: string | null;
  bullet_1_en: string | null; bullet_1_he: string | null;
  bullet_2_en: string | null; bullet_2_he: string | null;
  bullet_3_en: string | null; bullet_3_he: string | null;
  bullet_4_en: string | null; bullet_4_he: string | null;
  image_url: string | null;
  experience_number: string | null;
  experience_label_en: string | null; experience_label_he: string | null;
  vision_title_en: string | null; vision_title_he: string | null;
  vision_text_en: string | null; vision_text_he: string | null;
  mission_title_en: string | null; mission_title_he: string | null;
  mission_text_en: string | null; mission_text_he: string | null;
  difference_title_en: string | null; difference_title_he: string | null;
  difference_intro_en: string | null; difference_intro_he: string | null;
  difference_paragraph_en: string | null; difference_paragraph_he: string | null;
  cta_text_en: string | null; cta_text_he: string | null;
  cta_link: string | null;
  stat_1_number: string | null; stat_1_label_en: string | null; stat_1_label_he: string | null;
  stat_2_number: string | null; stat_2_label_en: string | null; stat_2_label_he: string | null;
  stat_3_number: string | null; stat_3_label_en: string | null; stat_3_label_he: string | null;
}
```

- [ ] **Step 2: Add the API client**

Create `frontend/src/api/aboutPageContent.ts`:

```typescript
import { apiRequest } from './client';
import type { AboutPageContentDto } from './types';

export const getAboutPageContent = () =>
  apiRequest<AboutPageContentDto>('/about-page-content');

export const getAdminAboutPageContent = () =>
  apiRequest<AboutPageContentDto>('/admin/about-page-content', { authenticated: true });

export const updateAboutPageContent = (data: Partial<AboutPageContentDto>) =>
  apiRequest<AboutPageContentDto>('/admin/about-page-content', {
    method: 'PUT',
    body: JSON.stringify(data),
    authenticated: true,
  });
```

- [ ] **Step 3: Add the `about` upload folder**

In `frontend/src/api/uploads.ts`, update the union:

```typescript
export type UploadFolder = 'projects' | 'services' | 'partners' | 'gallery' | 'videos' | 'production-projects' | 'about';
```

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: no errors (new files are self-contained; nothing consumes them yet).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/types.ts frontend/src/api/aboutPageContent.ts frontend/src/api/uploads.ts
git commit -m "feat: add about_page_content DTO and API client"
```

---

### Task 7: Frontend adapter + default fallback content + adapter test

**Files:**
- Modify: `frontend/src/api/adapters.ts`
- Create: `frontend/src/data/aboutPageContent.ts`
- Modify: `frontend/src/api/adapters.test.ts`

**Interfaces:**
- Consumes: `AboutPageContentDto` (Task 6), the existing private `pick(locale, he, en)` helper already defined in `adapters.ts`.
- Produces: `AboutContentView` interface, `toAboutContentView(dto, locale): AboutContentView`, `defaultAboutPageContent: AboutPageContentDto` — consumed by Task 9 (public page) and Task 10 (admin page's initial/fallback state).

- [ ] **Step 1: Create the default fallback DTO**

Create `frontend/src/data/aboutPageContent.ts`:

```typescript
import type { AboutPageContentDto } from '@/api/types';

// Mirrors the DB seed row (migration 20260709_0001) verbatim, so a failed API
// fetch renders identically to a freshly-seeded backend.
export const defaultAboutPageContent: AboutPageContentDto = {
  title_en: 'Our success story',
  title_he: 'סיפור ההצלחה שלנו',
  subtitle_en: 'A journey of passion in architecture, begun to deliver the quality you deserve.',
  subtitle_he: 'מסע של תשוקה בעולם האדריכלות למען איכות.',
  paragraph_1_en:
    'T.A.S was founded with a clear vision to drive a real shift in the building cladding and aluminum systems industry. From day one we have focused on superior quality, strict engineering standards and on-time delivery.',
  paragraph_1_he: 'T.A.S הוקמה בחזון ברור לחולל שינוי מהותי בתעשיית קירוי מבנים ומערכות אלומיניום.',
  paragraph_2_en:
    'We are proud to employ leading professionals and engineers, and we continually adopt the latest manufacturing technology to deliver sustainable, safe solutions for the residential and commercial sectors.',
  paragraph_2_he: 'אנו גאים להעסיק אנשי מקצוע ומהנדסים מובילים לפיתוח בר קיימא עבור המגזר הפרטי והעסקי.',
  bullet_1_en: 'Applying the strictest safety and quality standards',
  bullet_1_he: 'יישום תקני בטיחות ואיכות מחמירים',
  bullet_2_en: 'Using internationally certified raw materials',
  bullet_2_he: 'שימוש בחומרי גלם באישור בינלאומי',
  bullet_3_en: 'A skilled and experienced technical team',
  bullet_3_he: 'צוות טכני מיומן ומנוסה',
  bullet_4_en: 'Comprehensive after-sales service and genuine warranty',
  bullet_4_he: 'שירותי לאחר המכירה ואחריות מקיפה',
  image_url: '/images/our-success-story.png',
  experience_number: '10+',
  experience_label_en: 'Years of experience',
  experience_label_he: 'שנות ניסיון',
  vision_title_en: 'Our vision',
  vision_title_he: 'החזון שלנו',
  vision_text_en:
    'To be the first choice and leading company providing innovative aluminum and glass solutions in the region, setting new standards for quality, design and reliability.',
  vision_text_he: 'להיות הבחירה הראשונה והחברה המובילה במתן פתרונות אלומיניום וזכוכית חדשניים ואיכותיים ביות',
  mission_title_en: 'Our mission',
  mission_title_he: 'המשימה שלנו',
  mission_text_en:
    "To fully meet our clients' aspirations through advanced, time-resistant systems, with the highest professional integrity and exceptional service before, during and after execution.",
  mission_text_he: 'לספק מענה מלא לדרישות הלקוחות בעזרת ייצור מתקדם ואמינות מתמשכת לפני, תוך ולאחר הייצור.',
  difference_title_en: 'Have a new project? Let us help you bring it to life.',
  difference_title_he: 'האם יש לך פרויקט חדש? תן לנו לעזור לך לממש אותו.',
  difference_intro_en: "We're here to provide engineering consultation and competitive quotes for your next project.",
  difference_intro_he: 'אנו כאן לייעוץ הנדסי והצעות מחיר תחרותיות לפרויקט הבא שלך.',
  difference_paragraph_en:
    'From concept to installation, our engineering team partners with you at every step, delivering precision-engineered aluminum and glass systems backed by rigorous quality control and a genuine warranty.',
  difference_paragraph_he:
    'מהרעיון ועד ההתקנה, צוות ההנדסה שלנו לצדכם בכל שלב – ומספק מערכות אלומיניום וזכוכית מהונדסות בדייקנות, בגיבוי בקרת איכות קפדנית ואחריות אמיתית.',
  cta_text_en: 'Contact us now',
  cta_text_he: 'צור קשר עכשיו',
  cta_link: '/request-quote',
  stat_1_number: '250+',
  stat_1_label_en: 'Completed projects',
  stat_1_label_he: 'פרויקטים שהושלמו',
  stat_2_number: '10+',
  stat_2_label_en: 'Years of experience',
  stat_2_label_he: 'שנות ניסיון',
  stat_3_number: '5',
  stat_3_label_en: 'Years warranty',
  stat_3_label_he: 'שנות אחריות',
};
```

- [ ] **Step 2: Add the adapter**

In `frontend/src/api/adapters.ts`, add near the other `toXView` functions (the private `pick(locale, he, en)` function already exists in this file — reuse it, do not redefine it):

```typescript
export interface AboutContentView {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  bullets: string[];
  imageUrl: string;
  experienceNumber: string;
  experienceLabel: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
  differenceTitle: string;
  differenceIntro: string;
  differenceParagraph: string;
  ctaText: string;
  ctaLink: string;
  stats: { number: string; label: string }[];
}

export const toAboutContentView = (dto: AboutPageContentDto, locale: Locale): AboutContentView => ({
  title: pick(locale, dto.title_he, dto.title_en),
  subtitle: pick(locale, dto.subtitle_he, dto.subtitle_en),
  paragraph1: pick(locale, dto.paragraph_1_he, dto.paragraph_1_en),
  paragraph2: pick(locale, dto.paragraph_2_he, dto.paragraph_2_en),
  bullets: [
    pick(locale, dto.bullet_1_he, dto.bullet_1_en),
    pick(locale, dto.bullet_2_he, dto.bullet_2_en),
    pick(locale, dto.bullet_3_he, dto.bullet_3_en),
    pick(locale, dto.bullet_4_he, dto.bullet_4_en),
  ],
  imageUrl: dto.image_url ?? '',
  experienceNumber: dto.experience_number ?? '',
  experienceLabel: pick(locale, dto.experience_label_he, dto.experience_label_en),
  visionTitle: pick(locale, dto.vision_title_he, dto.vision_title_en),
  visionText: pick(locale, dto.vision_text_he, dto.vision_text_en),
  missionTitle: pick(locale, dto.mission_title_he, dto.mission_title_en),
  missionText: pick(locale, dto.mission_text_he, dto.mission_text_en),
  differenceTitle: pick(locale, dto.difference_title_he, dto.difference_title_en),
  differenceIntro: pick(locale, dto.difference_intro_he, dto.difference_intro_en),
  differenceParagraph: pick(locale, dto.difference_paragraph_he, dto.difference_paragraph_en),
  ctaText: pick(locale, dto.cta_text_he, dto.cta_text_en),
  ctaLink: dto.cta_link ?? '/request-quote',
  stats: [
    { number: dto.stat_1_number ?? '', label: pick(locale, dto.stat_1_label_he, dto.stat_1_label_en) },
    { number: dto.stat_2_number ?? '', label: pick(locale, dto.stat_2_label_he, dto.stat_2_label_en) },
    { number: dto.stat_3_number ?? '', label: pick(locale, dto.stat_3_label_he, dto.stat_3_label_en) },
  ],
});
```

Add `import type { AboutPageContentDto } from './types';` to the top of `adapters.ts` if `types.ts` isn't already imported wholesale (check the existing import line — if it already does `import type { ..., Locale, ... } from './types'`, just add `AboutPageContentDto` to that same named-import list rather than a new import line).

- [ ] **Step 3: Add the adapter test**

In `frontend/src/api/adapters.test.ts`, add (following the file's existing `describe`/`it` + `toMatchObject` style — inspect the top of the file for the exact import line and append to it rather than duplicating imports):

```typescript
import { toAboutContentView } from './adapters';
import type { AboutPageContentDto } from './types';

describe('toAboutContentView', () => {
  const dto: AboutPageContentDto = {
    title_en: 'Success', title_he: 'הצלחה',
    subtitle_en: 'Sub EN', subtitle_he: 'תת כותרת',
    paragraph_1_en: 'P1 EN', paragraph_1_he: 'פסקה 1',
    paragraph_2_en: 'P2 EN', paragraph_2_he: 'פסקה 2',
    bullet_1_en: 'B1', bullet_1_he: 'נ1',
    bullet_2_en: 'B2', bullet_2_he: 'נ2',
    bullet_3_en: 'B3', bullet_3_he: 'נ3',
    bullet_4_en: 'B4', bullet_4_he: 'נ4',
    image_url: '/images/success.png',
    experience_number: '10+',
    experience_label_en: 'Years', experience_label_he: 'שנים',
    vision_title_en: 'Vision', vision_title_he: 'חזון',
    vision_text_en: 'Vision text', vision_text_he: 'טקסט חזון',
    mission_title_en: 'Mission', mission_title_he: 'משימה',
    mission_text_en: 'Mission text', mission_text_he: 'טקסט משימה',
    difference_title_en: 'Difference', difference_title_he: 'הבדל',
    difference_intro_en: 'Intro EN', difference_intro_he: 'מבוא',
    difference_paragraph_en: 'Diff paragraph', difference_paragraph_he: 'פסקת הבדל',
    cta_text_en: 'Go', cta_text_he: 'לך',
    cta_link: '/contact',
    stat_1_number: '1', stat_1_label_en: 'One', stat_1_label_he: 'אחד',
    stat_2_number: '2', stat_2_label_en: 'Two', stat_2_label_he: 'שתיים',
    stat_3_number: '3', stat_3_label_en: 'Three', stat_3_label_he: 'שלוש',
  };

  it('localizes to English', () => {
    const view = toAboutContentView(dto, 'en');
    expect(view).toMatchObject({
      title: 'Success',
      differenceTitle: 'Difference',
      ctaLink: '/contact',
      stats: [
        { number: '1', label: 'One' },
        { number: '2', label: 'Two' },
        { number: '3', label: 'Three' },
      ],
    });
  });

  it('localizes to Hebrew', () => {
    const view = toAboutContentView(dto, 'he');
    expect(view.title).toBe('הצלחה');
    expect(view.stats[0].label).toBe('אחד');
  });

  it('falls back to the other language when one is empty', () => {
    const partial: AboutPageContentDto = { ...dto, title_he: '' };
    expect(toAboutContentView(partial, 'he').title).toBe('Success');
  });
});
```

- [ ] **Step 4: Run the adapter tests**

Run: `cd frontend && npx vitest run src/api/adapters.test.ts`
Expected: all tests PASS, including the 3 new ones.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/adapters.ts frontend/src/data/aboutPageContent.ts frontend/src/api/adapters.test.ts
git commit -m "feat: add about content adapter and fallback defaults"
```

---

### Task 8: `CTASection` optional description prop

**Files:**
- Modify: `frontend/src/components/common/CTASection.tsx`

**Interfaces:**
- Produces: new optional `description?: string` prop, backward-compatible (every existing call site that doesn't pass it renders byte-identical to today).

- [ ] **Step 1: Add the prop and conditional render**

In `frontend/src/components/common/CTASection.tsx`, update the interface and destructuring:

```tsx
interface CTASectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

export function CTASection({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink = "/request-quote",
  className
}: CTASectionProps) {
```

Then insert a new paragraph between the existing subtitle `<p>` and the buttons `<div>`:

```tsx
          <p className="text-xl text-gray-300 mb-10 font-light">
            {finalSubtitle}
          </p>
          {description && (
            <p className="text-base text-gray-400 mb-10 font-light max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
```

No default fallback text for `description` (unlike `title`/`subtitle`/`buttonText`) — when omitted, nothing renders, so every page that calls `<CTASection />` without a `description` (e.g. any other page using it besides the About page) is visually unchanged.

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/common/CTASection.tsx
git commit -m "feat: add optional description prop to CTASection"
```

---

### Task 9: Wire the public About page

**Files:**
- Modify: `frontend/src/app/About.tsx`

**Interfaces:**
- Consumes: `getAboutPageContent` (Task 6), `toAboutContentView`/`AboutContentView` (Task 7), `defaultAboutPageContent` (Task 7), `AboutPageContentDto` (Task 6), `normalizeImageUrl` (`@/lib/utils`, already exists).

- [ ] **Step 1: Replace the whole file**

Replace the full content of `frontend/src/app/About.tsx` with:

```tsx
import { PageHero } from '@/components/common/PageHero';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { useEffect, useState } from 'react';
import { getAboutPageContent } from '@/api/aboutPageContent';
import { toAboutContentView } from '@/api/adapters';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import type { AboutPageContentDto } from '@/api/types';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { normalizeImageUrl } from '@/lib/utils';

export function About() {
  const { t, language } = useLanguage();
  const [aboutContent, setAboutContent] = useState<AboutPageContentDto>(defaultAboutPageContent);

  useEffect(() => {
    getAboutPageContent()
      .then(setAboutContent)
      .catch(() => setAboutContent(defaultAboutPageContent));
    // Run once on mount; the view below re-derives from `language` on every
    // render, so a language toggle updates instantly without refetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = toAboutContentView(aboutContent, language);

  return (
    <div className="bg-brand-surface">
      <PageHero 
        title={t("על T.A.S", "About T.A.S")}
        subtitle={t("השותף המהימן שלך במתן פתרונות חזית זכוכית ואלומיניום.", "Your trusted partner in delivering the finest glass and aluminum facade solutions.")}
        breadcrumbs={[{ label: t('אודות', "About"), path: '/about' }]}
        image="/images/backgrounds/tas-bg-about.webp"
      />

      <section className="relative isolate overflow-hidden py-24">
        {/* Subtle architectural backdrop — navy-washed for text readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-about.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.24]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-surface/82 via-brand-surface/52 to-brand-surface/85"
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader 
                title={content.title} 
                subtitle={content.subtitle}
              />
              <p className="text-brand-silver mb-6 leading-relaxed text-lg">
                {content.paragraph1}
              </p>
              <p className="text-brand-silver mb-8 leading-relaxed text-lg">
                {content.paragraph2}
              </p>
              
              <ul className="space-y-4">
                {content.bullets.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="text-brand-gold w-5 h-5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative"
            >
              <img
                src={normalizeImageUrl(content.imageUrl)}
                alt="Our Engineering Team"
                className="w-full h-[500px] object-cover rounded-sm shadow-2xl shadow-brand-border/50"
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-navy border-8 border-brand-surface p-6 hidden md:flex flex-col justify-center text-center">
                <span className="text-brand-gold text-5xl font-bold mb-2" dir="ltr">{content.experienceNumber}</span>
                <span className="text-white">{content.experienceLabel}</span>
              </div>
            </motion.div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {content.stats.map((stat, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-brand-navy p-8 text-center border-b-4 border-transparent hover:border-brand-gold transition-colors"
               >
                 <div className="text-4xl lg:text-5xl font-bold text-white mb-4" dir="ltr">{stat.number}</div>
                 <div className="text-brand-silver font-bold">{stat.label}</div>
               </motion.div>
            ))}
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-brand-navy text-white p-12"
            >
              <h3 className="text-3xl font-bold mb-6 text-brand-gold">{content.visionTitle}</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {content.visionText}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-navy border border-white/5 p-12"
            >
              <h3 className="text-3xl font-bold mb-6 text-white">{content.missionTitle}</h3>
              <p className="text-brand-silver leading-relaxed text-lg">
                {content.missionText}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection
        title={content.differenceTitle}
        subtitle={content.differenceIntro}
        description={content.differenceParagraph}
        buttonText={content.ctaText}
        buttonLink={content.ctaLink}
      />
    </div>
  );
}
```

Every class name, motion prop, and DOM structure is unchanged from the original — only the text/prop sources moved from `t(...)`/`publicStats` to `content.*`.

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/About.tsx
git commit -m "feat: wire About page to about_page_content API"
```

---

### Task 10: Admin page + navigation + route

**Files:**
- Create: `frontend/src/app/admin/AdminAboutContent.tsx`
- Modify: `frontend/src/components/admin/adminNavigation.ts`
- Modify: `frontend/src/components/admin/adminNavigation.test.ts`
- Modify: `frontend/src/app/App.tsx`

**Interfaces:**
- Consumes: `getAdminAboutPageContent`, `updateAboutPageContent` (Task 6), `defaultAboutPageContent` (Task 7), `AboutPageContentDto` (Task 6), `AdminPageHeader` (existing), `ImageUploadField` (existing, `folder="about"` per Task 3), `ApiError` (existing `@/api/client`).
- Produces: route `/admin/about-content`, nav item visible to both `admin` and `super_admin`.

- [ ] **Step 1: Write the admin page**

Create `frontend/src/app/admin/AdminAboutContent.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { ApiError } from '@/api/client';
import { getAdminAboutPageContent, updateAboutPageContent } from '@/api/aboutPageContent';
import type { AboutPageContentDto } from '@/api/types';
import { defaultAboutPageContent } from '@/data/aboutPageContent';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ImageUploadField } from '@/components/forms/ImageUploadField';
import { useLanguage } from '@/i18n';

type FieldKey = keyof AboutPageContentDto;
type Feedback = { kind: 'success' | 'error'; message: string } | null;

interface PairField { keyHe: FieldKey; keyEn: FieldKey; label: string; max: number; multiline?: boolean }
interface SingleField { key: FieldKey; label: string; max: number }

// Admin UI copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'תוכן אודות',
    save: 'שמירה', saving: 'שומר…', saved: 'הנתונים נשמרו בהצלחה.',
    error: 'שמירת הנתונים נכשלה. נסו שוב.', loadError: 'טעינת הנתונים נכשלה.',
    overLimit: 'החריגה ממכסת התווים תמנע שמירה.',
    heCol: 'עברית', enCol: 'אנגלית',
    sectionSuccess: 'סיפור ההצלחה', sectionVisionMission: 'חזון ומשימה', sectionDifference: 'ההבדל שלנו וסטטיסטיקות',
    imageLabel: 'תמונת סיפור ההצלחה',
    fields: {
      title: 'כותרת', subtitle: 'כותרת משנה', paragraph1: 'פסקה 1', paragraph2: 'פסקה 2',
      bullet1: 'נקודה 1', bullet2: 'נקודה 2', bullet3: 'נקודה 3', bullet4: 'נקודה 4',
      experienceNumber: 'מספר ותק', experienceLabel: 'תווית ותק',
      visionTitle: 'כותרת החזון', visionText: 'טקסט החזון',
      missionTitle: 'כותרת המשימה', missionText: 'טקסט המשימה',
      differenceTitle: 'כותרת', differenceIntro: 'טקסט מבוא', differenceParagraph: 'פסקה',
      ctaText: 'טקסט כפתור', ctaLink: 'קישור כפתור',
      stat1Number: 'סטטיסטיקה 1 — מספר', stat1Label: 'סטטיסטיקה 1 — תווית',
      stat2Number: 'סטטיסטיקה 2 — מספר', stat2Label: 'סטטיסטיקה 2 — תווית',
      stat3Number: 'סטטיסטיקה 3 — מספר', stat3Label: 'סטטיסטיקה 3 — תווית',
    },
  },
  en: {
    title: 'About Content',
    save: 'Save', saving: 'Saving…', saved: 'Saved successfully.',
    error: 'Could not save. Please try again.', loadError: 'Could not load. Please try again.',
    overLimit: 'Fields over the character limit will block saving.',
    heCol: 'Hebrew', enCol: 'English',
    sectionSuccess: 'Success Story', sectionVisionMission: 'Vision & Mission', sectionDifference: 'Difference & Stats',
    imageLabel: 'Success Story image',
    fields: {
      title: 'Title', subtitle: 'Subtitle', paragraph1: 'Paragraph 1', paragraph2: 'Paragraph 2',
      bullet1: 'Bullet 1', bullet2: 'Bullet 2', bullet3: 'Bullet 3', bullet4: 'Bullet 4',
      experienceNumber: 'Experience number', experienceLabel: 'Experience label',
      visionTitle: 'Vision title', visionText: 'Vision text',
      missionTitle: 'Mission title', missionText: 'Mission text',
      differenceTitle: 'Title', differenceIntro: 'Intro text', differenceParagraph: 'Paragraph',
      ctaText: 'Button text', ctaLink: 'Button link',
      stat1Number: 'Stat 1 — number', stat1Label: 'Stat 1 — label',
      stat2Number: 'Stat 2 — number', stat2Label: 'Stat 2 — label',
      stat3Number: 'Stat 3 — number', stat3Label: 'Stat 3 — label',
    },
  },
};

function TextField({
  label, value, max, dir, multiline, onChange,
}: {
  label: string; value: string; max: number; dir: 'rtl' | 'ltr'; multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const over = value.length > max;
  const baseClass = `w-full rounded bg-brand-navy px-3 py-2 text-white ${over ? 'border border-red-500' : ''}`;
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between text-sm font-bold text-brand-silver">
        <span>{label}</span>
        <span className={over ? 'text-xs text-red-400' : 'text-xs text-brand-silver/60'}>
          {value.length}/{max}
        </span>
      </span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={max}
          dir={dir}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      ) : (
        <input
          value={value}
          maxLength={max}
          dir={dir}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </label>
  );
}

export function AdminAboutContent() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;

  const [form, setForm] = useState<AboutPageContentDto>(defaultAboutPageContent);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminAboutPageContent()
      .then(setForm)
      .catch(() => setFeedback({ kind: 'error', message: copy.loadError }));
    // Run once on mount; copy is stable per language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const get = (key: FieldKey): string => (form[key] as string | null) ?? '';
  const set = (key: FieldKey, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const successPairs: PairField[] = [
    { keyHe: 'title_he', keyEn: 'title_en', label: copy.fields.title, max: 60 },
    { keyHe: 'subtitle_he', keyEn: 'subtitle_en', label: copy.fields.subtitle, max: 120 },
    { keyHe: 'paragraph_1_he', keyEn: 'paragraph_1_en', label: copy.fields.paragraph1, max: 350, multiline: true },
    { keyHe: 'paragraph_2_he', keyEn: 'paragraph_2_en', label: copy.fields.paragraph2, max: 350, multiline: true },
    { keyHe: 'bullet_1_he', keyEn: 'bullet_1_en', label: copy.fields.bullet1, max: 90 },
    { keyHe: 'bullet_2_he', keyEn: 'bullet_2_en', label: copy.fields.bullet2, max: 90 },
    { keyHe: 'bullet_3_he', keyEn: 'bullet_3_en', label: copy.fields.bullet3, max: 90 },
    { keyHe: 'bullet_4_he', keyEn: 'bullet_4_en', label: copy.fields.bullet4, max: 90 },
    { keyHe: 'experience_label_he', keyEn: 'experience_label_en', label: copy.fields.experienceLabel, max: 40 },
  ];
  const successSingles: SingleField[] = [
    { key: 'experience_number', label: copy.fields.experienceNumber, max: 12 },
  ];

  const visionMissionPairs: PairField[] = [
    { keyHe: 'vision_title_he', keyEn: 'vision_title_en', label: copy.fields.visionTitle, max: 60 },
    { keyHe: 'vision_text_he', keyEn: 'vision_text_en', label: copy.fields.visionText, max: 250, multiline: true },
    { keyHe: 'mission_title_he', keyEn: 'mission_title_en', label: copy.fields.missionTitle, max: 60 },
    { keyHe: 'mission_text_he', keyEn: 'mission_text_en', label: copy.fields.missionText, max: 250, multiline: true },
  ];

  const differencePairs: PairField[] = [
    { keyHe: 'difference_title_he', keyEn: 'difference_title_en', label: copy.fields.differenceTitle, max: 60 },
    { keyHe: 'difference_intro_he', keyEn: 'difference_intro_en', label: copy.fields.differenceIntro, max: 120 },
    { keyHe: 'difference_paragraph_he', keyEn: 'difference_paragraph_en', label: copy.fields.differenceParagraph, max: 350, multiline: true },
    { keyHe: 'cta_text_he', keyEn: 'cta_text_en', label: copy.fields.ctaText, max: 40 },
    { keyHe: 'stat_1_label_he', keyEn: 'stat_1_label_en', label: copy.fields.stat1Label, max: 40 },
    { keyHe: 'stat_2_label_he', keyEn: 'stat_2_label_en', label: copy.fields.stat2Label, max: 40 },
    { keyHe: 'stat_3_label_he', keyEn: 'stat_3_label_en', label: copy.fields.stat3Label, max: 40 },
  ];
  const differenceSingles: SingleField[] = [
    { key: 'cta_link', label: copy.fields.ctaLink, max: 255 },
    { key: 'stat_1_number', label: copy.fields.stat1Number, max: 12 },
    { key: 'stat_2_number', label: copy.fields.stat2Number, max: 12 },
    { key: 'stat_3_number', label: copy.fields.stat3Number, max: 12 },
  ];

  const allPairs = [...successPairs, ...visionMissionPairs, ...differencePairs];
  const allSingles = [...successSingles, ...differenceSingles];
  const hasOverLimit =
    allPairs.some((f) => get(f.keyHe).length > f.max || get(f.keyEn).length > f.max) ||
    allSingles.some((f) => get(f.key).length > f.max);

  const renderPair = (field: PairField) => (
    <div key={field.keyHe} className="grid gap-4 md:grid-cols-2">
      <TextField
        label={`${field.label} — ${copy.heCol}`}
        value={get(field.keyHe)}
        max={field.max}
        dir="rtl"
        multiline={field.multiline}
        onChange={(v) => set(field.keyHe, v)}
      />
      <TextField
        label={`${field.label} — ${copy.enCol}`}
        value={get(field.keyEn)}
        max={field.max}
        dir="ltr"
        multiline={field.multiline}
        onChange={(v) => set(field.keyEn, v)}
      />
    </div>
  );

  const renderSingle = (field: SingleField) => (
    <TextField
      key={field.key}
      label={field.label}
      value={get(field.key)}
      max={field.max}
      dir="ltr"
      onChange={(v) => set(field.key, v)}
    />
  );

  const save = async () => {
    if (hasOverLimit) {
      setFeedback({ kind: 'error', message: copy.overLimit });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await updateAboutPageContent(form);
      setForm(saved);
      setFeedback({ kind: 'success', message: copy.saved });
    } catch (err) {
      setFeedback({ kind: 'error', message: err instanceof ApiError ? err.message : copy.error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <AdminPageHeader
        title={copy.title}
        action={
          <button
            onClick={() => void save()}
            disabled={saving || hasOverLimit}
            className="inline-flex items-center gap-2 rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy hover:bg-[#e3c454] disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? copy.saving : copy.save}
          </button>
        }
      />

      {feedback && (
        <div
          role="alert"
          aria-live="polite"
          className={`rounded-lg border px-4 py-3 text-sm font-bold ${
            feedback.kind === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h2 className="text-lg font-bold text-brand-gold">{copy.sectionSuccess}</h2>
        <ImageUploadField
          label={copy.imageLabel}
          folder="about"
          value={form.image_url}
          onUploaded={(url) => set('image_url', url)}
        />
        {successSingles.map(renderSingle)}
        {successPairs.map(renderPair)}
      </section>

      <section className="space-y-4 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h2 className="text-lg font-bold text-brand-gold">{copy.sectionVisionMission}</h2>
        {visionMissionPairs.map(renderPair)}
      </section>

      <section className="space-y-4 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <h2 className="text-lg font-bold text-brand-gold">{copy.sectionDifference}</h2>
        {differencePairs.map(renderPair)}
        {differenceSingles.map(renderSingle)}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Add the nav item**

In `frontend/src/components/admin/adminNavigation.ts`, add the `FileText` icon to the `lucide-react` import and a new entry to `contentItems` right after the `homepage-video` entry:

```typescript
import { BarChart3, Briefcase, ClipboardList, Factory, FileText, Handshake, Layers, LayoutDashboard, MessageSquare, Quote, ShieldCheck, Users, Video, type LucideIcon } from 'lucide-react';
```

```typescript
  { path: '/admin/homepage-video', label: { he: 'סרטון דף הבית', en: 'Homepage Video' }, icon: Video },
  { path: '/admin/about-content', label: { he: 'תוכן אודות', en: 'About Content' }, icon: FileText },
  { path: '/admin/public-stats', label: { he: 'נתוני החברה', en: 'Company numbers' }, icon: BarChart3 },
```

- [ ] **Step 3: Update the nav test's expected path list**

In `frontend/src/components/admin/adminNavigation.test.ts`, update the `paths` assertion to insert `/admin/about-content` in the same position:

```typescript
    expect(paths).toEqual([
      '/admin',
      '/admin/projects',
      '/admin/production-projects',
      '/admin/services',
      '/admin/partners',
      '/admin/testimonials',
      '/admin/homepage-video',
      '/admin/about-content',
      '/admin/public-stats',
      '/admin/contact-messages',
      '/admin/quote-requests',
    ]);
```

- [ ] **Step 4: Register the route**

In `frontend/src/app/App.tsx`, add the import next to the other admin page imports:

```tsx
import { AdminAboutContent } from '@/app/admin/AdminAboutContent';
```

and the route next to `homepage-video`'s route (as a plain child of the `/admin` parent route — no `RequireSuperAdmin` wrapper, matching every other `contentItems` route):

```tsx
        <Route path="homepage-video" element={<AdminHomepageVideo />} />
        <Route path="about-content" element={<AdminAboutContent />} />
```

- [ ] **Step 5: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Run the nav test**

Run: `cd frontend && npx vitest run src/components/admin/adminNavigation.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/admin/AdminAboutContent.tsx frontend/src/components/admin/adminNavigation.ts frontend/src/components/admin/adminNavigation.test.ts frontend/src/app/App.tsx
git commit -m "feat: add About Content admin page, nav item, and route"
```

---

### Task 11: Frontend page-level tests

**Files:**
- Create: `frontend/src/app/About.test.tsx`
- Create: `frontend/src/app/admin/AdminAboutContent.test.tsx`

**Interfaces:**
- Consumes: `About` (Task 9), `AdminAboutContent` (Task 10), `LanguageProvider`/`AdminLanguageProvider` from `@/i18n` (existing) — follow the exact `renderToStaticMarkup` pattern already used by `AdminHomepageVideo.test.tsx` (effects never run in that render mode, so no API mocking is needed; the component's synchronous initial state — the hardcoded fallback — is what gets asserted).

- [ ] **Step 1: Write the public About page test**

Create `frontend/src/app/About.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { About } from './About';
import { LanguageProvider } from '@/i18n';

describe('About page', () => {
  it('renders the hardcoded fallback content when the API has not resolved', () => {
    // renderToStaticMarkup does not run effects, so getAboutPageContent never
    // fires — the page renders its synchronous initial state, which is the
    // defaultAboutPageContent fallback. This is the same state a failed fetch
    // would produce, so it doubles as the "API fails" acceptance check.
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <About />
      </LanguageProvider>,
    );

    expect(html).toContain('סיפור ההצלחה שלנו');
    expect(html).toContain('החזון שלנו');
    expect(html).toContain('המשימה שלנו');
    expect(html).toContain('/images/our-success-story.png');
  });
});
```

- [ ] **Step 2: Write the admin page test**

Create `frontend/src/app/admin/AdminAboutContent.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AdminAboutContent } from './AdminAboutContent';
import { LanguageProvider } from '@/i18n';

describe('AdminAboutContent page', () => {
  it('shows character counters for text fields', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminAboutContent />
      </LanguageProvider>,
    );

    // Title field defaults to the seeded "סיפור ההצלחה שלנו" (18 chars) with
    // a 60-char limit, so its counter reads "18/60".
    expect(html).toContain('18/60');
  });

  it('exposes only Hebrew and English inputs, never Arabic', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AdminAboutContent />
      </LanguageProvider>,
    );

    expect(html).not.toMatch(/_ar\b/);
    expect(html).not.toMatch(/ערבית/);
    expect(html).not.toMatch(/Arabic/i);
  });
});
```

- [ ] **Step 3: Run both tests**

Run: `cd frontend && npx vitest run src/app/About.test.tsx src/app/admin/AdminAboutContent.test.tsx`
Expected: both PASS.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/About.test.tsx frontend/src/app/admin/AdminAboutContent.test.tsx
git commit -m "test: add About page and AdminAboutContent coverage"
```

---

### Task 12: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Backend full test suite**

Run: `cd backend && pytest -q`
Expected: all tests PASS, 0 failures.

- [ ] **Step 2: Frontend typecheck**

Run: `cd frontend && npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Frontend full test suite**

Run: `cd frontend && npm run test`
Expected: all tests PASS, 0 failures.

- [ ] **Step 4: Frontend build**

Run: `cd frontend && npm run build`
Expected: build succeeds, `dist/` produced, no errors (chunk-size warning is pre-existing and expected).

- [ ] **Step 5: Whitespace check**

Run: `git diff --check`
Expected: no output (no trailing whitespace / conflict markers introduced).

- [ ] **Step 6: Manual smoke test**

Run: `cd backend && uvicorn app.main:app --reload` (in one terminal) and `cd frontend && npm run dev` (in another). Visit `/about` and confirm Success Story, Vision/Mission, and the CTA/stats band render the seeded content. Log into `/admin/login`, visit `/admin/about-content`, change the title field, save, and confirm the success banner appears and `/about` reflects the change after a refresh. Try typing a title beyond 60 characters and confirm the Save button disables and the character counter turns red.

- [ ] **Step 7: Final commit if any fixups were needed**

If Steps 1-6 required any fixes, commit them:

```bash
git add -A
git commit -m "fix: address verification findings for about_page_content feature"
```
