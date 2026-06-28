import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/common/Button';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { ProductCard } from '@/components/cards/ProductCard';
import { SuccessPartners } from '@/components/sections/SuccessPartners';
import { FeaturedProjectsShowcase } from '@/components/sections/FeaturedProjectsShowcase';
import { GeometricHero } from '@/components/sections/GeometricHero';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';
import { getServices, getProjects, getProducts, getTestimonials } from '@/lib/api';
import { useLanguage } from '@/i18n';
import { ShieldCheck, Ruler, Clock, LayoutTemplate } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { Service, Project, Product, Testimonial } from '@/types';
import { loadSiteContent } from '@/data/siteContent';
import { defaultPublicStats, type PublicStatsContent } from '@/data/publicStats';
import { getPublicStatsContent } from '@/api/content';
import {
  HOME_SECTION_IDS,
  scrollToHomeSection,
  type HomeSectionId,
} from '@/lib/homeNavigation';

export function Home() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [content] = useState(() => loadSiteContent());
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStatsContent>(defaultPublicStats);
  const [loading, setLoading] = useState(true);

  const stats = publicStats.aboutPreviewStats.map(stat => ({
    value: stat.value,
    label: t(stat.label.ar, stat.label.he, stat.label.en),
    suffix: stat.suffix ?? '',
  }));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getServices(language),
      getProjects(language),
      getProducts(language),
      getTestimonials(language),
      getPublicStatsContent()
    ]).then(([svcs, projs, prods, tests, statsContent]) => {
      setServices(svcs);
      setProjects(projs);
      setProducts(prods);
      setTestimonials(tests);
      setPublicStats(statsContent);
    }).catch(() => {
      setServices([]);
      setProjects([]);
      setProducts([]);
      setTestimonials([]);
      setPublicStats(defaultPublicStats);
    }).finally(() => setLoading(false));
  }, [language]);

  // Cross-route navbar clicks scroll after API-backed homepage sections render.
  const scrollTarget = (location.state as { scrollTo?: string } | null)?.scrollTo;
  useEffect(() => {
    if (loading || !HOME_SECTION_IDS.includes(scrollTarget as HomeSectionId)) return;
    requestAnimationFrame(() => scrollToHomeSection(scrollTarget as HomeSectionId));
    // Clear the navigation state so the scroll does not repeat on refresh/back.
    window.history.replaceState({}, '');
  }, [loading, scrollTarget]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-navy">
        <LoadingState message={t("جاري تحميل الصفحة الرئيسية...", "טוען עמוד ראשית...")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <GeometricHero stats={publicStats.heroStats} valueChips={publicStats.valueChips} heroSince={publicStats.heroSince} />

      {/* About Preview */}
      <section id="about" className="relative isolate scroll-mt-24 overflow-hidden py-24 bg-brand-surface">
        {/* Decorative architectural backdrop — subtle, navy-washed for readability */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-about.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.16]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-surface/95 via-brand-surface/85 to-brand-navy/75"
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader 
                title={t(content.about.title.ar, content.about.title.he, content.about.title.en)}
                subtitle={t(content.about.subtitle.ar, content.about.subtitle.he, content.about.subtitle.en)}
              />
              <p className="text-brand-silver mb-8 leading-relaxed text-lg">
                {t(content.about.description.ar, content.about.description.he, content.about.description.en)}
              </p>
              <Button href="/about" variant="outline">
                {t(content.about.buttonText.ar, content.about.buttonText.he, content.about.buttonText.en)}
              </Button>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6 font-sans">
              {stats.map((stat, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-brand-navy p-8 border border-white/5 text-center hover:border-brand-gold transition-colors block"
                 >
                   <div className="text-4xl font-bold text-white mb-2" dir="ltr">{stat.value}{stat.suffix}</div>
                   <div className="text-brand-silver font-medium">{stat.label}</div>
                 </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesShowcase
        services={services}
        title={t(content.services.title.ar, content.services.title.he, content.services.title.en)}
        subtitle={t(content.services.subtitle.ar, content.services.subtitle.he, content.services.subtitle.en)}
        emptyMessage={t('لا توجد خدمات متاحة حالياً.', 'אין שירותים זמינים כרגע.')}
        actionLabel={t('اطلب استشارة', 'בקש ייעוץ')}
      />

      {/* Featured Projects */}
      <FeaturedProjectsShowcase projects={projects} />

      {/* Process / Why Choose Us */}
      <section className="py-24 bg-brand-navy text-white relative isolate overflow-hidden">
        {/* Aluminum & glass facade backdrop — subtle texture behind the grid */}
        <img
          aria-hidden
          src="/images/backgrounds/tas-bg-process.webp"
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-navy/90 via-brand-navy/80 to-brand-navy/95"
        />
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionHeader 
            title={t("منهجية العمل", "איך אנחנו עובדים")}
            subtitle={t("نتبع خطوات مدروسة لضمان تنفيذ مشروعك بأعلى المعايير.", "אנו עוקבים אחר צעדים זהירים כדי להבטיח את הסטנדרטים הגבוהים ביותר.")}
            light
            centered
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t("الاستشارة والتصميم", "ייעوץ ועיצוב"), desc: t("دراسة المتطلبات وتقديم مقترحات معمارية هندسية.", "לימוד דרישות והגשת הצעות הנדסיות."), icon: Ruler },
              { title: t("الرفع المساحي", "מדידה מסחרית"), desc: t("قياسات دقيقة للموقع باستخدام أحدث الأجهزة.", "מדידות מדויקות לאתר באמצעות המכשירים העдכניים."), icon: ShieldCheck },
              { title: t("التصنيع الممتاز", "ייצור מצטיין"), desc: t("تصنيع عالي الجودة في ورشنا المجهزة.", "ייצור בגובה רב בסדנאות המצוידות שלנו."), icon: LayoutTemplate },
              { title: t("التركيب والضمان", "התקנה ואחريות"), desc: t("تركيب احترافي وتسليم مع شهادة ضمان.", "התקנה מקצועית ואספקה עם תעודת אחריות."), icon: Clock },
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-surface/5 border border-white/10 p-8 backdrop-blur-sm hover:bg-brand-surface/10 transition-colors"
              >
                <step.icon className="w-12 h-12 text-brand-gold mb-6" />
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-brand-navy">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t(content.products.title.ar, content.products.title.he, content.products.title.en)} 
            subtitle={t(content.products.subtitle.ar, content.products.subtitle.he, content.products.subtitle.en)}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {products.slice(0, 4).map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
             ))}
          </div>
          <div className="mt-10 text-center">
             <Button href="/products" variant="outline">{t('عرض كتيب المنتجات', 'הצג מפרט מוצרים')}</Button>
          </div>
        </div>
      </section>

      {/* Success Partners */}
      <SuccessPartners />

      {/* Testimonials */}
      <section className="py-24 bg-brand-surface">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t(content.testimonials.title.ar, content.testimonials.title.he, content.testimonials.title.en)}
            centered
          />
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
