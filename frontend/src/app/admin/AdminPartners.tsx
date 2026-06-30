import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Plus } from 'lucide-react';
import { deletePartner, listAdminPartners } from '@/api/partners';
import type { PartnerDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { pickAdminText } from './adminMappers';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

// Admin partners copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'שותפים',
    description: 'ניהול הלוגואים והקישורים של שותפי T.A.S.',
    add: 'הוספת שותף',
    empty: 'אין עדיין שותפים.',
    confirmDeactivate: (name: string) => `להשבית את השותף "${name}"?`,
    order: 'סדר',
    untitled: 'ללא שם',
  },
  en: {
    title: 'Partners',
    description: 'Manage the logos and links of T.A.S partners.',
    add: 'Add partner',
    empty: 'No partners yet.',
    confirmDeactivate: (name: string) => `Deactivate the partner "${name}"?`,
    order: 'Order',
    untitled: 'Untitled',
  },
};

export function AdminPartners() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<PartnerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => { setLoading(true); listAdminPartners().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const deactivate = async (item: PartnerDto) => { const name = pickAdminText(language, item.name_he, item.name_en) || copy.untitled; if (!window.confirm(copy.confirmDeactivate(name))) return; await deletePartner(item.id); load(); };

  return <div className="space-y-6">
    <AdminPageHeader title={copy.title} description={copy.description} action={<Link to="/admin/partners/new" className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white"><Plus className="h-5 w-5" />{copy.add}</Link>} />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message={copy.empty} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => {
      const name = pickAdminText(language, item.name_he, item.name_en) || copy.untitled;
      return <article key={item.id} className="flex items-center gap-4 rounded-lg border border-white/10 bg-brand-navy p-5">
        <div className="flex h-16 w-20 shrink-0 items-center justify-center bg-white p-2"><img src={normalizeImageUrl(item.logo_url)} onError={handleImageError} alt={name} className="max-h-full max-w-full object-contain" /></div>
        <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-white">{name}</h3><div className="mt-2 flex items-center gap-2"><AdminStatusBadge status={item.is_active} /><span className="text-xs text-brand-silver">{copy.order} {item.sort_order}</span>{item.website_url && <a href={item.website_url} target="_blank" rel="noreferrer" className="text-brand-gold"><ExternalLink className="h-4 w-4" /></a>}</div></div>
        <AdminActionButtons onEdit={() => navigate(`/admin/partners/${item.id}/edit`)} onDelete={() => void deactivate(item)} />
      </article>;
    })}</div>}
  </div>;
}
