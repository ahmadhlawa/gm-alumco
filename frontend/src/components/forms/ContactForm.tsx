import { useState, FormEvent, ChangeEvent } from "react";
import { submitContactMessage } from "@/lib/api";

export function ContactForm({ t }: { t: (he: string, en?: string) => string }) {
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
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.projectType || undefined,
        message: formData.message
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-lg text-center">
        <h4 className="text-xl font-bold mb-2">{t('נשלח בהצלחה!', 'Message sent successfully!')}</h4>
        <p>{t('תודה שפנית אלינו, הצוות שלנו יחזור אליך בהקדם האפשרי.', 'Thanks for contacting us. Our team will get back to you as soon as possible.')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-200">{t('שם מלא ', 'Full name ')}<span className="text-red-500">*</span></label>
           <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-white rounded" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-bold text-gray-200">{t('מספר טלפון ', 'Phone number ')}<span className="text-red-500">*</span></label>
           <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-left text-white rounded" />
        </div>
      </div>
      
      <div className="space-y-2">
         <label className="text-sm font-bold text-gray-200">{t('אימייל ', 'Email ')}<span className="text-red-500">*</span></label>
         <input required type="email" name="email" value={formData.email} onChange={handleChange} dir="ltr" className="w-full h-12 px-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-left text-white rounded" />
      </div>
      
      <div className="space-y-2">
         <label className="text-sm font-bold text-gray-200">{t('סוג פרויקט', 'Project type')}</label>
         <select name="projectType" value={formData.projectType} onChange={handleChange} className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors text-white rounded">
            <option value="" className="bg-[#0A192F] text-white">{t('בחר סוג פרויקט', 'Select project type')}</option>
            <option value="residential" className="bg-[#0A192F] text-white">{t('מגורים (וילה / ארמון)', 'Residential (villa / palace)')}</option>
            <option value="commercial" className="bg-[#0A192F] text-white">{t('מסחרי (משרדים / תערוכות)', 'Commercial (offices / showrooms)')}</option>
            <option value="towers" className="bg-[#0A192F] text-white">{t('מגדלים', 'Towers')}</option>
            <option value="other" className="bg-[#0A192F] text-white">{t('אחר', 'Other')}</option>
         </select>
      </div>
      
      <div className="space-y-2">
         <label className="text-sm font-bold text-gray-200">{t('הודעה או בירור ', 'Message or inquiry ')}<span className="text-red-500">*</span></label>
         <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors resize-none text-white rounded"></textarea>
      </div>
      
      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded text-center text-sm">
          {t('שליחת ההודעה נכשלה. נסה שוב.', 'Could not send the message. Please try again.')}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full h-12 bg-brand-gold text-white font-bold rounded hover:bg-[#b8962e] transition-colors disabled:opacity-50"
      >
        {status === 'loading' ? t('שולח...', 'Sending...') : t('שלח הודעה', 'Send message')}
      </button>
    </form>
  );
}
