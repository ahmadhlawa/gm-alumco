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

    # The `default=` values below are the same seed content as the migration's
    # insert (alembic/versions/20260709_0001_add_about_page_content.py). Kept
    # in sync manually: migrations here never import the ORM model (so they
    # stay valid even as the model evolves), so this is a deliberate second
    # copy for any environment that provisions the schema without running
    # Alembic (e.g. this project's pytest fixtures). Edit both together.
    title_en: Mapped[str | None] = mapped_column(String(60), nullable=True, default="Our success story")
    title_he: Mapped[str | None] = mapped_column(String(60), nullable=True, default="סיפור ההצלחה שלנו")
    subtitle_en: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
        default="A journey of passion in architecture, begun to deliver the quality you deserve.",
    )
    subtitle_he: Mapped[str | None] = mapped_column(
        String(120), nullable=True, default="מסע של תשוקה בעולם האדריכלות למען איכות."
    )
    paragraph_1_en: Mapped[str | None] = mapped_column(
        String(350),
        nullable=True,
        default=(
            "T.A.S was founded with a clear vision to drive a real shift in the "
            "building cladding and aluminum systems industry. From day one we have "
            "focused on superior quality, strict engineering standards and on-time "
            "delivery."
        ),
    )
    paragraph_1_he: Mapped[str | None] = mapped_column(
        String(350),
        nullable=True,
        default="T.A.S הוקמה בחזון ברור לחולל שינוי מהותי בתעשיית קירוי מבנים ומערכות אלומיניום.",
    )
    paragraph_2_en: Mapped[str | None] = mapped_column(
        String(350),
        nullable=True,
        default=(
            "We are proud to employ leading professionals and engineers, and we "
            "continually adopt the latest manufacturing technology to deliver "
            "sustainable, safe solutions for the residential and commercial sectors."
        ),
    )
    paragraph_2_he: Mapped[str | None] = mapped_column(
        String(350),
        nullable=True,
        default="אנו גאים להעסיק אנשי מקצוע ומהנדסים מובילים לפיתוח בר קיימא עבור המגזר הפרטי והעסקי.",
    )
    bullet_1_en: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="Applying the strictest safety and quality standards"
    )
    bullet_1_he: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="יישום תקני בטיחות ואיכות מחמירים"
    )
    bullet_2_en: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="Using internationally certified raw materials"
    )
    bullet_2_he: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="שימוש בחומרי גלם באישור בינלאומי"
    )
    bullet_3_en: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="A skilled and experienced technical team"
    )
    bullet_3_he: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="צוות טכני מיומן ומנוסה"
    )
    bullet_4_en: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="Comprehensive after-sales service and genuine warranty"
    )
    bullet_4_he: Mapped[str | None] = mapped_column(
        String(90), nullable=True, default="שירותי לאחר המכירה ואחריות מקיפה"
    )
    image_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True, default="/images/our-success-story.png"
    )
    experience_number: Mapped[str | None] = mapped_column(String(12), nullable=True, default="10+")
    experience_label_en: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="Years of experience"
    )
    experience_label_he: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="שנות ניסיון"
    )

    vision_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True, default="Our vision")
    vision_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True, default="החזון שלנו")
    vision_text_en: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
        default=(
            "To be the first choice and leading company providing innovative "
            "aluminum and glass solutions in the region, setting new standards for "
            "quality, design and reliability."
        ),
    )
    vision_text_he: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
        default="להיות הבחירה הראשונה והחברה המובילה במתן פתרונות אלומיניום וזכוכית חדשניים ואיכותיים ביות",
    )
    mission_title_en: Mapped[str | None] = mapped_column(String(60), nullable=True, default="Our mission")
    mission_title_he: Mapped[str | None] = mapped_column(String(60), nullable=True, default="המשימה שלנו")
    mission_text_en: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
        default=(
            "To fully meet our clients' aspirations through advanced, "
            "time-resistant systems, with the highest professional integrity and "
            "exceptional service before, during and after execution."
        ),
    )
    mission_text_he: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
        default="לספק מענה מלא לדרישות הלקוחות בעזרת ייצור מתקדם ואמינות מתמשכת לפני, תוך ולאחר הייצור.",
    )

    difference_title_en: Mapped[str | None] = mapped_column(
        String(60), nullable=True, default="Have a new project? Let us help you bring it to life."
    )
    difference_title_he: Mapped[str | None] = mapped_column(
        String(60), nullable=True, default="האם יש לך פרויקט חדש? תן לנו לעזור לך לממש אותו."
    )
    difference_intro_en: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
        default=(
            "We're here to provide engineering consultation and competitive quotes "
            "for your next project."
        ),
    )
    difference_intro_he: Mapped[str | None] = mapped_column(
        String(120), nullable=True, default="אנו כאן לייעוץ הנדסי והצעות מחיר תחרותיות לפרויקט הבא שלך."
    )
    difference_paragraph_en: Mapped[str | None] = mapped_column(
        String(350),
        nullable=True,
        default=(
            "From concept to installation, our engineering team partners with you "
            "at every step, delivering precision-engineered aluminum and glass "
            "systems backed by rigorous quality control and a genuine warranty."
        ),
    )
    difference_paragraph_he: Mapped[str | None] = mapped_column(
        String(350),
        nullable=True,
        default=(
            "מהרעיון ועד ההתקנה, צוות ההנדסה שלנו לצדכם בכל שלב – ומספק מערכות "
            "אלומיניום וזכוכית מהונדסות בדייקנות, בגיבוי בקרת איכות קפדנית ואחריות אמיתית."
        ),
    )
    cta_text_en: Mapped[str | None] = mapped_column(String(40), nullable=True, default="Contact us now")
    cta_text_he: Mapped[str | None] = mapped_column(String(40), nullable=True, default="צור קשר עכשיו")
    cta_link: Mapped[str | None] = mapped_column(String(255), nullable=True, default="/request-quote")
    stat_1_number: Mapped[str | None] = mapped_column(String(12), nullable=True, default="250+")
    stat_1_label_en: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="Completed projects"
    )
    stat_1_label_he: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="פרויקטים שהושלמו"
    )
    stat_2_number: Mapped[str | None] = mapped_column(String(12), nullable=True, default="10+")
    stat_2_label_en: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="Years of experience"
    )
    stat_2_label_he: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="שנות ניסיון"
    )
    stat_3_number: Mapped[str | None] = mapped_column(String(12), nullable=True, default="5")
    stat_3_label_en: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="Years warranty"
    )
    stat_3_label_he: Mapped[str | None] = mapped_column(
        String(40), nullable=True, default="שנות אחריות"
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
