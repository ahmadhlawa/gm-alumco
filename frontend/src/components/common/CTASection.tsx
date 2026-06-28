import { motion } from "motion/react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "./ContactActions";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

export function CTASection({
  title,
  subtitle,
  buttonText,
  buttonLink = "/request-quote",
  className
}: CTASectionProps) {
  const { t } = useLanguage();

  const finalTitle = title || t("هل لديك مشروع جديد؟ دعنا نساعدك في تنفيذه.", "האם יש לך פרויקט חדש? תן לנו לעזור לך לממש אותו.");
  const finalSubtitle = subtitle || t("نحن هنا لتقديم الاستشارة الهندسية وعروض الأسعار التنافسية لمشروعك القادم.", "אנו כאן לייעוץ הנדסי והצעות מחיר תחרותיות לפרויקט הבא שלך.");
  const finalButtonText = buttonText || t("تواصل معنا الآن", "צור קשר עכשיו");

  return (
    <section className={cn("py-20 relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-brand-navy z-0" />

      {/* Architectural facade backdrop — subtle, heavily navy-washed for contrast */}
      <img
        aria-hidden
        src="/images/backgrounds/tas-bg-cta.webp"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.22]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-brand-navy via-brand-navy/85 to-brand-navy/70"
      />

      {/* Decorative architectural lines */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
         <div className="absolute top-0 right-[20%] w-[1px] h-full bg-white transform rotate-12" />
         <div className="absolute top-0 left-[30%] w-[1px] h-full bg-white transform -rotate-12" />
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {finalTitle}
          </h2>
          <p className="text-xl text-gray-300 mb-10 font-light">
            {finalSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button href={buttonLink} variant="secondary" size="lg" className="min-w-[200px]">
              {finalButtonText}
            </Button>
            <Button href="/contact" variant="outline" size="lg" className="min-w-[200px] border-white/20 text-white hover:bg-white/5">
              {t('اتصل بنا', 'צור קשר')}
            </Button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 min-w-[200px] items-center justify-center gap-2 border border-brand-gold/60 px-6 py-3 font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
