import { useEffect, useState } from 'react';
import { listQuoteRequests, updateQuoteStatus } from '@/api/messages';
import type { QuoteRequestDto, QuoteStatus } from '@/api/types';
import { QUOTE_STATUS_LABELS, localizeLabel } from './adminMappers';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage, type Language } from '@/i18n';

// Admin quote requests copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'בקשות להצעת מחיר',
    description: 'מעקב אחר בקשות הלקוחות מהקבלה ועד להשלמה.',
    empty: 'אין בקשות להצעת מחיר.',
    openLink: 'פתיחת הקישור',
    cols: { client: 'לקוח', contact: 'פרטי קשר', type: 'סוג פרויקט / שירות', details: 'פרטים', files: 'קישור לקבצים', status: 'סטטוס' },
  },
  en: {
    title: 'Quote requests',
    description: 'Track client requests from intake to completion.',
    empty: 'No quote requests.',
    openLink: 'Open link',
    cols: { client: 'Client', contact: 'Contact', type: 'Project / service type', details: 'Details', files: 'Files link', status: 'Status' },
  },
};

const dateLocale = (language: Language) => (language === 'en' ? 'en-US' : 'he-IL');

export function AdminQuoteRequests() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<QuoteRequestDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { listQuoteRequests().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const change = async (id: number, status: QuoteStatus) => { const updated = await updateQuoteStatus(id, status); setItems((all) => all.map((item) => item.id === id ? updated : item)); };
  return <div className="space-y-6"><AdminPageHeader title={copy.title} description={copy.description} />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message={copy.empty} /> : <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy"><table className="w-full min-w-[1040px] text-start text-sm" dir={dir}>
      <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">{copy.cols.client}</th><th className="p-4">{copy.cols.contact}</th><th className="p-4">{copy.cols.type}</th><th className="p-4">{copy.cols.details}</th><th className="p-4">{copy.cols.files}</th><th className="p-4">{copy.cols.status}</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 align-top text-white last:border-0"><td className="p-4"><div className="font-bold">{item.name}</div><div className="mt-1 text-xs text-brand-silver">{new Date(item.created_at).toLocaleDateString(dateLocale(language))}</div></td><td className="p-4"><div dir="ltr">{item.phone}</div><div dir="ltr" className="text-brand-silver">{item.email || '—'}</div></td><td className="p-4">{item.service_type || '—'}</td><td className="max-w-sm whitespace-pre-wrap p-4 text-brand-silver">{item.message || '—'}</td><td className="p-4">{item.plans_link ? <a href={item.plans_link} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-bold text-brand-gold underline underline-offset-2 hover:text-brand-gold/80">{copy.openLink}</a> : <span className="text-brand-silver">—</span>}</td><td className="p-4"><select value={item.status} onChange={(e) => void change(item.id, e.target.value as QuoteStatus)} className="rounded border border-white/10 bg-brand-surface px-3 py-2 text-white">{(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((value) => <option key={value} value={value}>{localizeLabel(QUOTE_STATUS_LABELS[value], language)}</option>)}</select></td></tr>)}</tbody>
    </table></div>}
  </div>;
}
