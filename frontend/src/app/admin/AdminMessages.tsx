import { useEffect, useState } from 'react';
import { MessageSquare, Briefcase } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  listContactMessages,
  listQuoteRequests,
  updateContactStatus,
  updateQuoteStatus
} from '@/api/messages';
import type {
  ContactMessageDto,
  ContactStatus,
  QuoteRequestDto,
  QuoteStatus
} from '@/api/types';

type Row =
  | { kind: 'contact'; data: ContactMessageDto }
  | { kind: 'quote'; data: QuoteRequestDto };

const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: 'جديد',
  read: 'مقروء',
  archived: 'مؤرشف'
};

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  new: 'جديد',
  in_progress: 'قيد المعالجة',
  completed: 'مكتمل',
  archived: 'مؤرشف'
};

function formatDate(value: string): string {
  return value ? value.slice(0, 10) : '';
}

export function AdminMessages() {
  const [filter, setFilter] = useState<'all' | 'quote' | 'contact'>('all');
  const [contacts, setContacts] = useState<ContactMessageDto[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([listContactMessages(), listQuoteRequests()])
      .then(([contactData, quoteData]) => {
        setContacts(contactData);
        setQuotes(quoteData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const rows: Row[] = [
    ...contacts.map((data) => ({ kind: 'contact' as const, data })),
    ...quotes.map((data) => ({ kind: 'quote' as const, data }))
  ].sort((a, b) => b.data.created_at.localeCompare(a.data.created_at));

  const filteredRows = rows.filter((row) => filter === 'all' || row.kind === filter);

  const handleContactStatus = async (id: number, status: ContactStatus) => {
    const updated = await updateContactStatus(id, status);
    setContacts((items) => items.map((item) => (item.id === id ? updated : item)));
  };

  const handleQuoteStatus = async (id: number, status: QuoteStatus) => {
    const updated = await updateQuoteStatus(id, status);
    setQuotes((items) => items.map((item) => (item.id === id ? updated : item)));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الرسائل والطلبات"
        description="إدارة رسائل التواصل وطلبات التسعير الواردة"
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm rounded ${filter === 'all' ? 'bg-brand-gold text-[#0A192F] font-bold' : 'bg-[#112240] text-gray-400 hover:text-white border border-white/5'}`}>كل الطلبات</button>
        <button onClick={() => setFilter('quote')} className={`px-4 py-2 text-sm rounded ${filter === 'quote' ? 'bg-brand-gold text-[#0A192F] font-bold' : 'bg-[#112240] text-gray-400 hover:text-white border border-white/5'}`}>طلبات تسعير</button>
        <button onClick={() => setFilter('contact')} className={`px-4 py-2 text-sm rounded ${filter === 'contact' ? 'bg-brand-gold text-[#0A192F] font-bold' : 'bg-[#112240] text-gray-400 hover:text-white border border-white/5'}`}>رسائل تواصل</button>
      </div>

      {loading ? (
        <LoadingState message="جاري تحميل الرسائل..." />
      ) : error ? (
        <ErrorState />
      ) : filteredRows.length === 0 ? (
        <EmptyState message="لا توجد رسائل أو طلبات حالياً." />
      ) : (
        <div className="bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-brand-silver">
            <thead className="bg-[#172A45] text-white">
              <tr>
                <th className="p-4 font-bold">المرسل / التاريخ</th>
                <th className="p-4 font-bold">النوع</th>
                <th className="p-4 font-bold">التفاصيل</th>
                <th className="p-4 font-bold text-left">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${row.kind}-${row.data.id}`} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-medium text-white">{row.data.name}</div>
                    <div className="text-xs text-gray-500 mt-1" dir="ltr">{row.data.email}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(row.data.created_at)}</div>
                  </td>
                  <td className="p-4">
                    {row.kind === 'quote' ? (
                      <div className="flex items-center gap-2 text-brand-gold">
                        <Briefcase className="w-4 h-4" /> طلب تسعير
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-400">
                        <MessageSquare className="w-4 h-4" /> رسالة عامة
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {row.kind === 'quote' ? (
                      <div>
                        {row.data.service_type && <div>الخدمة: {row.data.service_type}</div>}
                        {row.data.message && <div className="truncate max-w-[220px] text-gray-400">{row.data.message}</div>}
                      </div>
                    ) : (
                      <div>
                        {row.data.subject && <div className="text-white">{row.data.subject}</div>}
                        <div className="truncate max-w-[220px] text-gray-400">{row.data.message}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-left">
                    {row.kind === 'quote' ? (
                      <select
                        value={row.data.status}
                        onChange={(e) => handleQuoteStatus(row.data.id, e.target.value as QuoteStatus)}
                        className="bg-[#0A192F] border border-white/10 rounded px-3 py-1 text-white text-sm"
                      >
                        {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value} className="bg-[#0A192F]">{label}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={row.data.status}
                        onChange={(e) => handleContactStatus(row.data.id, e.target.value as ContactStatus)}
                        className="bg-[#0A192F] border border-white/10 rounded px-3 py-1 text-white text-sm"
                      >
                        {Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value} className="bg-[#0A192F]">{label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
