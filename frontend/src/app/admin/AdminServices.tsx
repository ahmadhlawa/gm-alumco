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
import { pickAdminText } from './adminMappers';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

// Admin services copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'שירותים',
    description: 'ניהול השירותים של T.A.S המוצגים באתר.',
    add: 'הוספת שירות',
    empty: 'אין עדיין שירותים.',
    confirmDeactivate: (name: string) => `להשבית את השירות "${name}"?`,
    untitled: 'ללא שם',
    cols: { service: 'שירות', price: 'מחיר התחלתי', order: 'סדר', status: 'סטטוס', actions: 'פעולות' },
  },
  en: {
    title: 'Services',
    description: 'Manage the T.A.S services shown on the website.',
    add: 'Add service',
    empty: 'No services yet.',
    confirmDeactivate: (name: string) => `Deactivate the service "${name}"?`,
    untitled: 'Untitled',
    cols: { service: 'Service', price: 'Starting price', order: 'Order', status: 'Status', actions: 'Actions' },
  },
};

export function AdminServices() {
  const navigate = useNavigate();
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    listAdminServices().then(setItems).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deactivate = async (item: ServiceDto) => {
    const name = pickAdminText(language, item.title_he, item.title_en) || copy.untitled;
    if (!window.confirm(copy.confirmDeactivate(name))) return;
    await deleteService(item.id);
    load();
  };

  return <div className="space-y-6">
    <AdminPageHeader title={copy.title} description={copy.description} action={
      <Link to="/admin/services/new" className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white"><Plus className="h-5 w-5" />{copy.add}</Link>
    } />
    {loading ? <LoadingState variant="table" /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message={copy.empty} /> :
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy">
        <table className="w-full min-w-[760px] text-start text-sm" dir={dir}>
          <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">{copy.cols.service}</th><th className="p-4">{copy.cols.price}</th><th className="p-4">{copy.cols.order}</th><th className="p-4">{copy.cols.status}</th><th className="p-4">{copy.cols.actions}</th></tr></thead>
          <tbody>{items.map((item) => {
            const title = pickAdminText(language, item.title_he, item.title_en) || copy.untitled;
            const description = pickAdminText(language, item.description_he, item.description_en);
            return <tr key={item.id} className="border-b border-white/5 text-white last:border-0">
              <td className="p-4"><div className="flex items-center gap-3"><img src={normalizeImageUrl(item.image_url)} onError={handleImageError} alt={title} className="h-12 w-16 shrink-0 rounded object-cover" /><div className="min-w-0"><div className="font-bold">{title}</div><div className="mt-1 max-w-md truncate text-brand-silver">{description || '—'}</div></div></div></td>
              <td className="p-4" dir="ltr">{item.starting_price ?? '—'}</td><td className="p-4">{item.sort_order}</td><td className="p-4"><AdminStatusBadge status={item.is_active} /></td>
              <td className="p-4"><AdminActionButtons onEdit={() => navigate(`/admin/services/${item.id}/edit`)} onDelete={() => void deactivate(item)} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
  </div>;
}
