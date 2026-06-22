import { useEffect, useState } from 'react';
import { listAuditLogs } from '@/api/auditLogs';
import type { AuditLogDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

export function AdminAuditLogs() {
  const [items, setItems] = useState<AuditLogDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  useEffect(() => { listAuditLogs().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><AdminPageHeader title="سجل النشاط" description="سجل قراءة فقط لأهم العمليات الإدارية." />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message="لا يوجد نشاط مسجل." /> : <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy"><table className="w-full min-w-[760px] text-right text-sm">
      <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">المنفذ</th><th className="p-4">الإجراء</th><th className="p-4">نوع السجل</th><th className="p-4">المعرف</th><th className="p-4">التاريخ</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 text-white last:border-0"><td className="p-4"><div className="font-bold">{item.actor_name || 'مدير سابق'}</div><div dir="ltr" className="text-xs text-brand-silver">{item.actor_email || '—'}</div></td><td className="p-4">{item.action}</td><td className="p-4">{item.entity_type || '—'}</td><td className="p-4" dir="ltr">{item.entity_id || '—'}</td><td className="p-4 text-brand-silver">{new Date(item.created_at).toLocaleString('ar-EG')}</td></tr>)}</tbody>
    </table></div>}
  </div>;
}
