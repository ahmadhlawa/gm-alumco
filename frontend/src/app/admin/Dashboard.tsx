import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Layers,
  Package,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Plus,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '@/api/dashboard';
import { listContactMessages, listQuoteRequests } from '@/api/messages';
import type { ContactMessageDto, QuoteRequestDto } from '@/api/types';
import { useIsSuperAdmin } from '@/components/admin/AdminAuthProvider';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

const byNewest = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

export function Dashboard() {
  const isSuperAdmin = useIsSuperAdmin();
  const [stats, setStats] = useState<DashboardStats>();
  const [messages, setMessages] = useState<ContactMessageDto[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getDashboardStats(), listContactMessages(), listQuoteRequests()])
      .then(([s, m, q]) => {
        setStats(s);
        setMessages(byNewest(m));
        setQuotes(byNewest(q));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="جاري تحميل لوحة التحكم..." />;
  if (error || !stats) return <ErrorState />;

  const newMessages = stats.contact_messages.new ?? 0;
  const newQuotes = stats.quote_requests.new ?? 0;

  const statCards = [
    { title: 'المشاريع', value: stats.projects, icon: Briefcase },
    { title: 'الخدمات', value: stats.services, icon: Layers },
    { title: 'المنتجات', value: stats.products, icon: Package },
    { title: 'المعرض', value: stats.gallery, icon: ImageIcon },
    { title: 'رسائل جديدة', value: newMessages, icon: MessageSquare },
    { title: 'طلبات عروض جديدة', value: newQuotes, icon: FileText },
  ];

  const quickActions = [
    { label: 'مشروع جديد', to: '/admin/projects/new', icon: Plus },
    { label: 'إدارة الخدمات', to: '/admin/services', icon: Layers },
    { label: 'عرض الرسائل', to: '/admin/messages', icon: MessageSquare },
    ...(isSuperAdmin ? [{ label: 'إدارة المدراء', to: '/admin/admins', icon: Users }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <AdminStatCard key={card.title} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-white">إجراءات سريعة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-brand-navy p-4 text-white transition-colors hover:border-brand-gold/40"
            >
              <action.icon className="h-6 w-6 text-brand-gold" />
              <span className="font-bold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentList
          title="أحدث الرسائل"
          to="/admin/messages"
          empty="لا توجد رسائل."
          items={messages.map((m) => ({
            id: m.id,
            primary: m.name,
            secondary: m.subject || m.message,
            isNew: m.status === 'new',
            created_at: m.created_at,
          }))}
        />
        <RecentList
          title="أحدث طلبات العروض"
          to="/admin/messages"
          empty="لا توجد طلبات."
          items={quotes.map((q) => ({
            id: q.id,
            primary: q.name,
            secondary: q.service_type || q.message || '—',
            isNew: q.status === 'new',
            created_at: q.created_at,
          }))}
        />
      </div>
    </div>
  );
}

interface RecentItem {
  id: number;
  primary: string;
  secondary: string | null;
  isNew: boolean;
  created_at: string;
}

function RecentList({ title, to, empty, items }: { title: string; to: string; empty: string; items: RecentItem[] }) {
  return (
    <div className="rounded-xl border border-white/5 bg-brand-navy p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        <Link to={to} className="flex items-center gap-1 text-sm font-bold text-brand-gold">
          عرض الكل <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-brand-silver">{empty}</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{item.primary}</p>
                <p className="truncate text-sm text-brand-silver">{item.secondary}</p>
              </div>
              {item.isNew && (
                <span className="shrink-0 rounded bg-brand-gold/10 px-2 py-1 text-xs font-bold text-brand-gold">
                  جديد
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
