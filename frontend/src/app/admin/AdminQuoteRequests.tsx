import { useEffect, useState } from 'react';
import { listQuoteRequests, updateQuoteStatus } from '@/api/messages';
import type { QuoteRequestDto, QuoteStatus } from '@/api/types';
import { QUOTE_STATUS_LABELS } from './adminMappers';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

export function AdminQuoteRequests() {
  const [items, setItems] = useState<QuoteRequestDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { listQuoteRequests().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const change = async (id: number, status: QuoteStatus) => { const updated = await updateQuoteStatus(id, status); setItems((all) => all.map((item) => item.id === id ? updated : item)); };
  return <div className="space-y-6"><AdminPageHeader title="طلبات عروض الأسعار" description="متابعة طلبات العملاء من الاستلام حتى الإنجاز." />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message="لا توجد طلبات عروض أسعار." /> : <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy"><table className="w-full min-w-[1040px] text-right text-sm">
      <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">العميل</th><th className="p-4">التواصل</th><th className="p-4">نوع المشروع / الخدمة</th><th className="p-4">التفاصيل</th><th className="p-4">رابط الملفات</th><th className="p-4">الحالة</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 align-top text-white last:border-0"><td className="p-4"><div className="font-bold">{item.name}</div><div className="mt-1 text-xs text-brand-silver">{new Date(item.created_at).toLocaleDateString('ar-EG')}</div></td><td className="p-4"><div dir="ltr">{item.phone}</div><div dir="ltr" className="text-brand-silver">{item.email || '—'}</div></td><td className="p-4">{item.service_type || '—'}</td><td className="max-w-sm whitespace-pre-wrap p-4 text-brand-silver">{item.message || '—'}</td><td className="p-4">{item.plans_link ? <a href={item.plans_link} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-bold text-brand-gold underline underline-offset-2 hover:text-brand-gold/80">فتح الرابط</a> : <span className="text-brand-silver">—</span>}</td><td className="p-4"><select value={item.status} onChange={(e) => void change(item.id, e.target.value as QuoteStatus)} className="rounded border border-white/10 bg-brand-surface px-3 py-2 text-white">{Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody>
    </table></div>}
  </div>;
}
