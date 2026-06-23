import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { deleteService, listAdminServices } from '@/api/services';
import type { ServiceDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

export function AdminServices() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    listAdminServices().then(setItems).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deactivate = async (item: ServiceDto) => {
    if (!window.confirm(`تعطيل خدمة "${item.title_ar}"؟`)) return;
    await deleteService(item.id);
    load();
  };

  return <div className="space-y-6">
    <AdminPageHeader title="الخدمات" description="إدارة خدمات T.A.S المعروضة في الموقع." action={
      <Link to="/admin/services/new" className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white"><Plus className="h-5 w-5" />إضافة خدمة</Link>
    } />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message="لا توجد خدمات بعد." /> :
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">الخدمة</th><th className="p-4">السعر الابتدائي</th><th className="p-4">الترتيب</th><th className="p-4">الحالة</th><th className="p-4">الإجراءات</th></tr></thead>
          <tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/5 text-white last:border-0">
            <td className="p-4"><div className="flex items-center gap-3"><img src={normalizeImageUrl(item.image_url)} onError={handleImageError} alt={item.title_ar} className="h-12 w-16 shrink-0 rounded object-cover" /><div className="min-w-0"><div className="font-bold">{item.title_ar}</div><div className="mt-1 max-w-md truncate text-brand-silver">{item.description_ar || '—'}</div></div></div></td>
            <td className="p-4" dir="ltr">{item.starting_price ?? '—'}</td><td className="p-4">{item.sort_order}</td><td className="p-4"><AdminStatusBadge status={item.is_active} /></td>
            <td className="p-4"><AdminActionButtons onEdit={() => navigate(`/admin/services/${item.id}/edit`)} onDelete={() => void deactivate(item)} /></td>
          </tr>)}</tbody>
        </table>
      </div>}
  </div>;
}
