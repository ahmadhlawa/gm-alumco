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

const newest = <T extends { created_at: string }>(items: T[]) => [...items].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
const countStatuses = (values: Record<string, number>) => Object.values(values).reduce((total, value) => total + value, 0);

export function Dashboard() {
  const { admin, loading: authLoading } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';
  const [stats, setStats] = useState<DashboardStats>();
  const [messages, setMessages] = useState<ContactMessageDto[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestDto[]>([]);
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true); setError(false);
    const activity = isSuperAdmin ? listAuditLogs(8).then((data) => setLogs(newest(data))) : Promise.all([listContactMessages(), listQuoteRequests()]).then(([m, q]) => { setMessages(newest(m)); setQuotes(newest(q)); });
    Promise.all([getDashboardStats(), activity]).then(([data]) => setStats(data)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [authLoading, isSuperAdmin]);

  if (authLoading || loading) return <LoadingState message="جارٍ تحميل لوحة التحكم..." />;
  if (error || !stats) return <ErrorState />;

  const cards = [
    { title: 'إجمالي المشاريع النشطة', value: stats.projects, icon: Briefcase },
    { title: 'مشاريع داخل البلاد', value: stats.local_projects, icon: Briefcase },
    { title: 'مشاريع خارج البلاد', value: stats.international_projects, icon: Globe2 },
    { title: 'المشاريع المميزة', value: stats.featured_projects, icon: Star },
    { title: 'الخدمات النشطة', value: stats.services, icon: Layers },
    { title: 'الشركاء النشطون', value: stats.partners, icon: Handshake },
    { title: 'رسائل غير مؤرشفة', value: countStatuses(stats.contact_messages), icon: MessageSquare },
    { title: 'طلبات عروض غير مؤرشفة', value: countStatuses(stats.quote_requests), icon: ClipboardList },
  ];
  const actions = [
    { label: 'إضافة مشروع', to: '/admin/projects/new', icon: Plus },
    { label: 'إضافة خدمة', to: '/admin/services/new', icon: Layers },
    { label: 'إضافة شريك', to: '/admin/partners/new', icon: Handshake },
    { label: 'عرض الرسائل', to: '/admin/contact-messages', icon: MessageSquare },
    ...(isSuperAdmin ? [{ label: 'إدارة المدراء', to: '/admin/admins', icon: Users }] : []),
  ];

  return <div className="space-y-8">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <AdminStatCard key={card.title} {...card} />)}</div>
    <section><h2 className="mb-3 text-lg font-bold text-white">إجراءات سريعة</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{actions.map((action) => <Link key={action.to} to={action.to} className="flex items-center gap-3 rounded border border-white/10 bg-brand-navy p-4 font-bold text-white hover:border-brand-gold/50"><action.icon className="h-5 w-5 text-brand-gold" />{action.label}</Link>)}</div></section>
    {isSuperAdmin ? <ActivityTable title="أحدث النشاطات" rows={logs.map((log) => ({ id: log.id, primary: log.actor_name || 'مدير سابق', secondary: `${log.action} · ${log.entity_type || 'system'}`, date: log.created_at }))} /> : <div className="grid gap-6 xl:grid-cols-2"><ActivityTable title="أحدث رسائل التواصل" rows={messages.map((item) => ({ id: item.id, primary: item.name, secondary: item.message, date: item.created_at }))} /><ActivityTable title="أحدث طلبات الأسعار" rows={quotes.map((item) => ({ id: item.id, primary: item.name, secondary: item.service_type || item.message || '—', date: item.created_at }))} /></div>}
  </div>;
}

function ActivityTable({ title, rows }: { title: string; rows: Array<{ id: number; primary: string; secondary: string; date: string }> }) {
  return <section><h2 className="mb-3 text-lg font-bold text-white">{title}</h2><div className="overflow-hidden rounded-lg border border-white/10 bg-brand-navy">{rows.length === 0 ? <p className="p-8 text-center text-brand-silver">لا توجد بيانات حديثة.</p> : <ul className="divide-y divide-white/5">{rows.map((row) => <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="font-bold text-white">{row.primary}</p><p className="truncate text-sm text-brand-silver">{row.secondary}</p></div><time className="shrink-0 text-xs text-brand-silver">{new Date(row.date).toLocaleDateString('ar-EG')}</time></li>)}</ul>}</div></section>;
}
