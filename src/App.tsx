import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Home } from '@/pages/Home';
import { About } from '@/pages/About';
import { Services } from '@/pages/Services';
import { Projects } from '@/pages/Projects';
import { Products } from '@/pages/Products';
import { Contact } from '@/pages/Contact';
import { RequestQuote } from '@/pages/RequestQuote';
import { PageHero } from '@/components/common/PageHero';
import { CTASection } from '@/components/common/CTASection';
import { LanguageProvider, useLanguage } from '@/lib/i18n';

// Admin imports
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/pages/admin/Dashboard';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { ProjectFormPage } from '@/pages/admin/ProjectFormPage';
import { AdminServices } from '@/pages/admin/AdminServices';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminGallery } from '@/pages/admin/AdminGallery';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminPartners } from '@/pages/admin/AdminPartners';
import { AdminTestimonials } from '@/pages/admin/AdminTestimonials';
import { AdminBlog } from '@/pages/admin/AdminBlog';
import { AdminClients } from '@/pages/admin/AdminClients';
import { PlaceholderAdminPage } from '@/pages/admin/PlaceholderAdminPage';
import { AdminWebsite } from '@/pages/admin/AdminWebsite';
import { AdminWebsiteHero } from '@/pages/admin/AdminWebsiteHero';
import { AdminWebsiteSections } from '@/pages/admin/AdminWebsiteSections';

// Dynamic Placeholder
const DynamicDetailsPage = ({ basePath, baseTitle }: { basePath: string, baseTitle: string }) => {
  const { slug } = useParams();
  const { t } = useLanguage();
  
  return (
    <div className="bg-brand-navy min-h-screen">
      <PageHero 
        title={`${baseTitle} - ${slug}`} 
        breadcrumbs={[{ label: baseTitle, path: `/${basePath}` }, { label: String(slug), path: '#' }]}
      />
      <section className="py-24 container mx-auto px-4 max-w-4xl text-center">
         <h2 className="text-3xl font-bold text-white mb-8">{t('تفاصيل قيد التجهيز', 'פרטים בהכנה')}</h2>
         <p className="text-xl text-brand-silver leading-relaxed mb-12">
            {t('هذه الصفحة مخصصة لعرض التفاصيل الكاملة (صور الموقع، المخططات، المواصفات التقنية). سيتم إضافتها قريباً كجزء من الهيكل الشامل.', 'דף זה מיועד להראות פרטים מלאים. הוא יתווסף בקרוב כחלק מהמבנה המקיף.')}
         </p>
      </section>
      <CTASection />
    </div>
  );
};

const PlaceholderPage = ({ title }: { title: string }) => {
  const { t } = useLanguage();
  return (
  <div className="bg-brand-navy min-h-screen">
      <PageHero title={title} />
      <section className="py-24 container mx-auto px-4 text-center">
         <h2 className="text-3xl font-bold text-white mb-8">{t('قريباً', 'בקרוב')}</h2>
         <p className="text-xl text-brand-silver">{t('الصفحة قيد الإنشاء.', 'הדף בבנייה.')}</p>
      </section>
  </div>
  );
};

function AppContent() {
  const { dir, t } = useLanguage();
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-brand-surface text-brand-text font-sans" dir={dir}>
        
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Dashboard />} />
             <Route path="website" element={<AdminWebsite />} />
             <Route path="website/hero" element={<AdminWebsiteHero />} />
             <Route path="website/sections" element={<AdminWebsiteSections />} />
             <Route path="projects" element={<AdminProjects />} />
             <Route path="projects/new" element={<ProjectFormPage />} />
             <Route path="projects/:id/edit" element={<ProjectFormPage />} />
             <Route path="gallery" element={<AdminGallery />} />
             <Route path="services" element={<AdminServices />} />
             <Route path="products" element={<AdminProducts />} />
             <Route path="partners" element={<AdminPartners />} />
             <Route path="testimonials" element={<AdminTestimonials />} />
             <Route path="blog" element={<AdminBlog />} />
             <Route path="clients" element={<AdminClients />} />
             <Route path="messages" element={<AdminMessages />} />
             <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:slug" element={<DynamicDetailsPage basePath="services" baseTitle={t("الخدمات", "שירותים")} />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:slug" element={<DynamicDetailsPage basePath="projects" baseTitle={t("المشاريع", "פרויקטים")} />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<DynamicDetailsPage basePath="products" baseTitle={t("المنتجات", "מוצרים")} />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/request-quote" element={<RequestQuote />} />
                  <Route path="/careers" element={<PlaceholderPage title={t("الوظائف", "קריירה")} />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppButton />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
