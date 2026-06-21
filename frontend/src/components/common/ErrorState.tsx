import { AlertCircle } from 'lucide-react';

export function ErrorState({ message = 'تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.' }: { message?: string }) {
  return <div className="flex flex-col items-center justify-center py-20 text-center text-red-300"><AlertCircle className="mb-4 h-10 w-10" /><p>{message}</p></div>;
}
