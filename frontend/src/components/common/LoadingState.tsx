import { useLanguage } from "@/i18n";

export function LoadingState({ message }: { message?: string }) {
  const { language } = useLanguage();
  const text = message ?? (language === 'en' ? 'Loading…' : 'טוען נתונים…');
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mb-4"></div>
      <p className="text-brand-silver font-medium">{text}</p>
    </div>
  );
}
