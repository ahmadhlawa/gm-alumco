import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import {
  deleteContactMessage,
  listContactMessages,
  markContactMessageRead,
  updateContactStatus,
} from '@/api/messages';
import type { ContactMessageDto, ContactStatus } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { useLanguage, type Language } from '@/i18n';
import { CONTACT_STATUS_LABELS, localizeLabel } from './adminMappers';

const COPY = {
  he: {
    title: 'הודעות צור קשר',
    description: 'קריאת הודעות מבקרי האתר ועדכון סטטוס הטיפול.',
    empty: 'אין הודעות צור קשר.',
    cols: { sender: 'שולח', contact: 'פרטי קשר', message: 'הודעה', date: 'תאריך', status: 'סטטוס' },
    labels: {
      new: 'חדש',
      open: 'פתיחת הודעת צור קשר',
      delete: 'מחיקת הודעת צור קשר',
      actions: 'פעולות',
      confirm: 'Delete this contact message?\n\nThis action cannot be undone.',
    },
  },
  en: {
    title: 'Contact messages',
    description: 'Read messages from site visitors and update their follow-up status.',
    empty: 'No contact messages.',
    cols: { sender: 'Sender', contact: 'Contact', message: 'Message', date: 'Date', status: 'Status' },
    labels: {
      new: 'New',
      open: 'Open contact message',
      delete: 'Delete contact message',
      actions: 'Actions',
      confirm: 'Delete this contact message?\n\nThis action cannot be undone.',
    },
  },
};

const dateLocale = (language: Language) => (language === 'en' ? 'en-US' : 'he-IL');
const notifyInboxChanged = () => window.dispatchEvent(new Event('admin-notifications-updated'));

export function AdminContactMessages() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<ContactMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    listContactMessages().then(setItems).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const change = async (id: number, status: ContactStatus) => {
    const updated = await updateContactStatus(id, status);
    setItems((all) => all.map((item) => (item.id === id ? updated : item)));
  };
  const open = async (id: number) => {
    const updated = await markContactMessageRead(id);
    setItems((all) => all.map((item) => (item.id === id ? updated : item)));
    notifyInboxChanged();
  };
  const remove = async (id: number) => {
    if (!window.confirm(copy.labels.confirm)) return;
    await deleteContactMessage(id);
    setItems((all) => all.filter((item) => item.id !== id));
    notifyInboxChanged();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title={copy.title} description={copy.description} />
      {loading ? (
        <LoadingState variant="table" />
      ) : error ? (
        <ErrorState />
      ) : items.length === 0 ? (
        <EmptyState message={copy.empty} />
      ) : (
        <ContactMessagesTable
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

export function ContactMessagesTable({
  items,
  language,
  dir,
  onChangeStatus,
  onOpen,
  onDelete,
}: {
  items: ContactMessageDto[];
  language: Language;
  dir: 'rtl' | 'ltr';
  onChangeStatus: (id: number, status: ContactStatus) => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const copy = language === 'en' ? COPY.en : COPY.he;
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy">
      <table className="w-full min-w-[1040px] text-start text-sm" dir={dir}>
        <thead className="border-b border-white/10 text-brand-silver">
          <tr>
            <th className="p-4">{copy.cols.sender}</th>
            <th className="p-4">{copy.cols.contact}</th>
            <th className="p-4">{copy.cols.message}</th>
            <th className="p-4">{copy.cols.date}</th>
            <th className="p-4">{copy.cols.status}</th>
            <th className="p-4">{copy.labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={`border-b border-white/5 align-top text-white last:border-0 ${!item.is_read ? 'bg-brand-gold/[0.035]' : ''}`}>
              <td className="p-4 font-bold">
                {item.name}
                {!item.is_read && <span className="ms-2 rounded-full bg-brand-gold px-2 py-0.5 text-xs font-black text-brand-navy">{copy.labels.new}</span>}
              </td>
              <td className="p-4">
                <div dir="ltr">{item.email}</div>
                <div dir="ltr" className="text-brand-silver">{item.phone || '—'}</div>
              </td>
              <td className="max-w-md p-4">
                <div className="font-medium">{item.subject}</div>
                <p className="mt-1 whitespace-pre-wrap text-brand-silver">{item.message}</p>
              </td>
              <td className="p-4 text-brand-silver">{new Date(item.created_at).toLocaleDateString(dateLocale(language))}</td>
              <td className="p-4">
                <select value={item.status} onChange={(e) => onChangeStatus(item.id, e.target.value as ContactStatus)} className="rounded border border-white/10 bg-brand-surface px-3 py-2 text-white">
                  {(Object.keys(CONTACT_STATUS_LABELS) as ContactStatus[]).map((value) => (
                    <option key={value} value={value}>{localizeLabel(CONTACT_STATUS_LABELS[value], language)}</option>
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
