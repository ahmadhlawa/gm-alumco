import React from "react";
import { useState } from "react";
import { FileUploadPlaceholder } from "../common/FileUploadPlaceholder";

export function GalleryUploadForm() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-brand-navy p-6 rounded-lg border border-white/5">
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md">
           تم رفع الصور بنجاح (محاكاة فقط).
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">اختر الفئة</label>
          <select className="w-full h-12 px-4 bg-brand-surface border border-white/10 rounded focus:border-brand-gold text-white appearance-none">
            <option>واجهات كيرتن وول</option>
            <option>نوافذ وأبواب</option>
            <option>أعمال أخرى</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200 mb-2 block">رفع الصور</label>
          <FileUploadPlaceholder label="انقر هنا لاختيار الصور أو اسحبها إلى هنا" />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button type="submit" className="w-full px-8 py-3 bg-brand-gold text-white font-bold rounded-md hover:bg-[#b8962e] transition-colors">
          أضف إلى المعرض
        </button>
      </div>
    </form>
  );
}
