import { Eye, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/i18n';

interface AdminActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const COPY = {
  he: { view: 'צפייה', edit: 'עריכה', delete: 'מחיקה' },
  en: { view: 'View', edit: 'Edit', delete: 'Delete' },
};

export function AdminActionButtons({ onView, onEdit, onDelete }: AdminActionButtonsProps) {
  const { language } = useLanguage();
  const c = language === 'en' ? COPY.en : COPY.he;
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <button
          onClick={onView}
          className="p-2 bg-[#172A45] border border-white/5 rounded text-blue-400 hover:bg-blue-500/10 transition-colors"
          title={c.view}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 bg-[#172A45] border border-white/5 rounded text-brand-gold hover:bg-brand-gold/10 transition-colors"
          title={c.edit}
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 bg-[#172A45] border border-white/5 rounded text-red-400 hover:bg-red-500/10 transition-colors"
          title={c.delete}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
