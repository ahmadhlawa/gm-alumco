import React from "react";
import { useState } from "react";
import { FileUploadPlaceholder } from "../common/FileUploadPlaceholder";

export function ProductForm() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {success && (
         <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md">
            تم الحفظ بنجاح (محاكاة فقط).
         </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">المنتج</label>
          <input type="text" className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">الفئة</label>
          <input type="text" className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">المواصفات التقنية</label>
        <textarea className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white resize-none" rows={4} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200 mb-2 block">صورة المنتج</label>
        <FileUploadPlaceholder label="تغيير الصورة الرئيسية" />
      </div>

      <div className="pt-4 border-t border-white/10">
        <button type="submit" className="px-8 py-3 bg-brand-gold text-white font-bold rounded-md hover:bg-[#b8962e] transition-colors">
          حفظ المنتج
        </button>
      </div>
    </form>
  );
}
