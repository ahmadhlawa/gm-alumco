import { BrowserRouter as Router, Navigate, Routes, Route, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Home } from '@/app/Home';
import { About } from '@/app/About';
import { Services } from '@/app/Services';
import { Projects } from '@/app/Projects';
import { Products } from '@/app/Products';
import { Contact } from '@/app/Contact';
import { RequestQuote } from '@/app/RequestQuote';
import { PageHero } from '@/components/common/PageHero';
import { CTASection } from '@/components/common/CTASection';
import { LanguageProvider, useLanguage } from '@/i18n';

// Admin imports
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RequireAuth } from '@/components/admin/RequireAuth';
import { RequireSuperAdmin } from '@/components/admin/RequireSuperAdmin';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import { Dashboard } from '@/app/admin/Dashboard';
import { AdminProjects } from '@/app/admin/AdminProjects';
import { AdminAdmins } from '@/app/admin/AdminAdmins';
import { ProjectFormPage } from '@/app/admin/ProjectFormPage';
import { AdminServices } from '@/app/admin/AdminServices';
import { ServiceFormPage } from '@/app/admin/ServiceFormPage';
import { AdminLogin } from '@/app/admin/AdminLogin';
import { AdminPartners } from '@/app/admin/AdminPartners';
import { PartnerFormPage } from '@/app/admin/PartnerFormPage';
import { AdminContactMessages } from '@/app/admin/AdminContactMessages';
import { AdminQuoteRequests } from '@/app/admin/AdminQuoteRequests';
import { AdminAuditLogs } from '@/app/admin/AdminAuditLogs';

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
          <Route path="/admin" element={<RequireAuth><AdminAuthProvider><AdminLayout /></AdminAuthProvider></RequireAuth>}>
             <Route index element={<Dashboard />} />
             <Route path="projects" element={<AdminProjects />} />
             <Route path="projects/new" element={<ProjectFormPage />} />
             <Route path="projects/:id/edit" element={<ProjectFormPage />} />
             <Route path="services" element={<AdminServices />} />
             <Route path="services/new" element={<ServiceFormPage />} />
             <Route path="services/:id/edit" element={<ServiceFormPage />} />
             <Route path="partners" element={<AdminPartners />} />
             <Route path="partners/new" element={<PartnerFormPage />} />
             <Route path="partners/:id/edit" element={<PartnerFormPage />} />
             <Route path="contact-messages" element={<AdminContactMessages />} />
             <Route path="quote-requests" element={<AdminQuoteRequests />} />
             <Route path="messages" element={<Navigate to="/admin/contact-messages" replace />} />
             <Route path="admins" element={<RequireSuperAdmin><AdminAdmins /></RequireSuperAdmin>} />
             <Route path="audit-logs" element={<RequireSuperAdmin><AdminAuditLogs /></RequireSuperAdmin>} />
             <Route path="*" element={<Navigate to="/admin" replace />} />
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
