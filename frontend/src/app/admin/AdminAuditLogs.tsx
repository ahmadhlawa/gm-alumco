import { useEffect, useState } from 'react';
import { listAuditLogs } from '@/api/auditLogs';
import type { AuditLogDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage, type Language } from '@/i18n';

// Admin audit log copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'יומן פעילות',
    description: 'יומן לקריאה בלבד של הפעולות הניהוליות החשובות.',
    empty: 'אין פעילות מתועדת.',
    formerAdmin: 'מנהל קודם',
    cols: { actor: 'מבצע', action: 'פעולה', entity: 'סוג רשומה', id: 'מזהה', date: 'תאריך' },
  },
  en: {
    title: 'Audit log',
    description: 'A read-only log of the most important admin operations.',
    empty: 'No recorded activity.',
    formerAdmin: 'Former admin',
    cols: { actor: 'Actor', action: 'Action', entity: 'Entity type', id: 'ID', date: 'Date' },
  },
};

const dateLocale = (language: Language) => (language === 'en' ? 'en-US' : 'he-IL');

export function AdminAuditLogs() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<AuditLogDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { listAuditLogs().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><AdminPageHeader title={copy.title} description={copy.description} />
    {loading ? <LoadingState variant="table" /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message={copy.empty} /> : <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy"><table className="w-full min-w-[760px] text-start text-sm" dir={dir}>
      <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">{copy.cols.actor}</th><th className="p-4">{copy.cols.action}</th><th className="p-4">{copy.cols.entity}</th><th className="p-4">{copy.cols.id}</th><th className="p-4">{copy.cols.date}</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 text-white last:border-0"><td className="p-4"><div className="font-bold">{item.actor_name || copy.formerAdmin}</div><div dir="ltr" className="text-xs text-brand-silver">{item.actor_email || '—'}</div></td><td className="p-4">{item.action}</td><td className="p-4">{item.entity_type || '—'}</td><td className="p-4" dir="ltr">{item.entity_id || '—'}</td><td className="p-4 text-brand-silver">{new Date(item.created_at).toLocaleString(dateLocale(language))}</td></tr>)}</tbody>
    </table></div>}
  </div>;
}
