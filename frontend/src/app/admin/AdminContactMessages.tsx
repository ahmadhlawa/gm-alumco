import { useEffect, useState } from 'react';
import { listContactMessages, updateContactStatus } from '@/api/messages';
import type { ContactMessageDto, ContactStatus } from '@/api/types';
import { CONTACT_STATUS_LABELS } from './adminMappers';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

export function AdminContactMessages() {
  const [items, setItems] = useState<ContactMessageDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { listContactMessages().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const change = async (id: number, status: ContactStatus) => { const updated = await updateContactStatus(id, status); setItems((all) => all.map((item) => item.id === id ? updated : item)); };
  return <div className="space-y-6"><AdminPageHeader title="رسائل التواصل" description="قراءة رسائل زوار الموقع وتحديث حالة المتابعة." />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message="لا توجد رسائل تواصل." /> : <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy"><table className="w-full min-w-[900px] text-right text-sm">
      <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">المرسل</th><th className="p-4">التواصل</th><th className="p-4">الرسالة</th><th className="p-4">التاريخ</th><th className="p-4">الحالة</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 align-top text-white last:border-0"><td className="p-4 font-bold">{item.name}</td><td className="p-4"><div dir="ltr">{item.email}</div><div dir="ltr" className="text-brand-silver">{item.phone || '—'}</div></td><td className="max-w-md p-4"><div className="font-medium">{item.subject}</div><p className="mt-1 whitespace-pre-wrap text-brand-silver">{item.message}</p></td><td className="p-4 text-brand-silver">{new Date(item.created_at).toLocaleDateString('ar-EG')}</td><td className="p-4"><select value={item.status} onChange={(e) => void change(item.id, e.target.value as ContactStatus)} className="rounded border border-white/10 bg-brand-surface px-3 py-2 text-white">{Object.entries(CONTACT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody>
    </table></div>}
  </div>;
}
