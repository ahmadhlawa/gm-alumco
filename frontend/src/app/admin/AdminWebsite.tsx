import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  ChevronLeft,
  MousePointerClick
} from 'lucide-react';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

interface SectionCMSCard {
  id: string;
  name: string;
  description: string;
  type: 'editor' | 'link';
  path: string;
  badge: string;
  status: 'active' | 'draft';
  preview: React.ReactNode;
}

export function AdminWebsite() {
  const sections: SectionCMSCard[] = [
    {
      id: 'hero',
      name: 'العنوان الرئيسي والخلفيات (Hero Section)',
      description: 'قم بتخصيص العنوان الجذاب للواجهة، صورة البانر الخلفية، الأزرار الأساسية وإحصائيات الشريط الرئيسي.',
      type: 'editor',
      path: '/admin/website/hero',
      badge: 'المرئي المباشر ⚡',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-brand-gold/15 rounded relative p-3 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-1 left-1 w-12 h-12 bg-white/5 rounded-full filter blur-md pointer-events-none"></div>
          <div className="text-[10px] text-brand-gold font-bold">● ريادة هندسية منذ ٢٠١٤</div>
          <div className="text-xs text-white font-extrabold max-w-[80%] leading-tight truncate">نصنع أفضل واجهات الألمنيوم والزجاج</div>
          <div className="flex gap-1.5 mt-2">
            <span className="w-10 h-3 bg-brand-gold rounded-[2px] block shrink-0"></span>
            <span className="w-10 h-3 bg-white/10 rounded-[2px] block shrink-0"></span>
          </div>
        </div>
      )
    },
    {
      id: 'about',
      name: 'فقرة معلومات عن الشركة وإحصائياتها (About Section)',
      description: 'قم بتعديل الرسالة التقديمية والفقرات التعريفية، وتعيين أرقام المنجزات وعدد سنوات التميز ومميزات الضمان.',
      type: 'editor',
      path: '/admin/website/sections?section=about',
      badge: 'المرئي المباشر ⚡',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded p-3 flex flex-col justify-between">
          <div className="text-white text-xs font-bold">من نحن؟ نصنع الفروقات بأدق التفاصيل</div>
          <p className="text-[9px] text-[#8892B0] line-clamp-2">ملتزمون بتقديم حلول زجاجية وألمنيوم تتجاوز توقعات العملاء منذ عقد زمني كامل...</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-brand-navy p-1 text-center"><p className="text-xs text-white font-bold font-sans">٢٥٠+</p></div>
            <div className="bg-brand-navy p-1 text-center"><p className="text-xs text-white font-bold font-sans">١٠+</p></div>
          </div>
        </div>
      )
    },
    {
      id: 'services',
      name: 'معرض خدماتنا الهندسية (Services Section)',
      description: 'إدارة وتعديل خدمات الهندسة المعمارية، وواجهات الزجاج، التركيب والمصانع المفتوحة بالكامل.',
      type: 'link',
      path: '/admin/services',
      badge: 'قائمة بيانات 🗄️',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded p-3 flex flex-col justify-between">
          <span className="text-[10px] text-brand-silver">الخدمات النشطة: ٣</span>
          <div className="space-y-1">
            <div className="text-xs text-white p-1 bg-white/5 rounded flex justify-between"><span>واجهات Curtain Wall</span> <span className="text-[9px] text-brand-gold">نشط</span></div>
            <div className="text-xs text-white p-1 bg-white/5 rounded flex justify-between"><span>أبواب ونوافذ سحابة</span> <span className="text-[9px] text-brand-gold">نشط</span></div>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      name: 'المشاريع الفاخرة المنجزة (Showcase Projects)',
      description: 'إضافة ومتابعة مشاريع الفلل والأبراج، مع خيار وضع المشاريع المميزة على واجهة الصفحة الرئيسية.',
      type: 'link',
      path: '/admin/projects',
      badge: 'قائمة بيانات 🗄️',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded relative overflow-hidden flex items-end p-2 bg-gradient-to-t from-black to-transparent">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] bg-cover opacity-30"></div>
          <div className="relative z-10">
            <p className="text-[8px] text-brand-gold uppercase font-bold">برج الأعمال الزجاجي</p>
            <p className="text-[10px] text-white">Curtain Wall بالكامل</p>
          </div>
        </div>
      )
    },
    {
      id: 'products',
      name: 'أنظمة وكتالوجات المنتجات (Product Catalog)',
      description: 'تعديل قائمة تفاصيل قطاعات الألمنيوم، وأنظمة الزجاج الفردي والمزدوج، والمقابض والإكسسوارات.',
      type: 'link',
      path: '/admin/products',
      badge: 'قائمة بيانات 🗄️',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded p-3 grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-1 flex flex-col justify-between rounded">
            <span className="text-[10px] text-white">أنظمة نوافذ</span>
            <span className="text-[8px] text-brand-silver">سماكة ٨٠ مم</span>
          </div>
          <div className="bg-white/5 p-1 flex flex-col justify-between rounded">
            <span className="text-[10px] text-white">زجاج حراري</span>
            <span className="text-[8px] text-brand-silver">مقاوم للصدمات</span>
          </div>
        </div>
      )
    },
    {
      id: 'gallery',
      name: 'معرض الصور والأعمال (Gallery)',
      description: 'تحرير صور المشاريع وعناوينها ضمن معاينة بصرية مطابقة لشبكة العرض.',
      type: 'link',
      path: '/admin/gallery',
      badge: 'معاينة بصرية',
      status: 'active',
      preview: (
        <div className="grid h-28 grid-cols-3 gap-1 overflow-hidden rounded bg-[#112240] p-2">
          {[
            'photo-1486406146926-c627a92ad1ab',
            'photo-1600607687931-ce8e7784f183',
            'photo-1549294413-26f195200c16'
          ].map((photo) => (
            <img key={photo} src={normalizeImageUrl(`https://images.unsplash.com/${photo}?auto=format&fit=crop&q=60`)} onError={handleImageError} alt="" className="h-full w-full object-cover opacity-80" />
          ))}
        </div>
      )
    },
    {
      id: 'partners',
      name: 'شركاء النجاح الموردين (Success Partners)',
      description: 'إضافة شعارات الشركات العالمية والمصانع الموردة (Schüco, Gutmann) وإبراز الأسماء الهندسية الأكبر.',
      type: 'link',
      path: '/admin/partners',
      badge: 'إدارة الشعارات 🤝',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded p-3 flex flex-col justify-center items-center gap-1.5">
          <div className="flex gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-navy border border-brand-gold/40 flex items-center justify-center text-[10px] text-brand-gold">KH</span>
            <span className="w-8 h-8 rounded-full bg-brand-navy border border-brand-gold/40 flex items-center justify-center text-[10px] text-brand-gold">WA</span>
            <span className="w-8 h-8 rounded-full bg-brand-navy border border-brand-gold/40 flex items-center justify-center text-[10px] text-brand-gold">GU</span>
          </div>
          <span className="text-[10px] text-brand-silver">إجمالي شركاء النجاح: ٢٠</span>
        </div>
      )
    },
    {
      id: 'testimonials',
      name: 'مراجعات وآراء العملاء بالخدمة (Testimonials)',
      description: 'إدارة وتصفية شهادات ملاك العقارات والاستشاريين المعماريين لتأكيد الثقة والمصداقية.',
      type: 'link',
      path: '/admin/testimonials',
      badge: 'مستوى الثقة ⭐',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded p-3 flex flex-col justify-between">
          <span className="text-[10px] text-brand-gold">⭐⭐⭐⭐⭐</span>
          <p className="text-[8px] text-brand-silver line-clamp-2">"الالتزام بالرفع المساحي الدقيق وضمان الـ ٥ سنوات يجعل GM Alomco شريكاً حقيقياً..."</p>
          <span className="text-[8px] text-white block text-left">- م. خالد الهاشم</span>
        </div>
      )
    },
    {
      id: 'footer',
      name: 'مكونات وعناوين التذييل (Footer Area)',
      description: 'تعديل عناوين فروع الشركة ومكاتب التواصل، البريد الإلكتروني، روابط شبكات التواصل وقائمة الحقوق الحصرية.',
      type: 'editor',
      path: '/admin/footer',
      badge: 'المرئي المباشر ⚡',
      status: 'active',
      preview: (
        <div className="h-28 bg-[#112240] border border-white/5 rounded p-3 flex flex-col justify-between text-right text-[10px] text-brand-silver">
          <div className="text-white font-bold text-xs">GM Alomco للألمنيوم والزجاج</div>
          <span>المعرض: شارع الملك فيصل، مكة</span>
          <span>الهاتف: +٩٦٦ ٥٠٠٠٠٠٠٠٠</span>
          <div className="text-center font-serif text-[8px] border-t border-white/5 pt-1">جميع الحقوق محفوظة © ٢٠٢٦</div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Banner / Header */}
      <div className="p-6 bg-gradient-to-l from-brand-gold/10 via-brand-navy to-brand-navy border border-brand-gold/10 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-brand-gold/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              نظام إدارة المحتوى التفاعلي (Site Inline CMS)
            </span>
            <h2 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              بوابة التحكم البصري للموقع الإلكتروني
            </h2>
            <p className="text-sm text-brand-silver mt-1 max-w-xl">
              يمكنك هنا تعديل جميع أقسام وعناصر الموقع الإلكتروني بطريقة بصرية حية ("ما تراه هو ما سيتم تحديده"). يدعم اللغات الثلاثة (العربية، الإنجليزية، العبرية).
            </p>
          </div>
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2 bg-brand-navy border border-brand-gold/30 text-brand-gold font-bold text-xs hover:bg-brand-gold hover:text-white transition-all flex items-center gap-1.5 rounded"
          >
            <Eye className="w-4 h-4" />
            مشاهدة الموقع العام
          </Link>
        </div>
      </div>

      {/* Main Grid Checklist */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className="bg-brand-navy border border-white/5 rounded-xl p-5 hover:border-brand-gold/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.06)] transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Card Title & Badge */}
              <div className="flex items-center justify-between mb-3 text-right">
                <span className="text-xs font-semibold px-2 py-0.5 bg-brand-gold/10 text-brand-gold rounded font-sans">
                  {section.badge}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>

              {/* Graphical Preview Mockup */}
              <div className="mb-4 bg-black/40 rounded p-1 shadow-inner relative group-hover:bg-black/10 transition-colors">
                {section.preview}
                <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 bg-brand-gold text-white text-xs font-bold shadow-md flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    اضغط للتحرير التلقائي
                  </span>
                </div>
              </div>

              {/* Content Texts */}
              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {section.name}
              </h3>
              <p className="text-xs text-brand-silver leading-relaxed mb-6 line-clamp-3">
                {section.description}
              </p>
            </div>

            {/* Link Selector Buttons */}
            <div>
              <Link
                to={section.path}
                className={`w-full py-2.5 rounded font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  section.type === 'editor' 
                    ? 'bg-brand-gold/10 hover:bg-brand-gold text-brand-gold group-hover:text-white border border-brand-gold/20 hover:border-brand-gold' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                <span>{section.type === 'editor' ? 'تعديل بصري مباشر ⚡' : 'إدارة قائمة البيانات 🗄️'}</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
