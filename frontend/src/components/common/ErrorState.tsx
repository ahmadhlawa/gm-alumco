import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/i18n';

export function ErrorState({ message }: { message?: string }) {
  const { language } = useLanguage();
  const text = message ?? (language === 'en' ? 'Could not load data. Please try again.' : 'טעינת הנתונים נכשלה. נסו שוב.');
  return <div className="flex flex-col items-center justify-center py-20 text-center text-red-300"><AlertCircle className="mb-4 h-10 w-10" /><p>{text}</p></div>;
}
