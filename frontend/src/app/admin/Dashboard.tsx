import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardList, Globe2, Handshake, Layers, MessageSquare, Plus, Star, Users } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
import { listContactMessages, listQuoteRequests } from '@/api/messages';
import { listAuditLogs } from '@/api/auditLogs';
import type { AuditLogDto, ContactMessageDto, QuoteRequestDto } from '@/api/types';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useLanguage, type Language } from '@/i18n';

// Dashboard copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    loading: 'טוען את לוח הבקרה…',
    cards: {
      projects: 'סך הפרויקטים הפעילים',
      local: 'פרויקטים בארץ',
      international: 'פרויקטים בחו״ל',
      featured: 'פרויקטים נבחרים',
      services: 'שירותים פעילים',
      partners: 'שותפים פעילים',
      messages: 'הודעות שלא בארכיון',
      quotes: 'בקשות הצעה שלא בארכיון',
    },
    actions: {
      addProject: 'הוספת פרויקט',
      addService: 'הוספת שירות',
      addPartner: 'הוספת שותף',
      viewMessages: 'צפייה בהודעות',
      manageAdmins: 'ניהול מנהלים',
    },
    quickActions: 'פעולות מהירות',
    latestActivity: 'פעילות אחרונה',
    latestMessages: 'הודעות צור קשר אחרונות',
    latestQuotes: 'בקשות הצעה אחרונות',
    noData: 'אין נתונים אחרונים.',
    formerAdmin: 'מנהל קודם',
  },
  en: {
    loading: 'Loading the dashboard…',
    cards: {
      projects: 'Total active projects',
      local: 'Local projects',
      international: 'International projects',
      featured: 'Featured projects',
      services: 'Active services',
      partners: 'Active partners',
      messages: 'Unarchived messages',
      quotes: 'Unarchived quote requests',
    },
    actions: {
      addProject: 'Add project',
      addService: 'Add service',
      addPartner: 'Add partner',
      viewMessages: 'View messages',
      manageAdmins: 'Manage admins',
    },
    quickActions: 'Quick actions',
    latestActivity: 'Latest activity',
    latestMessages: 'Latest contact messages',
    latestQuotes: 'Latest quote requests',
    noData: 'No recent data.',
    formerAdmin: 'Former admin',
  },
};

const dateLocale = (language: Language) => (language === 'en' ? 'en-US' : 'he-IL');

const newest = <T extends { created_at: string }>(items: T[]) => [...items].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
const countStatuses = (values: Record<string, number>) => Object.values(values).reduce((total, value) => total + value, 0);

export async function loadDashboardData(isSuperAdmin: boolean): Promise<{
  stats: DashboardStats;
  messages: ContactMessageDto[];
  quotes: QuoteRequestDto[];
  logs: AuditLogDto[];
}> {
  const emptyActivity = { messages: [], quotes: [], logs: [] };
  const activity = isSuperAdmin
    ? listAuditLogs(8)
        .then((data) => ({ ...emptyActivity, logs: newest(data) }))
        .catch(() => emptyActivity)
    : Promise.all([listContactMessages(), listQuoteRequests()])
        .then(([messages, quotes]) => ({ messages: newest(messages), quotes: newest(quotes), logs: [] }))
        .catch(() => emptyActivity);
  const [stats, activityData] = await Promise.all([getDashboardStats(), activity]);
  return { stats, ...activityData };
}

export function Dashboard() {
  const { admin, loading: authLoading } = useAdminAuth();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const unreadLabel = language === 'en' ? 'New' : 'חדש';
  const isSuperAdmin = admin?.role === 'super_admin';
  const [stats, setStats] = useState<DashboardStats>();
  const [messages, setMessages] = useState<ContactMessageDto[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestDto[]>([]);
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true); setError(false);
    loadDashboardData(isSuperAdmin)
      .then((data) => {
        setStats(data.stats);
        setMessages(data.messages);
        setQuotes(data.quotes);
        setLogs(data.logs);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [authLoading, isSuperAdmin]);

  if (authLoading || loading) return <LoadingState variant="dashboard" />;
  if (error || !stats) return <ErrorState />;

  const cards = [
    { title: copy.cards.projects, value: stats.projects, icon: Briefcase },
    { title: copy.cards.local, value: stats.local_projects, icon: Briefcase },
    { title: copy.cards.international, value: stats.international_projects, icon: Globe2 },
    { title: copy.cards.featured, value: stats.featured_projects, icon: Star },
    { title: copy.cards.services, value: stats.services, icon: Layers },
    { title: copy.cards.partners, value: stats.partners, icon: Handshake },
    { title: copy.cards.messages, value: countStatuses(stats.contact_messages), icon: MessageSquare, unreadCount: stats.unread_contact_messages, unreadLabel },
    { title: copy.cards.quotes, value: countStatuses(stats.quote_requests), icon: ClipboardList, unreadCount: stats.unread_quote_requests, unreadLabel },
  ];
  const actions = [
    { label: copy.actions.addProject, to: '/admin/projects/new', icon: Plus },
    { label: copy.actions.addService, to: '/admin/services/new', icon: Layers },
    { label: copy.actions.addPartner, to: '/admin/partners/new', icon: Handshake },
    { label: copy.actions.viewMessages, to: '/admin/contact-messages', icon: MessageSquare },
    ...(isSuperAdmin ? [{ label: copy.actions.manageAdmins, to: '/admin/admins', icon: Users }] : []),
  ];

  return <div className="space-y-8">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <AdminStatCard key={card.title} {...card} />)}</div>
    <section><h2 className="mb-3 text-lg font-bold text-white">{copy.quickActions}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{actions.map((action) => <Link key={action.to} to={action.to} className="flex items-center gap-3 rounded border border-white/10 bg-brand-navy p-4 font-bold text-white hover:border-brand-gold/50"><action.icon className="h-5 w-5 text-brand-gold" />{action.label}</Link>)}</div></section>
    {isSuperAdmin ? <ActivityTable title={copy.latestActivity} emptyLabel={copy.noData} locale={dateLocale(language)} rows={logs.map((log) => ({ id: log.id, primary: log.actor_name || copy.formerAdmin, secondary: `${log.action} · ${log.entity_type || 'system'}`, date: log.created_at }))} /> : <div className="grid gap-6 xl:grid-cols-2"><ActivityTable title={copy.latestMessages} emptyLabel={copy.noData} locale={dateLocale(language)} rows={messages.map((item) => ({ id: item.id, primary: item.name, secondary: item.message, date: item.created_at }))} /><ActivityTable title={copy.latestQuotes} emptyLabel={copy.noData} locale={dateLocale(language)} rows={quotes.map((item) => ({ id: item.id, primary: item.name, secondary: item.service_type || item.message || '—', date: item.created_at }))} /></div>}
  </div>;
}

function ActivityTable({ title, rows, emptyLabel, locale }: { title: string; rows: Array<{ id: number; primary: string; secondary: string; date: string }>; emptyLabel: string; locale: string }) {
  return <section><h2 className="mb-3 text-lg font-bold text-white">{title}</h2><div className="overflow-hidden rounded-lg border border-white/10 bg-brand-navy">{rows.length === 0 ? <p className="p-8 text-center text-brand-silver">{emptyLabel}</p> : <ul className="divide-y divide-white/5">{rows.map((row) => <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="font-bold text-white">{row.primary}</p><p className="truncate text-sm text-brand-silver">{row.secondary}</p></div><time className="shrink-0 text-xs text-brand-silver">{new Date(row.date).toLocaleDateString(locale)}</time></li>)}</ul>}</div></section>;
}
