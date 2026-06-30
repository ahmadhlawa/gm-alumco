import { useEffect, useState } from 'react';
import { listContactMessages, updateContactStatus } from '@/api/messages';
import type { ContactMessageDto, ContactStatus } from '@/api/types';
import { CONTACT_STATUS_LABELS, localizeLabel } from './adminMappers';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage, type Language } from '@/i18n';

// Admin contact messages copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'הודעות צור קשר',
    description: 'קריאת הודעות מבקרי האתר ועדכון סטטוס הטיפול.',
    empty: 'אין הודעות צור קשר.',
    cols: { sender: 'שולח', contact: 'פרטי קשר', message: 'הודעה', date: 'תאריך', status: 'סטטוס' },
  },
  en: {
    title: 'Contact messages',
    description: 'Read messages from site visitors and update their follow-up status.',
    empty: 'No contact messages.',
    cols: { sender: 'Sender', contact: 'Contact', message: 'Message', date: 'Date', status: 'Status' },
  },
};

const dateLocale = (language: Language) => (language === 'en' ? 'en-US' : 'he-IL');

export function AdminContactMessages() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<ContactMessageDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { listContactMessages().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const change = async (id: number, status: ContactStatus) => { const updated = await updateContactStatus(id, status); setItems((all) => all.map((item) => item.id === id ? updated : item)); };
  return <div className="space-y-6"><AdminPageHeader title={copy.title} description={copy.description} />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message={copy.empty} /> : <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy"><table className="w-full min-w-[900px] text-start text-sm" dir={dir}>
      <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">{copy.cols.sender}</th><th className="p-4">{copy.cols.contact}</th><th className="p-4">{copy.cols.message}</th><th className="p-4">{copy.cols.date}</th><th className="p-4">{copy.cols.status}</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 align-top text-white last:border-0"><td className="p-4 font-bold">{item.name}</td><td className="p-4"><div dir="ltr">{item.email}</div><div dir="ltr" className="text-brand-silver">{item.phone || '—'}</div></td><td className="max-w-md p-4"><div className="font-medium">{item.subject}</div><p className="mt-1 whitespace-pre-wrap text-brand-silver">{item.message}</p></td><td className="p-4 text-brand-silver">{new Date(item.created_at).toLocaleDateString(dateLocale(language))}</td><td className="p-4"><select value={item.status} onChange={(e) => void change(item.id, e.target.value as ContactStatus)} className="rounded border border-white/10 bg-brand-surface px-3 py-2 text-white">{(Object.keys(CONTACT_STATUS_LABELS) as ContactStatus[]).map((value) => <option key={value} value={value}>{localizeLabel(CONTACT_STATUS_LABELS[value], language)}</option>)}</select></td></tr>)}</tbody>
    </table></div>}
  </div>;
}
