import { AlertTriangle } from "lucide-react";

export function ErrorState({ message = "حدث خطأ أثناء تحميل البيانات. حاول مرة أخرى." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
         <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-red-400 font-medium text-lg">{message}</p>
    </div>
  );
}
