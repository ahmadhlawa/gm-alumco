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
