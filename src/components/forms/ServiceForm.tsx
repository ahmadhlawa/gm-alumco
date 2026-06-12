import React from "react";
import { useState } from "react";
import { FileUploadPlaceholder } from "../common/FileUploadPlaceholder";

export function ServiceForm() {
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
          <label className="text-sm font-bold text-gray-200">عنوان الخدمة</label>
          <input type="text" className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">الرابط الدائم (Slug)</label>
          <input type="text" dir="ltr" className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white text-right" required />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">وصف قصير</label>
        <textarea className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white resize-none" rows={2} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">الوصف الكامل</label>
        <textarea className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white resize-none" rows={6} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">المميزات (مفصول بفواصل)</label>
          <textarea className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white resize-none" rows={3} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">الاستخدامات الموصى بها</label>
          <textarea className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:border-brand-gold text-white resize-none" rows={3} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200 mb-2 block">صورة الخدمة</label>
        <FileUploadPlaceholder label="تغيير الصورة الرئيسية" />
      </div>

      <div className="pt-4 border-t border-white/10">
        <button type="submit" className="px-8 py-3 bg-brand-gold text-white font-bold rounded-md hover:bg-[#b8962e] transition-colors">
          حفظ الخدمة
        </button>
      </div>
    </form>
  );
}
