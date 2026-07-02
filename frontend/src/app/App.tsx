import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { Home } from '@/app/Home';
import { About } from '@/app/About';
import { Services } from '@/app/Services';
import { Projects } from '@/app/Projects';
import { Contact } from '@/app/Contact';
import { RequestQuote } from '@/app/RequestQuote';
import { PageHero } from '@/components/common/PageHero';
import { AdminLanguageProvider, LanguageProvider, useLanguage } from '@/i18n';

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
import { AdminTestimonials } from '@/app/admin/AdminTestimonials';
import { TestimonialFormPage } from '@/app/admin/TestimonialFormPage';
import { AdminContactMessages } from '@/app/admin/AdminContactMessages';
import { AdminQuoteRequests } from '@/app/admin/AdminQuoteRequests';
import { AdminAuditLogs } from '@/app/admin/AdminAuditLogs';
import { AdminPublicStats } from '@/app/admin/AdminPublicStats';

const PlaceholderPage = ({ title }: { title: string }) => {
  const { t } = useLanguage();
  return (
  <div className="bg-brand-navy min-h-screen">
      <PageHero title={title} />
      <section className="py-24 container mx-auto px-4 text-center">
         <h2 className="text-3xl font-bold text-white mb-8">{t('בקרוב', "Coming soon")}</h2>
         <p className="text-xl text-brand-silver">{t('הדף בבנייה.', "This page is under construction.")}</p>
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
          {/* Admin Routes — wrapped in their own language provider so the
              admin/login UI language is independent of the public site. */}
          <Route path="/admin/login" element={<AdminLanguageProvider><AdminLogin /></AdminLanguageProvider>} />
          <Route path="/admin" element={<AdminLanguageProvider><RequireAuth><AdminAuthProvider><AdminLayout /></AdminAuthProvider></RequireAuth></AdminLanguageProvider>}>
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
             <Route path="testimonials" element={<AdminTestimonials />} />
             <Route path="testimonials/new" element={<TestimonialFormPage />} />
             <Route path="testimonials/:id/edit" element={<TestimonialFormPage />} />
             <Route path="contact-messages" element={<AdminContactMessages />} />
             <Route path="quote-requests" element={<AdminQuoteRequests />} />
             <Route path="public-stats" element={<AdminPublicStats />} />
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
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/request-quote" element={<RequestQuote />} />
                  <Route path="/careers" element={<PlaceholderPage title={t("קריירה", "Careers")} />} />
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
