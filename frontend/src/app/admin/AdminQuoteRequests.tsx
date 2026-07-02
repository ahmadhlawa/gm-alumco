import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import {
  deleteQuoteRequest,
  listQuoteRequests,
  markQuoteRequestRead,
  updateQuoteStatus,
} from '@/api/messages';
import type { QuoteRequestDto, QuoteStatus } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { useLanguage, type Language } from '@/i18n';
import { QUOTE_STATUS_LABELS, localizeLabel } from './adminMappers';

const COPY = {
  he: {
    title: 'בקשות להצעת מחיר',
    description: 'מעקב אחר בקשות הלקוחות מהקבלה ועד להשלמה.',
    empty: 'אין בקשות להצעת מחיר.',
    openLink: 'פתיחת הקישור',
    cols: { client: 'לקוח', contact: 'פרטי קשר', type: 'סוג פרויקט / שירות', details: 'פרטים', files: 'קישור לקבצים', status: 'סטטוס' },
    labels: {
      new: 'חדש',
      open: 'פתיחת בקשת הצעת מחיר',
      delete: 'מחיקת בקשת הצעת מחיר',
      actions: 'פעולות',
      confirm: 'Delete this quote request?\n\nThis action cannot be undone.',
    },
  },
  en: {
    title: 'Quote requests',
    description: 'Track client requests from intake to completion.',
    empty: 'No quote requests.',
    openLink: 'Open link',
    cols: { client: 'Client', contact: 'Contact', type: 'Project / service type', details: 'Details', files: 'Files link', status: 'Status' },
    labels: {
      new: 'New',
      open: 'Open quote request',
      delete: 'Delete quote request',
      actions: 'Actions',
      confirm: 'Delete this quote request?\n\nThis action cannot be undone.',
    },
  },
};

const dateLocale = (language: Language) => (language === 'en' ? 'en-US' : 'he-IL');
const notifyInboxChanged = () => window.dispatchEvent(new Event('admin-notifications-updated'));

export function AdminQuoteRequests() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<QuoteRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    listQuoteRequests().then(setItems).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const change = async (id: number, status: QuoteStatus) => {
    const updated = await updateQuoteStatus(id, status);
    setItems((all) => all.map((item) => (item.id === id ? updated : item)));
  };
  const open = async (id: number) => {
    const updated = await markQuoteRequestRead(id);
    setItems((all) => all.map((item) => (item.id === id ? updated : item)));
    notifyInboxChanged();
  };
  const remove = async (id: number) => {
    if (!window.confirm(copy.labels.confirm)) return;
    await deleteQuoteRequest(id);
    setItems((all) => all.filter((item) => item.id !== id));
    notifyInboxChanged();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title={copy.title} description={copy.description} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : items.length === 0 ? (
        <EmptyState message={copy.empty} />
      ) : (
        <QuoteRequestsTable
          items={items}
          language={language}
          dir={dir}
          onChangeStatus={change}
          onOpen={open}
          onDelete={remove}
        />
      )}
    </div>
  );
}

export function QuoteRequestsTable({
  items,
  language,
  dir,
  onChangeStatus,
  onOpen,
  onDelete,
}: {
  items: QuoteRequestDto[];
  language: Language;
  dir: 'rtl' | 'ltr';
  onChangeStatus: (id: number, status: QuoteStatus) => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const copy = language === 'en' ? COPY.en : COPY.he;
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy">
      <table className="w-full min-w-[1120px] text-start text-sm" dir={dir}>
        <thead className="border-b border-white/10 text-brand-silver">
          <tr>
            <th className="p-4">{copy.cols.client}</th>
            <th className="p-4">{copy.cols.contact}</th>
            <th className="p-4">{copy.cols.type}</th>
            <th className="p-4">{copy.cols.details}</th>
            <th className="p-4">{copy.cols.files}</th>
            <th className="p-4">{copy.cols.status}</th>
            <th className="p-4">{copy.labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={`border-b border-white/5 align-top text-white last:border-0 ${!item.is_read ? 'bg-brand-gold/[0.035]' : ''}`}>
              <td className="p-4">
                <div className="font-bold">
                  {item.name}
                  {!item.is_read && <span className="ms-2 rounded-full bg-brand-gold px-2 py-0.5 text-xs font-black text-brand-navy">{copy.labels.new}</span>}
                </div>
                <div className="mt-1 text-xs text-brand-silver">{new Date(item.created_at).toLocaleDateString(dateLocale(language))}</div>
              </td>
              <td className="p-4">
                <div dir="ltr">{item.phone}</div>
                <div dir="ltr" className="text-brand-silver">{item.email || '—'}</div>
              </td>
              <td className="p-4">{item.service_type || '—'}</td>
              <td className="max-w-sm whitespace-pre-wrap p-4 text-brand-silver">{item.message || '—'}</td>
              <td className="p-4">
                {item.plans_link ? (
                  <a href={item.plans_link} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-bold text-brand-gold underline underline-offset-2 hover:text-brand-gold/80">{copy.openLink}</a>
                ) : (
                  <span className="text-brand-silver">—</span>
                )}
              </td>
              <td className="p-4">
                <select value={item.status} onChange={(e) => onChangeStatus(item.id, e.target.value as QuoteStatus)} className="rounded border border-white/10 bg-brand-surface px-3 py-2 text-white">
                  {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((value) => (
                    <option key={value} value={value}>{localizeLabel(QUOTE_STATUS_LABELS[value], language)}</option>
                  ))}
                </select>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button type="button" onClick={() => onOpen(item.id)} aria-label={copy.labels.open} className="flex h-9 w-9 items-center justify-center rounded border border-white/10 text-brand-silver transition hover:border-brand-gold/50 hover:text-brand-gold">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(item.id)} aria-label={copy.labels.delete} className="flex h-9 w-9 items-center justify-center rounded border border-red-400/20 text-red-300 transition hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
