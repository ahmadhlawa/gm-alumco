import { useState } from 'react';
import { EditableBlock } from '@/components/admin/EditableBlock';
import { SiteContent } from '@/data/siteContent';
import { Globe, ArrowLeft, ArrowUpRight } from 'lucide-react';

interface HeroVisualEditorProps {
  content: SiteContent['hero'];
  onChange: (updatedHero: SiteContent['hero']) => void;
}

export function HeroVisualEditor({ content, onChange }: HeroVisualEditorProps) {
  // Locale preview in the admin panel to check English/Hebrew rendering on correct layout
  const [previewLocale, setPreviewLocale] = useState<'ar' | 'en' | 'he'>('ar');

  const getT = (obj: any) => {
    return obj?.[previewLocale] || obj?.ar || '';
  };

  const updateField = (path: string[], val: any) => {
    const updated = { ...content } as any;
    
    if (path.length === 1) {
      updated[path[0]] = val;
    } else if (path.length === 2) {
      updated[path[0]] = { ...updated[path[0]], ...val };
    } else if (path.length === 3) {
      updated[path[0]][path[1]] = { ...updated[path[0]][path[1]], ...val };
    }
    onChange(updated);
  };

  const handleStatChange = (index: number, updatedStat: any) => {
    const newStats = [...content.stats];
    newStats[index] = updatedStat;
    onChange({ ...content, stats: newStats });
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Visual Editor Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#112240] border border-brand-gold/20 rounded-lg gap-4">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2 text-base">
            <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
            محرر الواجهة التفاعلي (Hero Visual Editor)
          </h3>
          <p className="text-xs text-brand-silver mt-1">تظهر التعديلات بشكل فوري على الهيكل البصري أدناه. اختر لغة المعاينة للتحقق:</p>
        </div>
        
        {/* Toggle preview languages */}
        <div className="flex items-center gap-2 bg-[#172A45] p-1 rounded-md border border-white/5">
          <button
            type="button"
            onClick={() => setPreviewLocale('ar')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1 ${previewLocale === 'ar' ? 'bg-brand-gold text-white' : 'text-brand-silver hover:text-white'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            العربية
          </button>
          <button
            type="button"
            onClick={() => setPreviewLocale('en')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1 ${previewLocale === 'en' ? 'bg-brand-gold text-white' : 'text-brand-silver hover:text-white'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            English
          </button>
          <button
            type="button"
            onClick={() => setPreviewLocale('he')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1 ${previewLocale === 'he' ? 'bg-brand-gold text-white' : 'text-brand-silver hover:text-white'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            עברית
          </button>
        </div>
      </div>

      {/* Actual Responsive High Fidelity Section Mimic */}
      <div className="border border-white/5 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-3 left-3 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest rounded-full z-30">
          لوحة معاينة حية للمتصفّح
        </div>

        {/* Hero Section Container */}
        <section className="relative min-h-[550px] lg:min-h-[620px] flex flex-col lg:flex-row overflow-hidden bg-brand-navy font-sans">
          
          {/* Background image editable block wrapper */}
          <div className="absolute inset-0 z-0 pointer-events-none lg:hidden">
            <img src={content.backgroundImage} className="w-full h-full object-cover opacity-20" alt="Background inline" />
          </div>

          <div className="lg:w-[55%] p-6 lg:p-12 flex flex-col justify-center relative z-10">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 text-right" dir={previewLocale === 'en' ? 'ltr' : previewLocale === 'he' ? 'rtl' : 'rtl'}>
              
              {/* Badge Editable */}
              <div className="flex items-center gap-3 mb-4 justify-start">
                <span className="w-10 h-px bg-brand-gold"></span>
                <EditableBlock
                  title="تعديل الشارة الترويجية (Hero Badge)"
                  type="text"
                  value={content.badge}
                  onSave={(val) => updateField(['badge'], val)}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold block py-1 px-1.5">
                    {getT(content.badge)}
                  </span>
                </EditableBlock>
              </div>

              {/* Headline Editable */}
              <div className="mb-6">
                <EditableBlock
                  title="تعديل العنوان الرئيسي (Hero Headline)"
                  type="textarea"
                  value={content.headline}
                  onSave={(val) => updateField(['headline'], val)}
                >
                  <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.15] text-white py-1 px-1.5">
                    {getT(content.headline)}
                  </h1>
                </EditableBlock>
              </div>

              {/* Subtitle Editable */}
              <div className="mb-8">
                <EditableBlock
                  title="تعديل الوصف الفرعي (Hero Subtitle / Description)"
                  type="textarea"
                  value={content.subtitle}
                  onSave={(val) => updateField(['subtitle'], val)}
                >
                  <p className="text-sm md:text-base text-brand-silver leading-relaxed max-w-lg py-1 px-1.5">
                    {getT(content.subtitle)}
                  </p>
                </EditableBlock>
              </div>

              {/* CTA Buttons Editable */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <EditableBlock
                  title="تعديل الزر الأساسي (Primary CTA Button)"
                  type="button"
                  value={content.primaryCta}
                  onSave={(val) => updateField(['primaryCta'], val)}
                >
                  <div className="bg-white text-black text-xs md:text-sm font-bold px-5 py-3 hover:bg-gray-200 cursor-pointer flex items-center gap-1.5 transition-all">
                    <span>{getT(content.primaryCta.label)}</span>
                    <ArrowLeft className="w-3.5 h-3.5 rtl:-scale-x-100" />
                  </div>
                </EditableBlock>

                <EditableBlock
                  title="تعديل الزر الثانوي (Secondary CTA Button)"
                  type="button"
                  value={content.secondaryCta}
                  onSave={(val) => updateField(['secondaryCta'], val)}
                >
                  <div className="border border-white/20 text-white text-xs md:text-sm font-bold px-5 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-1.5 transition-all">
                    <span>{getT(content.secondaryCta.label)}</span>
                  </div>
                </EditableBlock>
              </div>
              
              {/* Stats Grid Editable */}
              <div className="border-t border-white/5 pt-6 flex flex-wrap gap-6 md:gap-10">
                {content.stats.map((stat, idx) => (
                  <EditableBlock
                    key={stat.id}
                    title={`تعديل إحصائية: ${getT(stat.label)}`}
                    type="stat"
                    value={stat}
                    onSave={(val) => handleStatChange(idx, val)}
                  >
                    <div className="flex flex-col py-1 px-2 hover:bg-white/5 cursor-pointer rounded min-w-[100px]">
                      <span className="text-2xl font-bold text-white font-sans">{stat.value}</span>
                      <span className="text-[10px] uppercase tracking-wider text-brand-silver">{getT(stat.label)}</span>
                    </div>
                  </EditableBlock>
                ))}
              </div>

            </div>
          </div>

          {/* Right Banner/Featured block */}
          <div className="lg:w-[45%] min-h-[350px] lg:h-auto bg-brand-surface relative group/feature overflow-hidden border-r lg:border-r-0 lg:border-l border-white/5 flex flex-col justify-end">
            
            {/* Visual CMS Background image edit action panel */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-brand-navy/30 to-brand-navy z-10 pointer-events-none"></div>
            
            <img src={content.backgroundImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover/feature:scale-105" alt="Hero representation background" />

            <div className="absolute top-4 left-4 z-20">
              <EditableBlock
                title="تعديل صورة الخلفية للقسم الرئيسي (Hero Background)"
                type="image"
                value={content.backgroundImage}
                onSave={(val) => updateField(['backgroundImage'], val)}
              >
                <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded hover:bg-brand-gold transition-colors cursor-pointer">
                  تعديل صورة الخلفية 🖼️
                </div>
              </EditableBlock>
            </div>

            {/* Featured Project Widget Grid Editable */}
            <div className="p-4 lg:p-8 relative z-20 w-full">
              <EditableBlock
                title="تعديل مشروع مميز بالواجهة (Hero Featured Project Widget)"
                type="fields"
                value={content.featuredProject}
                fields={[
                  { key: 'badge', label: 'شارة المشروع', localized: true },
                  { key: 'title', label: 'اسم المشروع', localized: true },
                  { key: 'description', label: 'وصف المشروع', type: 'textarea', localized: true },
                  { key: 'image', label: 'رابط صورة المشروع', type: 'url' }
                ]}
                onSave={(featuredProject) => onChange({ ...content, featuredProject })}
              >
                <div className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded group cursor-pointer hover:border-brand-gold transition-colors">
                  <div className="flex justify-between items-end gap-4" dir={previewLocale === 'en' ? 'ltr' : 'rtl'}>
                    <div className="text-right flex-1 select-none">
                      <span className="text-[9px] uppercase tracking-widest text-brand-gold mb-1 block">
                        {getT(content.featuredProject.badge)}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {getT(content.featuredProject.title)}
                      </h3>
                      <p className="text-xs text-white/60 mt-1">
                        {getT(content.featuredProject.description)}
                      </p>
                    </div>
                    <div className="w-10 h-10 border border-brand-gold/50 flex items-center justify-center text-brand-gold bg-black/20 shrink-0 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </EditableBlock>
            </div>

            {/* Sidebar Rotated Labels simulation */}
            <div className="absolute top-12 left-0 z-20 flex flex-col gap-4">
              <div className="bg-brand-navy p-3 border border-l-0 border-white/10 select-none">
                <span className="text-[9px] uppercase tracking-widest opacity-40 -rotate-180 block" style={{ writingMode: 'vertical-lr' }}>Curtain Wall</span>
              </div>
              <div className="bg-brand-navy/55 p-3 border border-l-0 border-white/10 opacity-50 select-none">
                <span className="text-[9px] uppercase tracking-widest -rotate-180 block" style={{ writingMode: 'vertical-lr' }}>Windows</span>
              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
