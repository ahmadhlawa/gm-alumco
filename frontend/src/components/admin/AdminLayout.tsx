import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/api/auth';
import {
  listContactMessages,
  listQuoteRequests,
  markAllContactMessagesRead,
  markAllQuoteRequestsRead,
  markContactMessageRead,
  markQuoteRequestRead,
} from '@/api/messages';
import type { ContactMessageDto, QuoteRequestDto } from '@/api/types';
import { LogOut, Menu, X, ExternalLink, Globe } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminNotificationBell, type AdminNotificationItem } from '@/components/admin/AdminNotificationBell';
import { getAdminNavigation } from '@/components/admin/adminNavigation';
import { getNextPublicLanguage, useLanguage } from '@/i18n';

// Admin layout chrome — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: { dashboard: 'לוח הבקרה', backToSite: 'חזרה לאתר', logout: 'התנתקות', switchLanguage: 'מעבר לאנגלית', menu: 'תפריט ניווט' },
  en: { dashboard: 'Dashboard', backToSite: 'Back to site', logout: 'Log out', switchLanguage: 'Switch to Hebrew', menu: 'Navigation menu' },
};

const MOBILE_SIDEBAR_ID = 'admin-mobile-sidebar';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'AD';
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { language, dir, setLanguage } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [contactMessages, setContactMessages] = useState<ContactMessageDto[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequestDto[]>([]);

  const items = getAdminNavigation(admin?.role ?? 'admin', language);
  const bottomAdminPaths = new Set(['/admin/admins', '/admin/audit-logs']);
  const mainItems = items.filter((item) => !bottomAdminPaths.has(item.path));
  const bottomAdminItems = items.filter((item) => bottomAdminPaths.has(item.path));
  const isItemActive = (path: string) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(`${path}/`));
  const activeItem = [...items].sort((a, b) => b.path.length - a.path.length).find((item) => isItemActive(item.path));

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/admin/login', { replace: true });
  };

  const refreshNotifications = useCallback(async () => {
    const [messages, quotes] = await Promise.all([listContactMessages(), listQuoteRequests()]);
    setContactMessages(messages);
    setQuoteRequests(quotes);
  }, []);

  useEffect(() => {
    void refreshNotifications().catch(() => undefined);
    const onInboxChanged = () => void refreshNotifications().catch(() => undefined);
    window.addEventListener('admin-notifications-updated', onInboxChanged);
    return () => window.removeEventListener('admin-notifications-updated', onInboxChanged);
  }, [refreshNotifications]);

  const notifications = useMemo<AdminNotificationItem[]>(() => {
    const contactItems: AdminNotificationItem[] = contactMessages
      .filter((item) => !item.is_read && item.status !== 'ARCHIVED')
      .map((item) => ({
        id: item.id,
        kind: 'contact',
        title: language === 'en' ? 'New Contact Message' : 'הודעת צור קשר חדשה',
        primary: item.name,
        preview: item.subject || item.message,
        created_at: item.created_at,
        is_read: item.is_read,
      }));
    const quoteItems: AdminNotificationItem[] = quoteRequests
      .filter((item) => !item.is_read && item.status !== 'ARCHIVED')
      .map((item) => ({
        id: item.id,
        kind: 'quote',
        title: language === 'en' ? 'New Quote Request' : 'בקשת הצעת מחיר חדשה',
        primary: item.service_type || item.name,
        preview: item.message || item.phone,
        created_at: item.created_at,
        is_read: item.is_read,
      }));
    return [...contactItems, ...quoteItems].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);
  }, [contactMessages, language, quoteRequests]);
  const unreadNotificationCount = contactMessages.filter((item) => !item.is_read && item.status !== 'ARCHIVED').length
    + quoteRequests.filter((item) => !item.is_read && item.status !== 'ARCHIVED').length;

  const handleNotificationOpen = useCallback(async (notification: AdminNotificationItem) => {
    if (notification.kind === 'contact') {
      await markContactMessageRead(notification.id);
      navigate('/admin/contact-messages');
    } else {
      await markQuoteRequestRead(notification.id);
      navigate('/admin/quote-requests');
    }
    setIsNotificationsOpen(false);
    await refreshNotifications();
  }, [navigate, refreshNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    await Promise.all([markAllContactMessagesRead(), markAllQuoteRequestsRead()]);
    setIsNotificationsOpen(false);
    await refreshNotifications();
  }, [refreshNotifications]);

  // Escape closes the mobile/tablet drawer.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  // Not using Tailwind's `ltr:`/`rtl:` variants here: those match ANY ancestor
  // with a given `dir` attribute (not just the nearest one), so they break once
  // the admin area's own direction differs from the public site's outer `dir`
  // wrapper. Compute the closed-state slide direction explicitly instead.
  const closedTranslateClass = dir === 'rtl' ? 'translate-x-full' : '-translate-x-full';

  const navItemClass = (isActive = false) =>
    `flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-start text-sm transition-colors ${
      isActive ? 'bg-brand-gold/10 text-brand-gold' : 'text-brand-silver hover:bg-white/5 hover:text-white'
    }`;

  // Exclude login from layout
  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  return (
    <div
      className="relative flex h-screen overflow-hidden bg-linear-to-br from-[#050b16] via-brand-navy to-[#152c4f] text-brand-text font-sans"
      dir={dir}
    >
      {/* Ambient mixed-color glow + faint geometric grid — replaces the old flat admin background, no photos */}
      <div aria-hidden className="pointer-events-none absolute -top-20 end-6 -z-10 h-56 w-56 rounded-full bg-brand-gold/[0.14] blur-[80px] sm:h-72 sm:w-72 lg:-top-32 lg:end-10 lg:h-[28rem] lg:w-[28rem] lg:blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute bottom-[-8%] start-6 -z-10 h-56 w-56 rounded-full bg-brand-silver/[0.12] blur-[80px] sm:h-72 sm:w-72 lg:bottom-[-10%] lg:start-10 lg:h-[26rem] lg:w-[26rem] lg:blur-[100px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] bg-[size:56px_56px]"
      />

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 right-4 z-[60] bg-brand-navy p-2 rounded border border-white/10"
        onClick={() => setIsMobileMenuOpen((open) => !open)}
        aria-label={copy.menu}
        aria-expanded={isMobileMenuOpen}
        aria-controls={MOBILE_SIDEBAR_ID}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar — fixed off-canvas drawer below lg, sticky in-flow sidebar at lg+.
          Mobile: anchored to the leading edge (left in LTR, right in RTL) via the
          logical `start-0`/`border-e` utilities, which resolve from this admin
          subtree's own nearest `dir`, not the public site's outer `dir`. */}
      <aside
        id={MOBILE_SIDEBAR_ID}
        className={`fixed top-0 start-0 z-50 flex h-dvh w-72 flex-col overflow-hidden bg-brand-navy border-e border-white/10 shrink-0 transition-transform duration-300 lg:sticky lg:start-auto lg:w-64 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : closedTranslateClass}`}
      >
        <div className="shrink-0 px-5 py-4 border-b border-white/10 flex items-center gap-3">
           <img src="/images/ATS-logo.png" alt="T.A.S" className="h-8 w-auto object-contain" />
           <span className="font-bold text-xl text-white">T.A.S</span>
        </div>

        <nav className="admin-scrollbar flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <div className="space-y-1">
            {mainItems.map((item) => {
              const isActive = isItemActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={navItemClass(isActive)}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="font-bold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3 space-y-1">
          {bottomAdminItems.map((item) => {
            const isActive = isItemActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={navItemClass(isActive)}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-bold">{item.label}</span>
              </Link>
            );
          })}
           <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass(false)}>
              <ExternalLink className="w-5 h-5 shrink-0" />
              <span className="font-medium">{copy.backToSite}</span>
           </Link>
           <button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-start text-sm text-red-400 transition-colors hover:bg-red-400/10">
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="font-medium">{copy.logout}</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-scrollbar min-h-0 flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain p-6 pb-24 lg:p-10 lg:pb-24">
        {/* Top Header Mocking */}
        <header className="flex justify-between items-center mb-10 pb-6 pr-20 border-b border-white/5 lg:pr-0">
          <h1 className="text-2xl font-bold text-white">{activeItem?.label ?? copy.dashboard}</h1>
          <div className="flex items-center gap-4">
             <AdminNotificationBell
               language={language}
               notifications={notifications}
               unreadCount={unreadNotificationCount}
               isOpen={isNotificationsOpen}
               onToggle={() => setIsNotificationsOpen((open) => !open)}
               onClose={() => setIsNotificationsOpen(false)}
               onNotificationOpen={(notification) => void handleNotificationOpen(notification)}
               onMarkAllRead={() => void handleMarkAllRead()}
             />
             <button
               type="button"
               onClick={() => setLanguage(getNextPublicLanguage(language))}
               aria-label={copy.switchLanguage}
               title={copy.switchLanguage}
               className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-brand-silver transition-colors hover:bg-white/10 hover:text-white"
             >
               <Globe className="h-4 w-4" />
               <span>{language === 'he' ? 'EN' : 'HE'}</span>
             </button>
             <div className="text-start hidden sm:block">
               <p className="text-sm font-bold text-white">{admin?.full_name ?? '—'}</p>
               <p className="text-xs text-brand-silver" dir="ltr">{admin?.email ?? ''}</p>
             </div>
             <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-bold text-white">
                {admin ? initials(admin.full_name) : 'AD'}
             </div>
          </div>
        </header>

        <Outlet />
      </main>
      
      {/* Backdrop for mobile/tablet drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
