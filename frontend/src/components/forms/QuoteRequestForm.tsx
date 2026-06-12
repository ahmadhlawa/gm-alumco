import React from "react";
import { useState } from "react";
import { submitQuoteRequest } from "@/lib/api";
import { FileUploadPlaceholder } from "../common/FileUploadPlaceholder";

export function QuoteRequestForm() {
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitQuoteRequest({});
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 bg-green-500/10 border border-green-500/20 text-center rounded-lg max-w-2xl mx-auto">
         <h3 className="text-2xl font-bold text-green-400 mb-2">تم استلام طلبك!</h3>
         <p className="text-green-300/70">سيقوم فريق المبيعات بالتواصل معك قريباً لمناقشة التفاصيل.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-brand-surface border border-white/5 p-8 rounded-lg">
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brand-gold border-b border-white/10 pb-2">المعلومات الشخصية</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">الاسم الكامل <span className="text-red-500">*</span></label>
            <input required type="text" className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">رقم التواصل <span className="text-red-500">*</span></label>
            <input required type="tel" dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded text-white text-right" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brand-gold border-b border-white/10 pb-2">تفاصيل المشروع</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">نوع المشروع</label>
            <select className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded text-white appearance-none">
              <option value="" className="bg-brand-navy text-white">اختر...</option>
              <option value="villa" className="bg-brand-navy text-white">فيلا سكنية</option>
              <option value="commercial" className="bg-brand-navy text-white">مبنى تجاري</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">الخدمة المطلوبة</label>
            <select className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded text-white appearance-none">
              <option value="" className="bg-brand-navy text-white">اختر...</option>
              <option value="curtain" className="bg-brand-navy text-white">واجهات كيرتن وول</option>
              <option value="doors" className="bg-brand-navy text-white">نوافذ وأبواب</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brand-gold border-b border-white/10 pb-2">المخططات الهندسية</h3>
        <FileUploadPlaceholder label="ارفع المخططات هنا إن وجدت" />
      </div>

      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="w-full h-14 bg-brand-gold text-white font-bold rounded text-lg hover:bg-[#b8962e] transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'جاري الإرسال...' : 'إرسال طلب التسعير'}
      </button>
    </form>
  );
}
