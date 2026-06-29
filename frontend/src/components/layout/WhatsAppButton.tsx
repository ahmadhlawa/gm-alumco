import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/i18n";
import { WHATSAPP_URL } from "@/components/common/ContactActions";

export function WhatsAppButton() {
  const { t } = useLanguage();

  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 rtl:left-6 ltr:right-6 rtl:right-auto z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl shadow-brand-border/50 hover:shadow-2xl shadow-brand-border/50 transition-shadow flex items-center justify-center group"
      aria-label={t("تواصل عبر الواتساب", "צור קשר בווטסאפ", "Contact us on WhatsApp")}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute rtl:right-14 ltr:left-14 bg-brand-surface text-white text-sm py-1 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {t("طلب عرض سعر", "בקש הצעת מחיר", "Request a quote")}
      </span>
    </motion.a>
  );
}
