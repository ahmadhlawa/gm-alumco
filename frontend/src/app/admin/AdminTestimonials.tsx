import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { deleteTestimonial, listAdminTestimonials } from '@/api/testimonials';
import type { TestimonialDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { pickAdminText } from './adminMappers';
import { useLanguage } from '@/i18n';

// Admin testimonials copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    title: 'המלצות',
    description: 'ניהול חוות הדעת של לקוחות המוצגות באתר.',
    add: 'הוספת המלצה',
    empty: 'אין עדיין המלצות.',
    confirmDeactivate: (name: string) => `להשבית את ההמלצה של "${name}"?`,
    untitled: 'ללא שם',
    cols: { client: 'לקוח', message: 'חוות דעת', rating: 'דירוג', order: 'סדר', status: 'סטטוס', actions: 'פעולות' },
  },
  en: {
    title: 'Testimonials',
    description: 'Manage the customer reviews shown on the website.',
    add: 'Add testimonial',
    empty: 'No testimonials yet.',
    confirmDeactivate: (name: string) => `Deactivate the testimonial by "${name}"?`,
    untitled: 'Untitled',
    cols: { client: 'Client', message: 'Review', rating: 'Rating', order: 'Order', status: 'Status', actions: 'Actions' },
  },
};

function Stars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, rating));
  return (
    <span className="inline-flex gap-0.5 text-brand-gold" aria-label={`${value}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-4 w-4" fill={i < value ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

export function AdminTestimonials() {
  const navigate = useNavigate();
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [items, setItems] = useState<TestimonialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    listAdminTestimonials().then(setItems).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deactivate = async (item: TestimonialDto) => {
    const name = pickAdminText(language, item.client_name_he, item.client_name_en) || copy.untitled;
    if (!window.confirm(copy.confirmDeactivate(name))) return;
    await deleteTestimonial(item.id);
    load();
  };

  return <div className="space-y-6">
    <AdminPageHeader title={copy.title} description={copy.description} action={
      <Link to="/admin/testimonials/new" className="flex items-center gap-2 rounded bg-brand-gold px-5 py-2.5 font-bold text-white"><Plus className="h-5 w-5" />{copy.add}</Link>
    } />
    {loading ? <LoadingState /> : error ? <ErrorState /> : items.length === 0 ? <EmptyState message={copy.empty} /> :
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-brand-navy">
        <table className="w-full min-w-[820px] text-start text-sm" dir={dir}>
          <thead className="border-b border-white/10 text-brand-silver"><tr><th className="p-4">{copy.cols.client}</th><th className="p-4">{copy.cols.message}</th><th className="p-4">{copy.cols.rating}</th><th className="p-4">{copy.cols.order}</th><th className="p-4">{copy.cols.status}</th><th className="p-4">{copy.cols.actions}</th></tr></thead>
          <tbody>{items.map((item) => {
            const name = pickAdminText(language, item.client_name_he, item.client_name_en) || copy.untitled;
            const position = pickAdminText(language, item.client_position_he, item.client_position_en);
            const message = pickAdminText(language, item.message_he, item.message_en);
            return <tr key={item.id} className="border-b border-white/5 align-top text-white last:border-0">
              <td className="p-4"><div className="font-bold">{name}</div>{position && <div className="mt-1 text-xs text-brand-silver">{position}</div>}</td>
              <td className="max-w-md p-4"><p className="line-clamp-2 text-brand-silver">{message || '—'}</p></td>
              <td className="p-4"><Stars rating={item.rating} /></td>
              <td className="p-4">{item.sort_order}</td>
              <td className="p-4"><AdminStatusBadge status={item.is_active} /></td>
              <td className="p-4"><AdminActionButtons onEdit={() => navigate(`/admin/testimonials/${item.id}/edit`)} onDelete={() => void deactivate(item)} /></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
  </div>;
}
