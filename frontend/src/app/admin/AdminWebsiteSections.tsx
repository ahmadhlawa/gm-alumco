import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { initialSiteContent, SiteContent } from '@/data/siteContent';
import { Save, RefreshCw, CheckCircle, Globe } from 'lucide-react';

export function AdminWebsiteSections() {
  const location = useLocation();
  const [siteContent, setSiteContent] = useState<SiteContent>(() => structuredClone(initialSiteContent));
  const [activeTab, setActiveTab] = useState<'about' | 'footer'>('about');
  const [previewLocale, setPreviewLocale] = useState<'ar' | 'en' | 'he'>('ar');
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Parse query params to auto-switch tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetSection = params.get('section');
    if (targetSection === 'about' || targetSection === 'footer') {
      setActiveTab(targetSection);
    }
  }, [location.search]);

  const getT = (obj: any) => {
    return obj?.[previewLocale] || obj?.ar || '';
  };

  const updateAboutField = (path: string[], val: any) => {
    const updated = structuredClone(siteContent);
    let current = updated.about as any;
    
    if (path.length === 1) {
      current[path[0]] = val;
    } else if (path.length === 2) {
      current[path[0]] = { ...current[path[0]], ...val };
    }
    setSiteContent(updated);
  };

  const updateAboutStat = (index: number, updatedStat: any) => {
    const updated = structuredClone(siteContent);
    updated.about.stats[index] = updatedStat;
    setSiteContent(updated);
  };

  const updateFooterField = (path: string[], val: any) => {
    const updated = structuredClone(siteContent);
    let current = updated.footer as any;
    
    if (path.length === 1) {
      current[path[0]] = val;
    } else if (path.length === 2) {
      current[path[0]] = { ...current[path[0]], ...val };
    }
    setSiteContent(updated);
  };

  const updateContactField = (fieldName: string, val: any) => {
    const updated = structuredClone(siteContent);
    (updated.contact as any)[fieldName] = val;
    setSiteContent(updated);
  };

  const updateLogoText = (val: any) => {
    const updated = structuredClone(siteContent);
    updated.hero.logoText = val;
    setSiteContent(updated);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToast({
        show: true,
        msg: `تم تحديث معاينة قسم ${activeTab === 'about' ? 'من نحن' : 'تذييل الصفحة'} محلياً.`,
      });
      setTimeout(() => setToast({ show: false, msg: '' }), 4500);
    }, 850);
  };

  const resetToDefault = () => {
    if (confirm('إعادة تعيين المحتويات المحلية؟')) {
      setSiteContent(structuredClone(initialSiteContent));
      setToast({
        show: true,
        msg: 'تم استرجاع المحتوى الافتراضي للشركة.',
      });
      setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* Toast Alert floating */}
      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50 p-4 bg-[#112240] border border-brand-gold text-brand-gold font-bold text-xs shadow-2xl rounded-lg animate-bounce flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-brand-gold shrink-0" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header controls breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-silver mb-1.5">
            <Link to="/admin" className="hover:text-white transition-colors">لوحة التحكم</Link>
            <span>/</span>
            <Link to="/admin/website" className="hover:text-white transition-colors">محرر الموقع</Link>
            <span>/</span>
            <span className="text-brand-gold">أقسام وجسم الصفحة</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            محرر صفحة المحتوى (Sections Visual Editor)
          </h2>
          <p className="text-xs text-brand-silver mt-1">قم بتحديث النصوص والترجمات ونفقات الاتصال وأداء الأقسام بصرياً.</p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={resetToDefault}
            className="px-3.5 py-2 bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5 rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة تعيين الافتراضي
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-brand-gold text-white font-bold text-xs hover:bg-[#b8962e] transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 rounded"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ ونشر التغييرات للموقع'}
          </button>
        </div>
      </div>

      {/* Tabs list selector & locale toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#112240] border border-white/5 p-2 rounded-lg gap-4">
        
        {/* Sections Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0A192F] p-1 rounded-md border border-white/5 shrink-0">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${activeTab === 'about' ? 'bg-brand-gold text-white' : 'text-brand-silver hover:text-white'}`}
          >
            معلومات الشركة والضمان (About)
          </button>
          <button
            onClick={() => setActiveTab('footer')}
            className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${activeTab === 'footer' ? 'bg-brand-gold text-white' : 'text-brand-silver hover:text-white'}`}
          >
            روابط وبلوكات التذييل (Footer)
          </button>
        </div>

        {/* Preview Locale Selector */}
        <div className="flex items-center gap-1 bg-[#172A45] p-1 rounded border border-white/5">
          <span className="text-[10px] text-brand-silver px-2 select-none">معاينة اللغة:</span>
          {(['ar', 'en', 'he'] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => setPreviewLocale(loc)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${previewLocale === loc ? 'bg-brand-gold text-white shadow-sm' : 'text-brand-silver hover:text-white'}`}
            >
              <Globe className="w-3 h-3" />
              {loc === 'ar' ? 'العربية' : loc === 'en' ? 'English' : 'עברית'}
            </button>
          ))}
        </div>

      </div>

      {/* High Fidelity Visual Custom Frame */}
      <div className="bg-[#0A192F] border border-white/5 rounded-xl p-8 relative shadow-2xl">
        <div className="absolute top-3 left-3 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-full z-20">
          معاينة بصرية مباشرة للقسم ({activeTab.toUpperCase()})
        </div>

        {/* Tab 1: About Section editing */}
        {activeTab === 'about' && (
          <div className="space-y-12">
            <div className="max-w-4xl mx-auto space-y-8" dir={previewLocale === 'en' ? 'ltr' : 'rtl'}>
              
              {/* Title Header editable block */}
              <div className="text-center md:text-right space-y-4">
                <EditableBlock
                  title="تعديل العنوان الرئيسي لمن نحن"
                  type="text"
                  value={siteContent.about.title}
                  onSave={(val) => updateAboutField(['title'], val)}
                >
                  <span className="text-xl md:text-2xl font-bold text-white block bg-white/5 hover:bg-white/10 p-2 cursor-pointer border border-dashed border-white/10 transition-colors">
                    {getT(siteContent.about.title)}
                  </span>
                </EditableBlock>

                <EditableBlock
                  title="تعديل العنوان الفرعي لمن نحن"
                  type="textarea"
                  value={siteContent.about.subtitle}
                  onSave={(val) => updateAboutField(['subtitle'], val)}
                >
                  <p className="text-sm text-brand-silver mb-8 leading-relaxed max-w-2xl bg-white/5 hover:bg-white/10 p-2 cursor-pointer border border-dashed border-white/10 transition-colors">
                    {getT(siteContent.about.subtitle)}
                  </p>
                </EditableBlock>
              </div>

              {/* Description body paragraphs */}
              <div className="bg-[#112240] p-6 border border-white/5 rounded-lg space-y-3">
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-wider block">سرد السيرة الذاتية وثوابت العمل (Description)</span>
                <EditableBlock
                  title="تعديل الفقرة التعريفية الطويلة"
                  type="textarea"
                  value={siteContent.about.description}
                  onSave={(val) => updateAboutField(['description'], val)}
                >
                  <p className="text-sm md:text-base text-brand-silver leading-relaxed p-3 hover:bg-white/5 transition-all border border-transparent hover:border-brand-gold/20 cursor-pointer">
                    {getT(siteContent.about.description)}
                  </p>
                </EditableBlock>
              </div>

              {/* CTA details */}
              <div className="flex justify-start">
                <EditableBlock
                  title="تعديل عنوان زر الانتقال لمن نحن"
                  type="text"
                  value={siteContent.about.buttonText}
                  onSave={(val) => updateAboutField(['buttonText'], val)}
                >
                  <span className="border border-white/20 text-white font-bold text-xs px-6 py-3 cursor-pointer hover:bg-brand-gold/10 inline-block">
                    {getT(siteContent.about.buttonText)}
                  </span>
                </EditableBlock>
              </div>

              {/* Grid block of statistics counters */}
              <div className="border-t border-white/5 pt-10">
                <span className="text-xs text-brand-gold font-bold block mb-4">تعديل الإحصائيات الأربعة الرئيسية لمن نحن:</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {siteContent.about.stats.map((item, idx) => (
                    <EditableBlock
                      key={item.id}
                      title={`تعديل عداد إحصائي: ${getT(item.label)}`}
                      type="stat"
                      value={item}
                      onSave={(val) => updateAboutStat(idx, val)}
                    >
                      <div className="bg-brand-surface p-6 border border-white/5 hover:border-brand-gold transition-colors text-center cursor-pointer select-none">
                        <p className="text-3xl font-extrabold text-white mb-2 font-sans">{item.value}</p>
                        <p className="text-xs text-brand-silver">{getT(item.label)}</p>
                      </div>
                    </EditableBlock>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Footer layout elements */}
        {activeTab === 'footer' && (
          <div className="max-w-5xl mx-auto space-y-8" dir={previewLocale === 'en' ? 'ltr' : 'rtl'}>
            
            <div className="grid md:grid-cols-3 gap-8 bg-[#112240] p-8 border border-white/5 rounded-xl">
              
              {/* Column 1: Company Logo / Pitch */}
              <div className="space-y-4">
                <EditableBlock
                  title="تعديل شعار الفوتر الرئيسي"
                  type="text"
                  value={siteContent.hero.logoText}
                  onSave={(val) => updateLogoText(val)}
                >
                  <h4 className="text-lg font-bold text-white cursor-pointer hover:text-brand-gold">{getT(siteContent.hero.logoText)}</h4>
                </EditableBlock>

                <EditableBlock
                  title="تعديل النبذة البسيطة تحت الشعار بالفوتر"
                  type="textarea"
                  value={siteContent.footer.description}
                  onSave={(val) => updateFooterField(['description'], val)}
                >
                  <p className="text-xs text-brand-silver leading-relaxed cursor-pointer hover:bg-white/5 p-2 rounded">
                    {getT(siteContent.footer.description)}
                  </p>
                </EditableBlock>
              </div>

              {/* Column 2: Showroom showroom Address details */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/10 pb-1.5 font-sans">عناوين المعرض والإدارة المصرفية</h5>
                <EditableBlock
                  title="تعديل عنوان صالة العرض"
                  type="textarea"
                  value={siteContent.contact.address}
                  onSave={(val) => updateContactField('address', val)}
                >
                  <p className="text-xs text-brand-silver cursor-pointer hover:text-white p-1.5 bg-[#0A192F] rounded">
                    📍 {getT(siteContent.contact.address)}
                  </p>
                </EditableBlock>

                <div className="opacity-40 select-none p-1.5 bg-brand-navy rounded text-[11px] text-brand-silver">
                  🏭 المصنع: (مربوط آلياً مع صالة المعرض الهندسية لتوحيد الجودة)
                </div>
              </div>

              {/* Column 3: Communication numbers */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold/10 pb-1.5 font-sans">أرقام الاتصال وقنوات المراسلة</h5>
                
                <EditableBlock
                  title="تعديل رقم هاتف خدمة العملاء والمتابعة"
                  type="text"
                  value={{ ar: siteContent.contact.phone, en: siteContent.contact.phone, he: siteContent.contact.phone }}
                  onSave={(val: any) => updateContactField('phone', typeof val === 'string' ? val : val.ar)}
                >
                  <p className="text-xs text-white/90 cursor-pointer font-bold font-sans bg-[#0A192F] p-1.5 border border-white/5">
                    📞 الهاتف: {siteContent.contact.phone}
                  </p>
                </EditableBlock>

                <EditableBlock
                  title="تعديل البريد الإلكتروني الرسمي لشركة GM Alomco"
                  type="text"
                  value={{ ar: siteContent.contact.email, en: siteContent.contact.email, he: siteContent.contact.email }}
                  onSave={(val: any) => updateContactField('email', typeof val === 'string' ? val : val.ar)}
                >
                  <p className="text-xs text-white/95 cursor-pointer font-mono p-1.5 bg-[#0A192F] border border-white/5">
                    ✉️ البريد: {siteContent.contact.email}
                  </p>
                </EditableBlock>
              </div>

            </div>

            {/* Column 4: Bottom copyright */}
            <div className="border-t border-white/5 pt-6 text-center select-none">
              <EditableBlock
                title="تعديل رسالة الحقوق والملكيات للشركة"
                type="text"
                value={siteContent.footer.copyright}
                onSave={(val) => updateFooterField(['copyright'], val)}
              >
                <p className="text-[10px] text-brand-silver font-serif p-2 cursor-pointer bg-white/5 rounded inline-block">
                  {getT(siteContent.footer.copyright)}
                </p>
              </EditableBlock>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
