import { UploadCloud } from "lucide-react";
import { useLanguage } from "@/i18n";

// TODO(backend): Replace with validated presigned uploads to object storage.

export function FileUploadPlaceholder({ label = "رفع ملف" }: { label?: string }) {
  const { t } = useLanguage();

  return (
    <div className="border-2 border-dashed border-white/20 bg-brand-navy p-10 text-center hover:bg-white/5 transition-colors cursor-pointer group rounded-lg">
      <UploadCloud className="w-12 h-12 text-brand-silver mx-auto mb-4 group-hover:text-brand-gold transition-colors" />
      <p className="text-white font-bold text-lg mb-2">{label}</p>
      <p className="text-brand-silver text-sm">
        {t(
          "صيغ الملفات المدعومة: JPG, PNG, WEBP, PDF (الحد الأقصى 5MB)",
          "סוגי קבצים נתמכים: JPG, PNG, WEBP, PDF (עד 5MB)",
          "Supported file types: JPG, PNG, WEBP, PDF (max 5MB)",
        )}
      </p>
      <p className="text-xs text-brand-gold mt-4 italic">
        {t(
          "هذه واجهة تجريبية فقط. لا يتم رفع الملفات فعلياً.",
          "זו הדגמה בלבד. הקבצים אינם מועלים בפועל.",
          "This is a demo interface only. Files are not actually uploaded.",
        )}
      </p>
    </div>
  );
}
