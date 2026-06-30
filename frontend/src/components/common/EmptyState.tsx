import { FileBox } from "lucide-react";
import { useLanguage } from "@/i18n";

export function EmptyState({ message }: { message?: string }) {
  const { language } = useLanguage();
  const text = message ?? (language === 'en' ? 'No data to display yet.' : 'אין נתונים להצגה עדיין.');
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
         <FileBox className="w-8 h-8 text-brand-silver/50" />
      </div>
      <p className="text-brand-silver font-medium text-lg">{text}</p>
    </div>
  );
}
