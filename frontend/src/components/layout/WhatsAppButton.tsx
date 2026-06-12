import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/i18n";

export function WhatsAppButton() {
  const { t } = useLanguage();

  return (
    <motion.a
      href="https://wa.me/1234567890"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 rtl:left-6 ltr:right-6 rtl:right-auto z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl shadow-brand-border/50 hover:shadow-2xl shadow-brand-border/50 transition-shadow flex items-center justify-center group"
      aria-label={t("تواصل عبر الواتساب", "צור קשר בווטסאפ")}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute rtl:right-14 ltr:left-14 bg-brand-surface text-gray-900 text-sm py-1 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {t("طلب عرض سعر", "בקש הצעת מחיר")}
      </span>
    </motion.a>
  );
}
