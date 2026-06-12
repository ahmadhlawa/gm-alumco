import React, { useState } from 'react';
import { HeroVisualEditor } from '@/components/admin/visual-editors/HeroVisualEditor';
import { loadSiteContent, saveSiteContent, SiteContent } from '@/data/siteContent';
import { Link } from 'react-router-dom';
import { Save, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';

export function AdminWebsiteHero() {
  const [siteContent, setSiteContent] = useState<SiteContent>(() => loadSiteContent());
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleHeroChange = (updatedHero: SiteContent['hero']) => {
    setSiteContent((prev) => ({
      ...prev,
      hero: updatedHero,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveSiteContent(siteContent);
      setIsSaving(false);
      setToast({
        show: true,
        msg: '✅ تم حفظ تغييرات الواجهة (Hero Section) بنجاح! تم تطبيقها فوراً على الموقع العام.',
      });
      setTimeout(() => setToast({ show: false, msg: '' }), 4000);
    }, 800);
  };

  const resetToDefault = () => {
    if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين الواجهة للمحتوى الافتراضي؟')) {
      localStorage.removeItem('ofok_site_content');
      setSiteContent(loadSiteContent());
      setToast({
        show: true,
        msg: '🔄 تم إعادة تعيين البيانات إلى المحتوى الهندسي الافتراضي.',
      });
      setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Toast Alert floating */}
      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50 p-4 bg-[#112240] border border-brand-gold text-brand-gold font-bold text-xs shadow-2xl rounded-lg animate-bounce flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-brand-gold shrink-0" />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Navigation Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-silver mb-1.5">
            <Link to="/admin" className="hover:text-white transition-colors">لوحة التحكم</Link>
            <span>/</span>
            <Link to="/admin/website" className="hover:text-white transition-colors">محرر الموقع</Link>
            <span>/</span>
            <span className="text-brand-gold">محرر القسم الرئيسي</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            خصائص وتصميم القسم الرئيسي (Hero Section)
          </h2>
          <p className="text-xs text-brand-silver mt-1">تعديل العناوين والشارات والأجهزة الترويجية التي تشكّل الانطباع الأول لشركة أفق الألمنيوم.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
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
            {isSaving ? 'جاري التسجيل...' : 'حفظ التغييرات للموقع'}
          </button>
        </div>
      </div>

      {/* Hero Visual CMS Render */}
      <HeroVisualEditor
        content={siteContent.hero}
        onChange={handleHeroChange}
      />

    </div>
  );
}
