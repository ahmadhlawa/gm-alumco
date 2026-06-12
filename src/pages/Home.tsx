import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/common/Button';
import { SectionHeader } from '@/components/common/SectionHeader';
import { CTASection } from '@/components/common/CTASection';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { TestimonialCard } from '@/components/cards/TestimonialCard';
import { ProductCard } from '@/components/cards/ProductCard';
import { SuccessPartners } from '@/components/sections/SuccessPartners';
import { getServices, getProjects, getProducts, getTestimonials } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { ShieldCheck, Ruler, Clock, LayoutTemplate } from 'lucide-react';
import { LoadingState } from '@/components/common/LoadingState';
import { Service, Project, Product, Testimonial } from '@/types';
import { loadSiteContent } from '@/data/siteContent';

export function Home() {
  const { t } = useLanguage();
  const [content] = useState(() => loadSiteContent());
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Still use mock for stats as it's static
  const stats = content.about.stats.map(stat => ({
    value: stat.value,
    label: t(stat.label.ar, stat.label.he, stat.label.en)
  }));

  useEffect(() => {
    Promise.all([
      getServices(),
      getProjects(),
      getProducts(),
      getTestimonials()
    ]).then(([svcs, projs, prods, tests]) => {
      setServices(svcs);
      setProjects(projs);
      setProducts(prods);
      setTestimonials(tests);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-navy">
        <LoadingState message={t("جاري تحميل الصفحة الرئيسية...", "טוען עמוד ראשית...")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col lg:flex-row overflow-hidden bg-brand-navy">
        <div className="lg:w-[55%] p-8 lg:p-16 flex flex-col justify-center relative">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-px bg-brand-gold"></span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                  {t(content.hero.badge.ar, content.hero.badge.he, content.hero.badge.en)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-8 text-white">
                {t(content.hero.headline.ar, content.hero.headline.he, content.hero.headline.en)}
              </h1>
              <p className="text-lg text-brand-silver max-w-lg leading-relaxed mb-10">
                {t(content.hero.subtitle.ar, content.hero.subtitle.he, content.hero.subtitle.en)}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Button href={content.hero.primaryCta.href} variant="primary" size="lg" className="bg-white text-black font-bold hover:bg-gray-200">
                  {t(content.hero.primaryCta.label.ar, content.hero.primaryCta.label.he, content.hero.primaryCta.label.en)}
                </Button>
                <Button href={content.hero.secondaryCta.href} variant="outline" size="lg" className="border-white/20 text-white font-bold hover:bg-white/5">
                  {t(content.hero.secondaryCta.label.ar, content.hero.secondaryCta.label.he, content.hero.secondaryCta.label.en)}
                </Button>
              </div>
              
              <div className="mt-16 flex flex-wrap gap-12 border-t border-white/5 pt-10">
                {content.hero.stats.map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    <span className="text-3xl font-bold text-white font-sans">{stat.value}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">
                      {t(stat.label.ar, stat.label.he, stat.label.en)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="lg:w-[45%] min-h-[400px] lg:h-auto bg-brand-surface relative group overflow-hidden border-l border-white/5 font-sans">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-navy/20 to-brand-navy z-10 pointer-events-none"></div>
           <div 
             className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110"
             style={{ backgroundImage: `url(${content.hero.backgroundImage})` }}
           ></div>
           
           <div className="absolute bottom-12 left-6 right-6 lg:left-12 lg:right-12 z-20">
             <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-sm">
               <div className="flex justify-between items-end">
                 <div>
                   <span className="text-[10px] uppercase tracking-widest text-brand-gold mb-2 block">
                     {t(content.hero.featuredProject.badge.ar, content.hero.featuredProject.badge.he, content.hero.featuredProject.badge.en)}
                   </span>
                   <h3 className="text-xl font-bold text-white">
                     {t(content.hero.featuredProject.title.ar, content.hero.featuredProject.title.he, content.hero.featuredProject.title.en)}
                   </h3>
                   <p className="text-sm text-white/60 mt-1">
                     {t(content.hero.featuredProject.description.ar, content.hero.featuredProject.description.he, content.hero.featuredProject.description.en)}
                   </p>
                 </div>
                 <div className="w-12 h-12 border border-brand-gold flex items-center justify-center text-brand-gold bg-black/20">
                   ↗
                 </div>
               </div>
             </div>
           </div>

           <div className="absolute top-12 left-0 z-20 hidden md:flex flex-col gap-4">
             <div className="bg-brand-navy p-4 border border-l-0 border-white/10">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-[10px] uppercase tracking-widest opacity-40 -rotate-180" style={{ writingMode: 'vertical-lr' }}>Curtain Wall</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2"></span>
               </div>
             </div>
             <div className="bg-brand-navy/50 p-4 border border-l-0 border-white/10 opacity-50">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-[10px] uppercase tracking-widest -rotate-180" style={{ writingMode: 'vertical-lr' }}>Windows</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2"></span>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-brand-surface">
        <div className="container mx-auto px-4">
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
                   <div className="text-4xl font-bold text-white mb-2" dir="ltr">{stat.value}</div>
                   <div className="text-brand-silver font-medium">{stat.label}</div>
                 </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-brand-navy">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <SectionHeader 
              title={t(content.services.title.ar, content.services.title.he, content.services.title.en)} 
              subtitle={t(content.services.subtitle.ar, content.services.subtitle.he, content.services.subtitle.en)}
              className="mb-0"
            />
            <Button href="/services" variant="ghost" className="hidden md:flex">
              {t('عرض كل الخدمات', 'הצג את כל השירותים')}
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, idx) => (
              <ServiceCard key={service.id} service={service} index={idx} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button href="/services" variant="outline" className="w-full">
              {t('عرض كل الخدمات', 'הצג את כל השירותים')}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-brand-surface">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title={t(content.projects.title.ar, content.projects.title.he, content.projects.title.en)} 
            subtitle={t(content.projects.subtitle.ar, content.projects.subtitle.he, content.projects.subtitle.en)}
            centered
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 6).map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/projects" variant="primary" size="lg">
              {t('تصفح معرض المشاريع', 'עיין בגלריית הפרויקטים')}
            </Button>
          </div>
        </div>
      </section>

      {/* Process / Why Choose Us */}
      <section className="py-24 bg-brand-navy text-white relative overflow-hidden">
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
