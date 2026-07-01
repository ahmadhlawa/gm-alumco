import React from "react";
import { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n";
import { submitQuoteRequest } from "@/lib/api";

const field =
  "w-full h-12 rounded-lg bg-white/5 border border-white/10 px-4 text-white placeholder:text-brand-silver/60 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors";

export function QuoteRequestForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    location: '',
    area: '',
    plansLink: '',
    details: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Fold the location + estimated area into the message so the existing
    // backend (name/email/phone/service_type/message/plans_link) is unchanged.
    const messageParts = [
      formData.details.trim(),
      formData.location.trim()
        ? `${t('الموقع', 'מיקום', 'Location')}: ${formData.location.trim()}`
        : '',
      formData.area.trim()
        ? `${t('المساحة التقديرية', 'שטח משוער', 'Estimated area')}: ${formData.area.trim()} ${t('م²', 'מ"ר', 'm²')}`
        : '',
    ].filter(Boolean);

    try {
      await submitQuoteRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_type: formData.projectType || undefined,
        message: messageParts.length ? messageParts.join('\n') : undefined,
        plans_link: formData.plansLink.trim() || undefined,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-8 text-center">
        <h3 className="mb-2 text-2xl font-bold text-green-400">
          {t('تم استلام طلبك!', 'בקשתך התקבלה!', 'Your request was received!')}
        </h3>
        <p className="text-green-300/70">
          {t('سيقوم فريق المبيعات بالتواصل معك قريباً لمناقشة التفاصيل.', 'צוות המכירות שלנו יצור איתך קשר בקרוב כדי לדון בפרטים.', 'Our sales team will contact you soon to discuss the details.')}
        </p>
      </div>
    );
  }

  const projectTypes = [
    t('فيلا سكنية', 'וילה למגורים', 'Residential villa'),
    t('مبنى تجاري', 'מבנה מסחרי', 'Commercial building'),
    t('شقة / تجديد', 'דירה / שיפוץ', 'Apartment / renovation'),
    t('واجهات وكيرتن وول', 'חזיתות וקיר מסך', 'Facades & curtain wall'),
    t('أخرى', 'אחר', 'Other'),
  ];

  const fullNameLabel = t('الاسم الكامل', 'שם מלא', 'Full name');
  const emailLabel = t('البريد الإلكتروني', 'אימייל', 'Email');
  const phoneLabel = t('رقم الهاتف', 'מספר טלפון', 'Phone');
  const projectTypeLabel = t('نوع المشروع', 'סוג הפרויקט', 'Project type');
  const locationLabel = t('موقع المشروع', 'מיקום הפרויקט', 'Project location');
  const areaLabel = t('المساحة التقديرية (م²)', 'שטח משוער (מ"ר)', 'Estimated area (m²)');
  const linkLabel = t('رابط Google Drive / الملفات', 'קישור Google Drive / קבצים', 'Google Drive / files link');
  const detailsLabel = t('تفاصيل إضافية عن مشروعك', 'פרטים נוספים על הפרויקט שלך', 'Additional details about your project');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <input
          required
          type="text"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          aria-label={fullNameLabel}
          placeholder={`${fullNameLabel} *`}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          type="email"
          name="email"
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          aria-label={emailLabel}
          placeholder={`${emailLabel} *`}
          className={`${field} text-left`}
        />
        <input
          required
          type="tel"
          name="phone"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          aria-label={phoneLabel}
          placeholder={`${phoneLabel} *`}
          className={`${field} text-left`}
        />
      </div>

      <div className="relative">
        <select
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          aria-label={projectTypeLabel}
          className={`${field} cursor-pointer appearance-none ltr:pr-11 rtl:pl-11 ${formData.projectType ? 'text-white' : 'text-brand-silver/60'}`}
        >
          <option value="" className="bg-brand-navy text-brand-silver">{projectTypeLabel}</option>
          {projectTypes.map((type) => (
            <option key={type} value={type} className="bg-brand-navy text-white">{type}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-brand-silver ltr:right-4 rtl:left-4" />
      </div>

      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        aria-label={locationLabel}
        placeholder={locationLabel}
        className={field}
      />

      <input
        type="number"
        name="area"
        min="0"
        dir="ltr"
        inputMode="numeric"
        value={formData.area}
        onChange={handleChange}
        aria-label={areaLabel}
        placeholder={areaLabel}
        className={`${field} text-left`}
      />

      <input
        type="url"
        name="plansLink"
        dir="ltr"
        inputMode="url"
        value={formData.plansLink}
        onChange={handleChange}
        aria-label={linkLabel}
        placeholder="https://drive.google.com/..."
        className={`${field} text-left`}
      />
      <p className="-mt-1 text-xs text-brand-silver">
        {t(
          'يمكنك لصق رابط Google Drive أو مجلد سحابي يحتوي على المخططات أو الملفات.',
          'ניתן להדביק קישור ל-Google Drive או לתיקייה בענן עם תוכניות או קבצים.',
          'Paste a link to Google Drive or a cloud folder with your plans or files.',
        )}
      </p>

      <textarea
        name="details"
        rows={4}
        value={formData.details}
        onChange={handleChange}
        aria-label={detailsLabel}
        placeholder={detailsLabel}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-brand-silver/60 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors resize-none"
      />

      {status === 'error' && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300" role="alert">
          {t('تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.', 'שליחת הבקשה נכשלה. נסה שוב.', 'Could not send the request. Please try again.')}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="group flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-brand-gold text-base font-bold text-brand-navy transition-colors hover:bg-[#e3c454] disabled:opacity-60"
      >
        {status === 'loading'
          ? t('جاري الإرسال...', 'שולח...', 'Sending...')
          : t('إرسال طلب التسعير', 'שלח בקשת הצעת מחיר', 'Submit quote request')}
        {status !== 'loading' && (
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1 ltr:-scale-x-100 ltr:group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
