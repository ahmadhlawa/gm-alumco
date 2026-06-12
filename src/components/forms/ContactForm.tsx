import { useState, FormEvent, ChangeEvent } from "react";
import { submitContactMessage } from "@/lib/api";

export function ContactForm({ t }: { t: any }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitContactMessage(formData);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-lg text-center">
        <h4 className="text-xl font-bold mb-2">{t('تم الإرسال بنجاح!', 'נשלח בהצלחה!')}</h4>
        <p>{t('شكراً لتواصلك معنا، سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.', 'תודה שפנית אלינו, הצוות שלנו יחזור אליך בהקדם האפשרי.')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-200">{t('الاسم الكامل ', 'שם מלא ')}<span className="text-red-500">*</span></label>
           <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-white rounded" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-200">{t('رقم الهاتف ', 'מספר טלפון ')}<span className="text-red-500">*</span></label>
           <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-right text-white rounded" />
        </div>
      </div>
      
      <div className="space-y-2">
         <label className="text-sm font-bold text-gray-200">{t('البريد الإلكتروني', 'אימייל')}</label>
         <input type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-right text-white rounded" />
      </div>
      
      <div className="space-y-2">
         <label className="text-sm font-bold text-gray-200">{t('نوع المشروع', 'סוג פרויקט')}</label>
         <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-white rounded">
            <option value="" className="bg-[#0A192F] text-white">{t('اختر نوع المشروع', 'בחר סוג פרויקט')}</option>
            <option value="residential" className="bg-[#0A192F] text-white">{t('سكني (فيلا / قصر)', 'מגורים (וילה / ארמון)')}</option>
            <option value="commercial" className="bg-[#0A192F] text-white">{t('تجاري (مكاتب / معارض)', 'מסחרי (משרדים / תערוכות)')}</option>
            <option value="towers" className="bg-[#0A192F] text-white">{t('أبراج', 'מגדלים')}</option>
            <option value="other" className="bg-[#0A192F] text-white">{t('أخرى', 'אחר')}</option>
         </select>
      </div>
      
      <div className="space-y-2">
         <label className="text-sm font-bold text-gray-200">{t('الرسالة أو الاستفسار ', 'הודעה או בירור ')}<span className="text-red-500">*</span></label>
         <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors resize-none text-white rounded"></textarea>
      </div>
      
      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="w-full h-12 bg-brand-gold text-white font-bold rounded hover:bg-[#b8962e] transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? 'جاري الإرسال...' : t('إرسال الرسالة', 'שלח הודעה')}
      </button>
    </form>
  );
}
