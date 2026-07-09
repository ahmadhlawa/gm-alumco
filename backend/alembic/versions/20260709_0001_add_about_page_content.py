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
