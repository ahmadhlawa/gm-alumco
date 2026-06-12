import { FileBox } from "lucide-react";

export function EmptyState({ message = "لا توجد بيانات لعرضها حاليًا." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
         <FileBox className="w-8 h-8 text-brand-silver/50" />
      </div>
      <p className="text-brand-silver font-medium text-lg">{message}</p>
    </div>
  );
}
