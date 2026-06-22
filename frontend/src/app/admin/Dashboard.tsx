import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ImageIcon, LayoutTemplate } from 'lucide-react';
import { getProducts, getProjects, getServices } from '@/lib/api';
import type { Product, Project, Service } from '@/types';
import { initialSiteContent } from '@/data/siteContent';
import { LoadingState } from '@/components/common/LoadingState';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { ProductCard } from '@/components/cards/ProductCard';

export function Dashboard() {
  const [content, setContent] = useState<{ services: Service[]; projects: Project[]; products: Product[] }>();

  useEffect(() => {
    Promise.all([getServices(), getProjects(), getProducts()]).then(([services, projects, products]) => {
      setContent({ services, projects, products });
    });
  }, []);

  if (!content) return <LoadingState message="جاري تحميل لوحة التحكم..." />;

  const emptyPreview = (
    <div className="flex h-64 items-center justify-center bg-brand-surface text-sm text-brand-silver">
      لا يوجد محتوى بعد
    </div>
  );

  const sections = [
    { label: 'الخدمات', path: '/admin/services', item: content.services[0] ? <ServiceCard service={content.services[0]} disableLink /> : emptyPreview },
    { label: 'المشاريع', path: '/admin/projects', item: content.projects[0] ? <ProjectCard project={content.projects[0]} disableLink /> : emptyPreview },
    { label: 'المنتجات', path: '/admin/products', item: content.products[0] ? <ProductCard product={content.products[0]} disableLink /> : emptyPreview }
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-brand-gold/20 bg-gradient-to-l from-brand-gold/10 via-brand-navy to-brand-navy p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Visual CMS Baseline</span>
            <h2 className="mt-2 text-3xl font-bold text-white">حرر الموقع من خلال ما تراه</h2>
            <p className="mt-2 max-w-2xl text-brand-silver">كل شاشة محتوى تعرض نفس البطاقات والأقسام المستخدمة في الموقع العام، مع تعديلات محلية فقط.</p>
          </div>
          <Link to="/admin/website/hero" className="flex items-center justify-center gap-2 rounded bg-brand-gold px-5 py-3 font-bold text-white hover:bg-[#b8962e]">
            <LayoutTemplate className="h-5 w-5" />
            فتح محرر الواجهة
          </Link>
        </div>
      </div>

      <Link to="/admin/website/hero" className="group block overflow-hidden rounded-xl border border-white/5 bg-brand-navy hover:border-brand-gold/50">
        <div className="grid min-h-72 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center p-8">
            <span className="mb-3 text-xs font-bold text-brand-gold">معاينة Hero</span>
            <h3 className="text-3xl font-bold leading-tight text-white">{initialSiteContent.hero.headline.ar}</h3>
            <p className="mt-4 text-brand-silver">{initialSiteContent.hero.subtitle.ar}</p>
            <span className="mt-6 flex items-center gap-2 font-bold text-brand-gold">تحرير هذا القسم <ArrowLeft className="h-4 w-4" /></span>
          </div>
          <img src={initialSiteContent.hero.backgroundImage} alt="Hero preview" className="h-full min-h-64 w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
        </div>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.path} to={section.path} className="group relative block overflow-hidden rounded-xl border border-white/5 hover:border-brand-gold/50">
            <div className="pointer-events-none">{section.item}</div>
            <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-brand-navy/95 px-4 py-3 text-sm font-bold text-white backdrop-blur">
              إدارة {section.label}
              <ArrowLeft className="h-4 w-4 text-brand-gold" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/gallery" className="flex items-center gap-4 rounded-lg border border-white/5 bg-brand-navy p-5 text-white hover:border-brand-gold/40">
          <ImageIcon className="h-8 w-8 text-brand-gold" />
          <div><h3 className="font-bold">المعرض المرئي</h3><p className="text-sm text-brand-silver">تحرير الصور والعناوين ضمن شبكة العرض.</p></div>
        </Link>
        <Link to="/admin/footer" className="flex items-center gap-4 rounded-lg border border-white/5 bg-brand-navy p-5 text-white hover:border-brand-gold/40">
          <LayoutTemplate className="h-8 w-8 text-brand-gold" />
          <div><h3 className="font-bold">تذييل الموقع</h3><p className="text-sm text-brand-silver">معاينة وتعديل بيانات التواصل والحقوق.</p></div>
        </Link>
      </div>
    </div>
  );
}
