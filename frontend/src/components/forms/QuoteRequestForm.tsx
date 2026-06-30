import React from "react";
import { useState } from "react";
import { useLanguage } from "@/i18n";
import { submitQuoteRequest } from "@/lib/api";

export function QuoteRequestForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    serviceType: '',
    plansLink: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitQuoteRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.serviceType || undefined,
        message: formData.projectType
          ? `${t('نوع المشروع', 'סוג פרויקט', 'Project type')}: ${formData.projectType}`
          : undefined,
        plans_link: formData.plansLink.trim() || undefined
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 bg-green-500/10 border border-green-500/20 text-center rounded-lg max-w-2xl mx-auto">
         <h3 className="text-2xl font-bold text-green-400 mb-2">{t('تم استلام طلبك!', 'בקשתך התקבלה!', 'Your request was received!')}</h3>
         <p className="text-green-300/70">{t('سيقوم فريق المبيعات بالتواصل معك قريباً لمناقشة التفاصيل.', 'צוות המכירות שלנו יצור איתך קשר בקרוב כדי לדון בפרטים.', 'Our sales team will contact you soon to discuss the details.')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-brand-surface border border-white/5 p-8 rounded-lg">
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brand-gold border-b border-white/10 pb-2">{t('المعلومات الشخصية', 'פרטים אישיים', 'Personal information')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">{t('الاسم الكامل ', 'שם מלא ', 'Full name ')}<span className="text-red-500">*</span></label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">{t('رقم التواصل ', 'טלפון ליצירת קשר ', 'Phone number ')}<span className="text-red-500">*</span></label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded text-white text-left" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-gray-200">{t('البريد الإلكتروني ', 'אימייל ', 'Email ')}<span className="text-red-500">*</span></label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded text-white text-left" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brand-gold border-b border-white/10 pb-2">{t('تفاصيل المشروع', 'פרטי פרויקט', 'Project details')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">{t('نوع المشروع', 'סוג פרויקט', 'Project type')}</label>
            <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded text-white appearance-none">
              <option value="" className="bg-brand-navy text-white">{t('اختر...', 'בחר...', 'Select...')}</option>
              <option value="villa" className="bg-brand-navy text-white">{t('فيلا سكنية', 'וילה למגורים', 'Residential villa')}</option>
              <option value="commercial" className="bg-brand-navy text-white">{t('مبنى تجاري', 'מבנה מסחרי', 'Commercial building')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-200">{t('الخدمة المطلوبة', 'השירות המבוקש', 'Service required')}</label>
            <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded text-white appearance-none">
              <option value="" className="bg-brand-navy text-white">{t('اختر...', 'בחר...', 'Select...')}</option>
              <option value="curtain" className="bg-brand-navy text-white">{t('واجهات كيرتن وول', 'חזיתות קיר מסך', 'Curtain wall facades')}</option>
              <option value="doors" className="bg-brand-navy text-white">{t('نوافذ وأبواب', 'חלונות ודלתות', 'Windows and doors')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-brand-gold border-b border-white/10 pb-2">{t('المخططات الهندسية', 'תוכניות הנדסיות', 'Engineering plans')}</h3>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">
            {t('رابط المخططات أو الملفات', 'קישור לתוכניות או קבצים', 'Link to plans or files')}
          </label>
          <input
            type="url"
            name="plansLink"
            inputMode="url"
            dir="ltr"
            value={formData.plansLink}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-left text-white rounded"
          />
          <p className="text-sm text-brand-silver">
            {t(
              'يمكنك لصق رابط Google Drive أو مجلد سحابي يحتوي على المخططات أو الرسومات أو الملفات.',
              'ניתן להדביק קישור ל-Google Drive או לתיקייה בענן עם שרטוטים, תוכניות או קבצים.',
              'Paste a link to Google Drive or a cloud folder with drawings, plans or files.',
            )}
          </p>
        </div>
      </div>

      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded text-center text-sm">
          {t('تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.', 'שליחת הבקשה נכשלה. נסה שוב.', 'Could not send the request. Please try again.')}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full h-14 bg-brand-gold text-white font-bold rounded text-lg hover:bg-[#b8962e] transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? t('جاري الإرسال...', 'שולח...', 'Sending...') : t('إرسال طلب التسعير', 'שלח בקשת הצעת מחיר', 'Submit quote request')}
      </button>
    </form>
  );
}
