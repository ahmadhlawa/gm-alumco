import { UploadCloud } from "lucide-react";

// TODO: Connect to secure backend upload service later.

export function FileUploadPlaceholder({ label = "رفع ملف" }: { label?: string }) {
  return (
    <div className="border-2 border-dashed border-white/20 bg-brand-navy p-10 text-center hover:bg-white/5 transition-colors cursor-pointer group rounded-lg">
      <UploadCloud className="w-12 h-12 text-brand-silver mx-auto mb-4 group-hover:text-brand-gold transition-colors" />
      <p className="text-white font-bold text-lg mb-2">{label}</p>
      <p className="text-brand-silver text-sm">صيغ الملفات المدعومة: JPG, PNG, WEBP, PDF (الحد الأقصى 5MB)</p>
      <p className="text-xs text-brand-gold mt-4 italic">هذه واجهة تجريبية فقط. لا يتم رفع الملفات فعليًا.</p>
    </div>
  );
}
